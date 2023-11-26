import {
    CancellationToken,
    HoverProvider,
    Position,
    SignatureHelp,
    SignatureHelpContext,
    SignatureHelpProvider,
    TextDocument,
    Range,
    SignatureInformation,
    Hover,
    MarkdownString,
    languages,
} from "vscode";
import { isNonEmptyArray } from "./utils/data-types";
import { getCursorInfoFromSystemdConf } from "./parser";
import { CursorType } from "./parser/types";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { languageId } from "./syntax/const";
import { parseSystemdFilePath } from "./parser/file-info";

const zeroPos = new Position(0, 0);
export class SystemdSignatureProvider implements SignatureHelpProvider, HoverProvider {
    static readonly triggerCharacters: string[] = ["="];

    constructor(private readonly managers: HintDataManagers) {}

    register() {
        return languages.registerSignatureHelpProvider(
            [languageId],
            this,
            ...SystemdSignatureProvider.triggerCharacters
        );
    }

    provideSignatureHelp(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: SignatureHelpContext
    ): SignatureHelp | null {
        const beforeText = document.getText(new Range(zeroPos, position));
        const cursor = getCursorInfoFromSystemdConf(beforeText);
        if (cursor.type !== CursorType.directiveValue) return null;

        const fileType = parseSystemdFilePath(document.fileName);
        const { managers } = this;
        const directive = (cursor.directiveKey || "").trim();
        const dirs = managers.getDirectiveList(directive, {
            section: cursor.section,
            file: fileType,
        });
        if (!isNonEmptyArray(dirs)) return null;

        const help = new SignatureHelp();
        const signatures: SignatureInformation[] = [];
        for (const directive of dirs) {
            const docsInfo = managers.getDirectiveDocs(directive);
            if (!docsInfo) continue;

            const { manPage, section, docs } = docsInfo;
            let docsMarkdown = "";
            if (manPage) docsMarkdown = `[${manPage.title}](${manPage.url.toString()}) `;
            docsMarkdown += docs ? docs.value : "";

            const signStrings = isNonEmptyArray(directive.signatures) ? directive.signatures : [];
            if (!signStrings[0]) {
                let defaultSign = `${directive.directiveName}=`;
                if (section) defaultSign = `[${section.name}] ${defaultSign}`;
                signStrings[0] = defaultSign;
            }
            for (const signString of signStrings)
                signatures.push(new SignatureInformation(signString, new MarkdownString(docsMarkdown)));
        }
        help.activeSignature = 0;
        help.signatures = signatures;
        return help;
    }

    provideHover(document: TextDocument, position: Position): Hover | null {
        const beforeText = document.getText(new Range(zeroPos, position));
        const cursor = getCursorInfoFromSystemdConf(beforeText);

        const fileType = parseSystemdFilePath(document.fileName);

        const { managers } = this;
        const range = document.getWordRangeAtPosition(position);
        switch (cursor.type) {
            case CursorType.directiveKey: {
                const directive = document.getText(range);
                const dirs = managers.getDirectiveList(directive, {
                    section: cursor.section,
                    file: fileType,
                });
                if (!isNonEmptyArray(dirs)) return null;

                const manPages = new Set<string>();
                const markdowns: Array<MarkdownString> = [];
                dirs.forEach((it) => {
                    const docsInfo = managers.getDirectiveDocs(it);
                    if (!docsInfo) return;
                    const { manPage, docs, section } = docsInfo;
                    if (manPage) {
                        let help = section ? `[${section.name}] in ` : "";
                        help += `[${manPage.title}](${manPage.url.toString()})`;
                        manPages.add(help);
                    }
                    if (docs) markdowns.push(docs);
                });
                const helpText1 = new MarkdownString(Array.from(manPages).join("; "));
                return new Hover([helpText1, ...markdowns], range);
            }
            case CursorType.directiveValue: {
                const p0 = new Position(position.line, Math.max(position.character - 2, 0));
                const p1 = new Position(position.line, position.character + 2);
                const text = document.getText(new Range(p0, p1));
                const mtx = text.match(/\%(.)/);
                if (mtx) {
                    const specifiers = managers.getSpecifiers();
                    if (!specifiers) return null;

                    const ch = mtx[1];
                    const it = specifiers.find((it) => it.specifierChar === ch);
                    if (it) return new Hover([`Specifier %${ch} (${it.specifierMeaning})`, it.documentation!]);
                }
            }
        }
        return null;
    }
}
