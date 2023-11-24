import { writeFileSync } from "fs";
import { blue, dim, red, resolveURL } from "../utils/crawler-utils";
import { manpageURLs } from "./manpage-url";
import {
    ManifestItemForManPageInfo,
    isManifestItemForDirective,
    isManifestItemForDocsMarkdown,
    isManifestItemForManPageInfo,
    isManifestItemForSection,
} from "./types-manifest";

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

async function main() {
    let index = 0;

    const items: unknown[][] = require("../../src/hint-data/directives.json");
    const sectionNames: string[] = [];
    const allDocs: string[] = [];
    const allManPages: ManifestItemForManPageInfo[] = [];
    const handledDocsIndex: boolean[] = [];
    const code: string[] = [
        "export type SystemdValueEnum = {",
        "  directive: string;",
        "  values: string[];",
        "  section?: string;",
        "  manPage?: string;",
        "};",
        "export const systemdValueEnum: ReadonlyArray<SystemdValueEnum> = [",
    ];

    for (const item of items) {
        if (isManifestItemForManPageInfo(item)) {
            allManPages[item[1]] = item;
            continue;
        }
        if (isManifestItemForDocsMarkdown(item)) {
            const [, markdownIndex, markdown] = item;
            allDocs[markdownIndex] = markdown;
            continue;
        }
        if (isManifestItemForSection(item)) {
            const [, sectionIndex, sectionName] = item;
            sectionNames[sectionIndex] = sectionName;
            continue;
        }
        if (isManifestItemForDirective(item)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [, directiveName, signature, docsIndex, manPageIndex, sectionIndex] = item;
            if (typeof docsIndex !== "number") continue;
            if (handledDocsIndex[docsIndex]) continue;

            let sectionName: string | undefined;
            if (sectionIndex) sectionName = sectionNames[sectionIndex];

            // ignore
            if (directiveName === "PollLimitIntervalSec") continue;
            if (directiveName === "PollLimitBurst") continue;
            if (directiveName === "ConditionFirmware") continue;
            if (directiveName === "ConditionNeedsUpdate") continue;
            if (directiveName === "RemoveIPC") continue;
            if (directiveName === "ConditionKernelVersion") continue;
            if (directiveName === "Requires") continue;
            if (directiveName === "Group") continue;
            if (directiveName === "ExecStart") continue;
            if (directiveName === "systemd.volatile") continue;
            if (directiveName === "net.ifname-policy") continue;
            if (directiveName === "net.naming-scheme") continue;
            if (directiveName === "BootServerName") continue;
            if (directiveName === "Mode") continue;
            if (directiveName === "ServerAddress") continue;
            if (directiveName === "UplinkInterface") continue;
            if (directiveName === "DNS") continue;
            if (directiveName === "ProtectVersion") continue;
            if (sectionName === "L2TP" && directiveName === "Local") continue;

            const docs = allDocs[docsIndex];
            const manPage = allManPages[manPageIndex];
            const match = docs.match(/\s+one\s*of\s+(.+?\s+?(?:and|or)\s+\S+)(.+)/i);
            if (match) {
                const options = match[1];
                const suffix = match[2];
                if (options.indexOf("a-z, A-Z") >= 0) continue;

                let head = `[${++index}]`;
                if (!sectionName) head = red(head);

                const manPageName = manPage[2];
                console.log("");
                console.log(head, blue(directiveName), sectionName);
                console.log(manPageName, resolveURL(manpageURLs.base, manPage[4]));
                console.log(options, dim(suffix));
                console.log("");

                const values: string[] = [];
                const match2 = options.matchAll(/\`(\S+?)\`/g);
                for (const it of match2) values.push(it[1]);
                if (values.length <= 0) throw new Error(`Failed to match options`);

                if (directiveName === "Timestamping") {
                    values.push("nsec");
                }

                code.push(
                    JSON.stringify(
                        {
                            directive: directiveName,
                            section: sectionName || undefined,
                            manPage: manPageName || undefined,
                            values: Array.from(new Set(values)),
                        },
                        null,
                        "\t"
                    ) + ","
                );
            }
            handledDocsIndex[docsIndex] = true;
        }
    }
    code.push("]");

    const tmpFile = "value-enum.tmp.ts";
    writeFileSync(tmpFile, code.join("\n"));
    console.log(tmpFile);
}
