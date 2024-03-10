import { writeFileSync } from "fs";
import { blue, dim, red, resolveURL } from "../utils/crawler-utils";
import { manpageURLs } from "../hint-data/manpage-url";
import {
    ManifestItemForManPageInfo,
    isManifestItemForDirective,
    isManifestItemForDocsMarkdown,
    isManifestItemForManPageInfo,
    isManifestItemForSection,
} from "../hint-data/types-manifest";
import { manifestDir } from "../config/fs";
import { resolve } from "path";
import { listManifestFiles } from "./_include";

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

async function main() {
    let index = 0;
    const manifestFiles = listManifestFiles();

    const code: string[] = [
        'import { SystemdFileType } from "../parser/file-info";',
        "",
        "export type SystemdValueEnum = {",
        "  directive: string;",
        "  values: string[];",
        "  section?: string;",
        "  file?: SystemdFileType;",
        "  manPage?: string;",
        "};",
        "",
        "export const systemdValueEnum: ReadonlyArray<SystemdValueEnum> = [",
    ];

    const firsts: typeof manifestFiles = [];
    const addToFirsts = (name: string) => {
        const index = manifestFiles.findIndex(it => it.file === name);
        if (index < 0) throw new Error(`"${name}" does not exist`);
        firsts.push(...manifestFiles.splice(index, 1));
    };
    addToFirsts("socket.json");
    addToFirsts("default.json");
    addToFirsts("network.json");
    addToFirsts("netdev.json");
    manifestFiles.unshift(...firsts);

    for (const file of manifestFiles) {
        const sectionNames: string[] = [];
        const allDocs: string[] = [];
        const allManPages: ManifestItemForManPageInfo[] = [];
        const handledDocsIndex: boolean[] = [];
        for (const item of file.items) {
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
    }
    code.push("]");

    let mergedCode = code.join("\n");
    mergedCode = mergedCode.replace(/^(\s*)"?manPage"?:\s+"([^"]+?)",?\s*$/gm, (_, prefix, name) => {
        prefix += "file: ";
        switch (name) {
            case "systemd.socket(5)":
                return prefix + "SystemdFileType.socket,";
            case "systemd.network(5)":
                return prefix + "SystemdFileType.network,";
            case "systemd.netdev(5)":
                return prefix + "SystemdFileType.netdev,";
            case "systemd.service(5)":
                return prefix + "SystemdFileType.service,";
            case "systemd.unit(5)":
                return "";
        }
        return _;
    });
    mergedCode = mergedCode.replace(/\n+/g, "\n");

    const tmpFile = "value-enum.tmp.ts";
    writeFileSync(resolve(manifestDir, "..", tmpFile), mergedCode);
    console.log(tmpFile);
}
