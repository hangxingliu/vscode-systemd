#!/usr/bin/env node

import { cacheDir, manifestDir } from "../config/fs";
import { manpageURLs } from "./manpage-url";
import { fetchSpecifiersList } from "../hint-data/fetch-specifier-list";
import { print, SimpleHttpCache, resolveURL, JsonFileWriter, enableHTMLSupportedInMarkdown } from "../utils/crawler-utils";
import { ManifestItem } from "./types-manifest";
import { fetchDirectivesList } from "../hint-data/fetch-directive-list";
import { fetchDirectiveDetailsFromManPage } from "../hint-data/fetch-directive-details";
import { wellknownManPages } from "./wellknown-manpages";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";

class ManifestWriter extends JsonFileWriter<ManifestItem> {
    nextIds = { docs: 1, sections: 1 };
    constructor(name: string) {
        super(resolve(manifestDir, name + ".json"));
        if (!existsSync(manifestDir)) mkdirSync(manifestDir);
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

    const specifiers = await fetchSpecifiersList();
    print.info(`found ${specifiers.length} specifiers`);

    const { total, directives, manPages } = await fetchDirectivesList();
    print.info(`found ${directives.size} directives (total=${total}) and ${manPages.length} man pages`);

    const wellknow = Object.entries(wellknownManPages);
    const nameToWriter = new Map(wellknow.map(([name, pageName]) => [pageName, new ManifestWriter(name)]));
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
    defaultWriter.close();
    nameToWriter.forEach((writer, name) => {
        if (writer.nextIds.docs === 1 || writer.nextIds.sections === 1) print.warn(`No any manifest in ${name}`);
        writer.close();
    });
}
