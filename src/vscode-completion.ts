import {
    CancellationToken,
    CompletionContext,
    CompletionItem,
    CompletionItemProvider,
    Range,
    Position,
    ProviderResult,
    TextDocument,
    languages,
} from "vscode";
import { getCursorInfoFromSystemdConf } from "./parser";
import { CursorType } from "./parser/types";
import { languageId } from "./syntax/const";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { RequiredDirectiveCompletionItem } from "./hint-data/types-runtime";
import { SystemdFileType, parseSystemdFilePath } from "./parser/file-info";
import { getSectionCompletionItems } from "./hint-data/get-section-completion";
import { getUnitNameCompletionItems } from "./hint-data/get-unit-name-completion";

const zeroPos = new Position(0, 0);

export class SystemdCompletionProvider implements CompletionItemProvider {
    static readonly triggerCharacters: string[] = [
        "[",
        "=",
        // "\n",
        "%",
        ".",
    ];
    private readonly fileTypeToSections: Array<Array<CompletionItem>> = [];
    constructor(private readonly config: ExtensionConfig, private readonly managers: HintDataManagers) {}

    getSectionItems(fileType: SystemdFileType) {
        const cache = this.fileTypeToSections;
        if (!cache[fileType]) cache[fileType] = getSectionCompletionItems(fileType);
        return cache[fileType];
    }

    register() {
        return languages.registerCompletionItemProvider(
            [languageId],
            this,
            ...SystemdCompletionProvider.triggerCharacters
        );
    }

    provideCompletionItems(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: CompletionContext
    ): CompletionItem[] | undefined {
        const beforeText = document.getText(new Range(zeroPos, position));
        const cursorContext = getCursorInfoFromSystemdConf(beforeText);
        const fileType = parseSystemdFilePath(document.fileName);

        switch (cursorContext.type) {
            case CursorType.directiveKey: {
                const pending = getPendingText();

                const directives = this.managers.filterDirectives(pending, {
                    section: cursorContext.section,
                });
                if (!directives) return;
                const range = new Range(position.translate(0, -pending.length), position);
                directives.forEach((it) => (it.range = range));
                return directives;
            }
            case CursorType.section: {
                return this.getSectionItems(fileType);
            }
            case CursorType.directiveValue: {
                const pending = getPendingText();
                if (pending.endsWith("%") && !pending.endsWith("%%")) return this.managers.getSpecifiers();
                const directive = cursorContext.directiveKey;
                if (directive) {
                    const units = getUnitNameCompletionItems(directive);
                    if (units) return units;
                }
                return this.managers.filterValueEnum(cursorContext);
            }
        }

        function getPendingText() {
            if (!cursorContext || !cursorContext.pendingLoc) return "";
            const offset = cursorContext.pendingLoc[0];
            return beforeText.slice(offset);
        }
    }

    resolveCompletionItem(_item: CompletionItem, token: CancellationToken): ProviderResult<CompletionItem> {
        if (!(_item as RequiredDirectiveCompletionItem).category) return _item;

        const item = _item as RequiredDirectiveCompletionItem;
        return this.managers.resolveCompletionItem(item);
    }
}
