import { HintDataManagers } from "../hint-data/manager/multiple";
import { SystemdFileType } from "../parser/file-info";
import { isNonEmptyArray } from "../utils/data-types";
import { genManPageLink, genVersionDocs } from "./base";
import { createMarkdown } from "../utils/vscode";
import { ExtensionConfig } from "../config/vscode-config-loader";
import { SignatureInformation } from "vscode";
import { PredefinedSignature } from "../hint-data/types-manifest";

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
        if (directive.deprecated) docsMarkdown = genVersionDocs(directive) || "";

        if (manPage) docsMarkdown += genManPageLink(manPage, docs) + "   \n";
        if (directive.fix?.help) docsMarkdown += directive.fix.help;
        else docsMarkdown += docs ? docs.str.value : "";

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
