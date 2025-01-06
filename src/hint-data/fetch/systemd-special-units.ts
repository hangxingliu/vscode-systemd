#!/usr/bin/env node

import type { Cheerio } from "cheerio";
import type { Element } from "domhandler";
import { cacheDir, manifestDir } from "../../config/fs";
import { manpageURLs } from "../manpage-url";
import {
    print,
    SimpleHttpCache,
    JsonFileWriter,
    getHTMLDoc,
    matchElementsByText,
    assertLength,
    enableHTMLSupportedInMarkdown,
    getMarkdownHelpFromElement,
} from "../../utils/crawler-utils";
import { ManifestItemForSpecialUnit, ManifestItemType } from "../types-manifest";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import { extractVersionInfoFromMarkdown } from "./utils/directive-signature";

class ManifestWriter extends JsonFileWriter<ManifestItemForSpecialUnit> {
    constructor(name: string) {
        super(resolve(manifestDir, name + ".json"));
        if (!existsSync(manifestDir)) mkdirSync(manifestDir);
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error.stack);
        process.exit(1);
    });
}

export async function main() {
    SimpleHttpCache.init(cacheDir);
    enableHTMLSupportedInMarkdown();

    const $ = await getHTMLDoc("special-units", manpageURLs.specialUnits);
    print.start("fetching all special units");

    const matchedH2 = matchElementsByText($("body h2"), ["Units managed by the system service manager"], {
        allowDuplicate: false,
        allowMissing: false,
    })[0];

    // 2024-03: length = 77
    const allDT = assertLength("dt", $(matchedH2).parent().find("dl.variablelist > dt"), ">=77");
    // console.log(allDT.length);

    let count = 0;
    const jsonFile = new ManifestWriter("special-units");
    for (const dt of allDT) {
        const $dt = $(dt);
        const _names = getText($dt);
        const names = _names.split(/\s*,\s*/);
        const name = names.length > 1 ? names : names[0];
        count += names.length;

        const $dd = $dt.next("dd");
        let help = getMarkdownHelpFromElement($dd);
        const v = extractVersionInfoFromMarkdown(_names, help);
        help = v.markdown;

        jsonFile.writeItem([ManifestItemType.SpecialUnit, name, help, v.version]);
    }
    jsonFile.close();
    print.info(`generated ${count} special units from ${allDT.length} <dt>`);
    print.allDone();

    function getText(el: Cheerio<Element>) {
        el = el.clone();
        el.find("a.headerlink").remove();
        return el.text().trim();
    }
}
