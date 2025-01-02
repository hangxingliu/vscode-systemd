import {
    CancellationToken,
    HoverProvider,
    Position,
    SignatureHelp,
    SignatureHelpContext,
    SignatureHelpProvider,
    TextDocument,
    Range,
    Hover,
    languages,
} from "vscode";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { languageIds } from "./syntax/const-language-conf";
import { SystemdDocumentManager } from "./vscode-documents";
import { SystemdCapabilities } from "./hint-data/manager/capabilities";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { genHoverDocsForDirective } from "./docs/hover";
import { genSignatureDocsForDirective } from "./docs/signature";
import { SystemdUnitsManager } from "./hint-data/manager/special-units";
import { isMkosiFile } from "./parser/file-info.js";
import { SystemdCursorContext } from "./parser-v2/get-cursor-context.js";
import { TokenType } from "./parser-v2/types.js";

const zeroPos = new Position(0, 0);
export class SystemdSignatureProvider implements SignatureHelpProvider, HoverProvider {
    static readonly triggerCharacters: string[] = ["="];

    constructor(private readonly config: ExtensionConfig, private readonly managers: HintDataManagers) {}

    register() {
        return languages.registerSignatureHelpProvider(
            languageIds,
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
        const fileType = SystemdDocumentManager.instance.getType(document);
        const mkosi = isMkosiFile(fileType);
        const cursor = SystemdCursorContext.get(beforeText, { mkosi });
        if (cursor.complete !== TokenType.directiveValue) return null;

        const { managers } = this;
        const directive = (cursor.key?.name || "").trim();
        const section = cursor.section?.name || "";

        /** hide signature if there are any value enum available */
        if (managers.hasValueEnum(cursor, fileType)) return null;
        if (SystemdUnitsManager.instance.has(directive)) return null;

        const signatures = genSignatureDocsForDirective(managers, this.config, directive, section, fileType);
        if (signatures) {
            const help = new SignatureHelp();
            help.activeSignature = 0;
            help.signatures = signatures;
            return help;
        }
        return null;
    }

    provideHover(document: TextDocument, position: Position): Hover | null {
        const beforeText = document.getText(new Range(zeroPos, position));
        const fileType = SystemdDocumentManager.instance.getType(document);
        const mkosi = isMkosiFile(fileType);
        const cursor = SystemdCursorContext.get(beforeText, { mkosi });

        const { managers } = this;
        const range = document.getWordRangeAtPosition(position);
        switch (cursor.complete) {
            case TokenType.directiveKey: {
                const section = cursor.section?.name || '';
                const directive = document.getText(range);
                const docs = genHoverDocsForDirective(managers, directive, section, fileType);
                if (docs) return new Hover(docs, range);
                break;
            }
            case TokenType.directiveValue: {
                // Capabilities
                const cap = SystemdCapabilities.instance;
                const key = cursor.key?.name || '';
                if (cap.testDirectiveKey(key)) {
                    const capName = document.getText(range);
                    const capItem = cap.getByName(capName);
                    if (capItem) return new Hover([capItem.name, capItem.docs]);
                }

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
