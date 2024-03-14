#!/usr/bin/env node

import { cacheDir, logsDir, manifestDir } from "../../config/fs";
import { manpageURLs } from "../manpage-url";
import { fetchSpecifiersList } from "./systemd-specifier-list";
import {
    print,
    SimpleHttpCache,
    resolveURL,
    JsonFileWriter,
    enableHTMLSupportedInMarkdown,
} from "../../utils/crawler-utils";
import { ManifestItem } from "../types-manifest";
import { fetchDirectivesList } from "./systemd-directive-list";
import { fetchDirectiveDetailsFromManPage } from "./systemd-directive-details";
import { wellknownManPages } from "./utils/wellknown-manpages";
import { resolve } from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { HintDataChanges } from "./systemd-changes";
import { main as fetchSpecialUtils } from "./systemd-special-units";

class ManifestWriter extends JsonFileWriter<ManifestItem> {
    nextIds = { docs: 1, sections: 1 };
    from: HintDataChanges;
    constructor(name: string) {
        super(resolve(manifestDir, name + ".json"));
        if (!existsSync(manifestDir)) mkdirSync(manifestDir);
        this.from = HintDataChanges.fromFile(this.filePath);
    }
    getChanges(version?: number) {
        return HintDataChanges.getChanges(this.from, HintDataChanges.fromFile(this.filePath), version);
    }
}

let jsonFile: JsonFileWriter<ManifestItem> | undefined;
main().catch((error) => {
    if (jsonFile) jsonFile.close();
    console.error(error.stack);
});
async function main() {
    SimpleHttpCache.init(cacheDir);
    enableHTMLSupportedInMarkdown();

    await fetchSpecialUtils();

    let verstr: string | undefined;
    let version: number | undefined;
    const mtx = manpageURLs.base.match(/\/man\/(\d+|latest)/i);
    if (mtx) {
        verstr = mtx[1];
        version = parseInt(verstr, 10);
        if (!Number.isSafeInteger(version)) version = undefined;
    }

    const specifiers = await fetchSpecifiersList();
    print.info(`found ${specifiers.length} specifiers`);

    const { total, directives, manPages } = await fetchDirectivesList();
    print.info(`found ${directives.size} directives (total=${total}) and ${manPages.length} man pages`);

    const wellknown = Object.entries(wellknownManPages);
    const nameToWriter = new Map(wellknown.map(([name, pageName]) => [pageName, new ManifestWriter(name)]));
    const defaultWriter = new ManifestWriter("default");
    specifiers.forEach((it) => defaultWriter.writeItem(it));

    for (const manPage of manPages) {
        const writer = nameToWriter.get(manPage.pageName) || defaultWriter;
        // console.log(manPage);

        const manPageURL = resolveURL(manpageURLs.directives, manPage.pageUri);
        const manPageResult = await fetchDirectiveDetailsFromManPage(
            Object.assign(manPage, { manPageURL }),
            writer.nextIds
        );
        if (manPageResult.directives.length > 0) {
            writer.writeItem(manPageResult.manPage[0]);
            writer.writeItems(manPageResult.sections);
            writer.writeItems(manPageResult.docs);
            writer.writeItems(manPageResult.directives);
        }
        writer.nextIds = manPageResult.nextIds;
    }
    await defaultWriter.close();
    const { logs, removed } = defaultWriter.getChanges(version);
    if (logs.length > 0) logs.push("\n\n");

    for (const [name, writer] of nameToWriter) {
        if (writer.nextIds.docs === 1 || writer.nextIds.sections === 1) print.warn(`No any manifest in ${name}`);
        await writer.close();

        const r = writer.getChanges(version);
        if (r.logs.length > 0) r.logs.push("\n\n");
        logs.push(...r.logs);
        removed.push(...r.removed);
    }

    if (!existsSync(logsDir)) mkdirSync(logsDir);
    const logFile = resolve(logsDir, `v${verstr}-changes.log`);
    const logFile2 = resolve(logsDir, `v${verstr}-removed.json`);
    writeFileSync(logFile, logs.join("\n"));
    writeFileSync(logFile2, JSON.stringify(removed, null, 2));
    print.info(logFile);
    print.info(logFile2);
}
