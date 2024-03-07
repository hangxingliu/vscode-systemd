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
import { getCursorInfoFromSystemdConf } from "./parser";
import { CursorType } from "./parser/types";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { languageId } from "./syntax/const-language-conf";
import { SystemdDocumentManager } from "./vscode-documents";
import { SystemdCapabilities } from "./hint-data/manager/capabilities";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { genHoverDocsForDirective, genSignatureDocsForDirective } from "./hint-data/manager/generate-docs";

const zeroPos = new Position(0, 0);
export class SystemdSignatureProvider implements SignatureHelpProvider, HoverProvider {
    static readonly triggerCharacters: string[] = ["="];

    constructor(private readonly config: ExtensionConfig, private readonly managers: HintDataManagers) {}

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

        const fileType = SystemdDocumentManager.instance.getType(document);
        const { managers } = this;
        const directive = (cursor.directiveKey || "").trim();

        const signatures = genSignatureDocsForDirective(managers, this.config, directive, cursor.section, fileType);
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
        const cursor = getCursorInfoFromSystemdConf(beforeText);

        const fileType = SystemdDocumentManager.instance.getType(document);

        const { managers } = this;
        const range = document.getWordRangeAtPosition(position);
        switch (cursor.type) {
            case CursorType.directiveKey: {
                const directive = document.getText(range);
                const docs = genHoverDocsForDirective(managers, directive, cursor.section, fileType);
                if (docs) return new Hover(docs, range);
                break;
            }
            case CursorType.directiveValue: {
                // Capabilities
                const cap = SystemdCapabilities.instance;
                if (cap.testDirectiveKey(cursor.directiveKey)) {
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
