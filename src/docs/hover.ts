import { MarkdownString } from "vscode";
import { HintDataManagers } from "../hint-data/manager/multiple";
import { SystemdFileType } from "../parser/file-info";
import { isNonEmptyArray } from "../utils/data-types";
import { genManPageLink, genVersionDocs } from "./base";
import { createMarkdown } from "../utils/vscode";

export function genHoverDocsForDirective(
    managers: HintDataManagers,
    directive: string,
    section: string | undefined,
    file: SystemdFileType | undefined
) {
    const dirs = managers.getDirectiveList(directive, { section, file });
    if (!isNonEmptyArray(dirs)) return;

    const firstBlock: string[] = [];
    const restBlocks: MarkdownString[] = [];

    let unknownMode = false;
    if (!file && dirs.length > 1) {
        // there may be a lot of docs for this directive in unknown file
        firstBlock.push(`found ${dirs.length} references`);
        unknownMode = true;
    }

    dirs.forEach((it) => {
        const docsInfo = managers.getDirectiveDocs(it);
        if (!docsInfo) return;

        const { manPage, docs, section } = docsInfo;
        if (!docs) return;
        if (manPage) {
            let help = section ? `in [**${section.name}**] ` : "";
            help += genManPageLink(manPage, docs);
            if (docs.version) help += ` *since version ${docs.version}*`;

            if (unknownMode) restBlocks.push(createMarkdown(help));
            else firstBlock.push(help);
        }
        const deprecated = genVersionDocs(it);
        if (deprecated) restBlocks.push(createMarkdown(deprecated));
        restBlocks.push(docs.str);
    });

    if (firstBlock.length > 0) restBlocks.unshift(createMarkdown(firstBlock.join("; ")));
    if (restBlocks.length > 0) return restBlocks;
    return;
}
