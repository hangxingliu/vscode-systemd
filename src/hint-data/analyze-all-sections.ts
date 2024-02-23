import { glob } from "glob";
import { MapList } from "../utils/data-types";
import { isManifestItemForManPageInfo, isManifestItemForSection } from "./types-manifest";
import { manifestDir } from "../config/fs";
import { readFileSync } from "fs";
import { resolve } from "path";
import { JsonFileWriter } from "../utils/crawler-utils";

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

async function main() {
    const logFile = "sections.log";

    // const items: unknown[][] = require("../../src/hint-data/directives.json");
    const sectionNames = new MapList<string>();
    /** current man page name */
    let currManPageName: string | undefined;
    const manifestFiles: string[] = glob.sync("*.json", { cwd: manifestDir });
    for (const file of manifestFiles) {
        const items = JSON.parse(readFileSync(resolve(manifestDir, file), "utf-8"));
        for (const item of items) {
            if (isManifestItemForManPageInfo(item)) currManPageName = item[2];
            if (!isManifestItemForSection(item)) continue;
            if (!currManPageName) throw new Error(`no manpage name in advance`);

            const [, , sectionName] = item;
            if (sectionNames.has(sectionName)) console.warn(`Duplicate section name "${sectionName}"`);
            sectionNames.push(sectionName, currManPageName);
        }
    }
    const entries = Array.from(sectionNames).sort((a, b) => (a[0] > b[0] ? 1 : -1));
    const filtered: typeof entries = [];

    // debug [Network]
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (!entry[1].includes("systemd.path(5)")) continue;
        // if (entry[1][0] !== 'systemd.network(5)' || entry[1].length > 1) continue;
        filtered.push(entry);
    }
    console.log(filtered.map((it) => it[0]));

    const logWriter = new JsonFileWriter(logFile);
    logWriter.writeItems(entries.map(items => [items[1].length, ...items]));
    logWriter.close();
    console.log(logFile);
}
