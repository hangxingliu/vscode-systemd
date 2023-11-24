import { MapList } from "../utils/data-types";
import { isManifestItemForManPageInfo, isManifestItemForSection } from "./types-manifest";

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

async function main() {
    const items: unknown[][] = require("../../src/hint-data/directives.json");
    const sectionNames = new MapList<string>();
    let manPageName: string | undefined;
    for (const item of items) {
        if (isManifestItemForManPageInfo(item)) manPageName = item[2];
        if (!isManifestItemForSection(item)) continue;
        if (!manPageName) throw new Error(`no manpage name in advance`);

        const [, , sectionName] = item;
        if (sectionNames.has(sectionName)) console.warn(`Duplicate section name "${sectionName}"`);
        sectionNames.push(sectionName, manPageName);
    }
    const entries = Array.from(sectionNames).sort((a, b) => (a[0] > b[0] ? 1 : -1));
    const filtered: typeof entries = [];

    // debug [Network]
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (!entry[1].includes('systemd.network(5)')) continue;
        // if (entry[1][0] !== 'systemd.network(5)' || entry[1].length > 1) continue;
        filtered.push(entry);
    }
    console.log(entries);
    console.log(filtered.map(it=>it[0]));
}
