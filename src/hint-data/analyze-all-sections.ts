import { isManifestItemForSection } from "./types-manifest";

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

async function main() {
    const items: unknown[][] = require("../../src/hint-data/directives.json");
    const sectionNames = new Set<string>();
    for (const item of items) {
        if (!isManifestItemForSection(item)) continue;
        const [, , sectionName] = item;
        if (sectionNames.has(sectionName)) console.warn(`Duplicate section name "${sectionName}"`);
        else sectionNames.add(sectionName);
    }
    console.log(Array.from(sectionNames).sort());
}
