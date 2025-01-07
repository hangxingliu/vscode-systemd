import { listManifestFiles } from "./_include";
import { customDirectives } from "../hint-data/custom-directives/index.js";
import { isManifestItemForDirective, isManifestItemForSection } from "../hint-data/types-manifest.js";

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

async function main() {
    let error = 0;
    const allDeprecatedDirectives = customDirectives.filter((it) => it.dead || "deprecated" in it);
    const manifestFiles = listManifestFiles();
    for (const file of manifestFiles) {
        console.log(`File: ${file.file}`);

        const sections: string[] = [];
        for (const item of file.items) {
            if (isManifestItemForSection(item)) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [type, sectionIndex, sectionName] = item;
                sections[sectionIndex] = sectionName;
                continue;
            }
            if (!isManifestItemForDirective(item)) continue;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [type, directiveName, signature, docsMarkdown, manPageIndex, sectionIndex] = item;
            const sectionName = typeof sectionIndex === "number" ? sections[sectionIndex] : "";
            if (typeof sectionName !== "string") {
                console.warn(`  Invalid section index ${sectionIndex} in "${directiveName}"`);
            }
            const matched = allDeprecatedDirectives.find(
                (it) => matchName(it.name, directiveName) && matchName(it.section, sectionName || "")
            );
            if (matched) {
                console.error(`  Found deprecated directive "${directiveName}"`);
                error++;
            }
        }
    }
    console.log(`Total deprecated directives in the manifest files: ${error}`);
}
function matchName(name: string | string[], needle: string) {
    if (typeof name === "string") return name === needle;
    return name.includes(needle);
}
