import { MarkdownString, SignatureInformation } from "vscode";
import type { ExtensionConfig } from "../../config/vscode-config-loader";
import { SystemdFileType } from "../../parser/file-info";
import { isNonEmptyArray } from "../../utils/data-types";
import { createMarkdown } from "../../utils/vscode";
import { PredefinedSignature } from "../types-manifest";
import type { DocsContext, ManPageInfo } from "../types-runtime";
import type { HintDataManagers } from "./multiple";

export function genManPageLink(manPage: ManPageInfo, docs?: DocsContext | false) {
    let url = manPage.url.toString();
    if (docs && docs.ref) url += docs.ref;
    const markdown = `[${manPage.title}](${url})`;
    return markdown;
}

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
        restBlocks.push(docs.str);
    });

    if (firstBlock.length > 0) restBlocks.unshift(createMarkdown(firstBlock.join("; ")));
    if (restBlocks.length > 0) return restBlocks;
    return;
}

export function genSignatureDocsForDirective(
    managers: HintDataManagers,
    config: ExtensionConfig,
    directive: string,
    section: string | undefined,
    file: SystemdFileType | undefined
) {
    if (!directive) return;

    const directives = managers.getDirectiveList(directive, { section, file });
    if (!isNonEmptyArray(directives)) return null;

    const signatures: SignatureInformation[] = [];
    for (const directive of directives) {
        const docsInfo = managers.getDirectiveDocs(directive);
        if (!docsInfo) continue;

        const { manPage, section, docs } = docsInfo;
        let docsMarkdown = "";
        if (manPage) docsMarkdown = genManPageLink(manPage, docs);
        docsMarkdown += docs ? docs.str.value : "";

        const signStrings: string[] = [];
        if (directive.signatures === PredefinedSignature.Boolean) {
            signStrings.push(config.booleanStyle.split("-").join("|"));
        } else if (isNonEmptyArray(directive.signatures)) {
            signStrings.push(...signStrings);
        }

        if (!signStrings[0]) {
            let defaultSign = `${directive.directiveName}=`;
            if (section) defaultSign = `[${section.name}] ${defaultSign}`;
            signStrings[0] = defaultSign;
        }
        for (const signString of signStrings)
            signatures.push(new SignatureInformation(signString, createMarkdown(docsMarkdown)));
    }

    if (signatures.length > 0) return signatures;
}
