#!/usr/bin/env node

import { cacheDir, logsDir, manifestDir } from "../../config/fs";
import { getVersionInfoInURL, manpageURLs } from "../manpage-url";
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
import { CrawlerDiagnosisFile } from "../../utils/crawler-utils-diagnosis-file.js";

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

    // network-online.target, ....
    await fetchSpecialUtils();

    const systemdVersion = getVersionInfoInURL(manpageURLs.base);
    const diagnosis = CrawlerDiagnosisFile.initOrGet(logsDir, `systemd-${systemdVersion.str}`);

    // %a, %A, ...
    const specifiers = await fetchSpecifiersList();
    print.info(`found ${specifiers.length} specifiers`);

    // get a list of directive to the further fetch
    const { total, directives, manPages } = await fetchDirectivesList();
    print.info(`found ${directives.size} directives (total=${total}) and ${manPages.length} man pages`);

    const wellknown = Object.entries(wellknownManPages);
    const nameToWriter = new Map(wellknown.map(([name, pageName]) => [pageName, new ManifestWriter(name)]));
    const defaultWriter = new ManifestWriter("default");
    specifiers.forEach((it) => defaultWriter.writeItem(it));

    for (const manPage of manPages) {
        // console.log(manPage);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const writer = nameToWriter.get(manPage.pageName as any) || defaultWriter;

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

    const r = defaultWriter.getChanges(systemdVersion.asInt);
    const removed = r.removed;
    let added = r.added;
    let changed = r.changed;
    let newSections = r.newSections.length;
    printChangeInfo("default", r);

    for (const [name, writer] of nameToWriter) {
        const noAnyDirectives = writer.nextIds.docs === 1 || writer.nextIds.sections === 1;
        if (noAnyDirectives) print.warn(`No any manifest in ${name}`);
        await writer.close();

        // Systemd removed `pstore.conf.html` from their website since v257
        if (noAnyDirectives && name === "pstore.conf(5)") continue;

        const r = writer.getChanges(systemdVersion.asInt);
        printChangeInfo(name, r);
        added += r.added;
        changed += r.changed;
        newSections += r.newSections.length;
        removed.push(...r.removed);
    }

    diagnosis.writeHeader(`overview`);
    diagnosis.count(`removed directives`, removed.length);
    diagnosis.count(`added directives`, added);
    diagnosis.count(`changed directives`, changed);
    diagnosis.count(`new sections`, newSections);
    print.info(`removed = ${removed.length}; added = ${added}; changed = ${changed}; new-sections = ${newSections}`);

    const removeInfoFileName = diagnosis.fileName.replace(/\.[\w-]+$/, "-removed.json");
    const removeInfoFilePath = resolve(logsDir, removeInfoFileName);
    writeFileSync(removeInfoFilePath, JSON.stringify(removed, null, 2));

    print.info(diagnosis.filePath);
    print.info(removeInfoFilePath);

    function printChangeInfo(pageName: string, r: ReturnType<ManifestWriter["getChanges"]>) {
        if (r.logs.length > 0) {
            diagnosis.writeHeader(`change info (${pageName})`);
            r.logs.forEach((it) => diagnosis.write(it.type, it.explain));
        }
        if (r.newSections.length > 0) r.newSections.forEach((it) => diagnosis.write(`new-section`, it));
    }
}
