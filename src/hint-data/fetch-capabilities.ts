#!/usr/bin/env node

import { cacheDir, manifestDir } from "../config/fs";
import { manpageURLs } from "./manpage-url";
import {
    print,
    SimpleHttpCache,
    JsonFileWriter,
    getHTMLDoc,
    matchElementsByText,
    assertLength,
    toMarkdown,
    enableHTMLSupportedInMarkdown,
} from "../utils/crawler-utils";
import { ManifestItemForCapability, ManifestItemType } from "./types-manifest";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";

class ManifestWriter extends JsonFileWriter<ManifestItemForCapability> {
    nextIds = { docs: 1, sections: 1 };
    constructor(name: string) {
        super(resolve(manifestDir, name + ".json"));
        if (!existsSync(manifestDir)) mkdirSync(manifestDir);
    }
}

let jsonFile: ManifestWriter | undefined;
main().catch((error) => {
    if (jsonFile) jsonFile.close();
    console.error(error.stack);
});
async function main() {
    SimpleHttpCache.init(cacheDir);
    enableHTMLSupportedInMarkdown();

    const $ = await getHTMLDoc("capabilities", manpageURLs.capabilities);
    print.start("extracting all capabilities");

    const $h2 = assertLength("body > h2", $("body > h2"), ">1");
    const matchedH2 = matchElementsByText($h2, ["DESCRIPTION"], {
        allowDuplicate: false,
        allowMissing: false,
        deleteSubstr: ["top"],
    })[0];
    const $pre = $(matchedH2).next("pre");
    // console.log($pre.html());

    const regex = /Capabilities list([\s\S]+)Past and current implementation/i;
    const matchedList = ($pre.html() || "").match(regex);
    if (!matchedList) throw new Error(`Failed to match capabilities from the html by ${regex}`);

    const lines = matchedList[1].split(/\n/);

    type Cap = { name: string; docs: string };
    const capabilities: Cap[] = [];
    let pending: Cap | undefined;
    for (const line of lines) {
        // eslint-disable-next-line no-regex-spaces
        const matchedTitle = line.match(/^       <b>(\w+)\s*<\/b>(.*)$/);
        if (matchedTitle) {
            const capName = matchedTitle[1];
            if (pending) capabilities.push(pending);
            pending = { name: capName, docs: matchedTitle[2] || "" };
            continue;
        }
        if (pending && line.startsWith("              ")) {
            pending.docs += (pending.docs ? "\n" : "") + line.trim();
            continue;
        }
    }
    if (pending) capabilities.push(pending);
    capabilities.forEach((it) => (it.docs = toMarkdown(it.docs.replaceAll("\n", "<br/>"))));
    capabilities.sort((a, b) => a.name.localeCompare(b.name));
    // console.log(capabilities);

    jsonFile = new ManifestWriter("capabilities");
    jsonFile.writeItems(capabilities.map((it) => [ManifestItemType.Capability, it.name, it.docs]));
    jsonFile.close();
}
