#!/usr/bin/env node

import { cacheDir, directivesDataFile } from "../config/fs";
import { manpageURLs } from "./manpage-url";
import { fetchSpecifiersList } from "../hint-data/fetch-specifier-list";
import { print, SimpleHttpCache, resolveURL, JsonFileWriter } from "../utils/crawler-utils";
import { ManifestItem } from "./types-manifest";
import { fetchDirectivesList } from "../hint-data/fetch-directive-list";
import { fetchDirectiveDetailsFromManPage } from "../hint-data/fetch-directive-details";

let jsonFile: JsonFileWriter | undefined;
main().catch((error) => {
    if (jsonFile) jsonFile.close();
    console.error(error.stack);
});
async function main() {
    SimpleHttpCache.init(cacheDir);

    const specifiers = await fetchSpecifiersList();
    print.info(`found ${specifiers.length} specifiers`);

    const { total, directives, manPages } = await fetchDirectivesList();
    print.info(`found ${directives.size} directives (total=${total}) and ${manPages.length} man pages`);

    const jsonFile = new JsonFileWriter<ManifestItem>(directivesDataFile);
    specifiers.forEach((it) => jsonFile.writeItem(it));

    let nextDocsId = 1;
    for (const manPage of manPages) {
        const manPageURL = resolveURL(manpageURLs.directives, manPage.pageUri);
        const manPageResult = await fetchDirectiveDetailsFromManPage(
            Object.assign(manPage, { manPageURL }),
            nextDocsId
        );
        if (manPageResult.directives.length > 0) {
            jsonFile.writeItem(manPageResult.manPage[0]);
            jsonFile.writeItems(manPageResult.docs);
            jsonFile.writeItems(manPageResult.directives);
        }
        nextDocsId = manPageResult.nextDocsId;
    }

    // if (print.warnings > 0) print.warning(`Total warnings: ${print.warnings}`);
    jsonFile.close();
    // print.done();
}
