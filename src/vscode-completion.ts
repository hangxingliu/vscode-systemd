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
    CompletionItemKind,
} from "vscode";
import { getCursorInfoFromSystemdConf } from "./parser";
import { CursorType } from "./parser/types";
import { languageId } from "./syntax/const-language-conf";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { RequiredDirectiveCompletionItem } from "./hint-data/types-runtime";
import { SystemdFileType } from "./parser/file-info";
import { getSectionCompletionItems } from "./hint-data/get-section-completion";
import { getUnitNameCompletionItems } from "./hint-data/get-unit-name-completion";
import { getCalendarCompletion } from "./hint-data/get-calendar-completion";
import { SystemdDocumentManager } from "./vscode-documents";
import { SystemdCapabilities } from "./hint-data/manager/capabilities";
import { PredefinedSignature } from "./hint-data/types-manifest";

const zeroPos = new Position(0, 0);

export class SystemdCompletionProvider implements CompletionItemProvider {
    static readonly triggerCharacters: string[] = [
        "[",
        "=",
        // "\n",
        "%",
        ".",
    ];
    private fileTypeToSections: Array<Array<CompletionItem>> = [];
    private booleanItems: CompletionItem[] | undefined;
    constructor(private readonly config: ExtensionConfig, private readonly managers: HintDataManagers) {}

    getSectionItems(fileType: SystemdFileType) {
        const cache = this.fileTypeToSections;
        if (!cache[fileType]) cache[fileType] = getSectionCompletionItems(fileType, true);
        return cache[fileType];
    }

    register() {
        return languages.registerCompletionItemProvider(
            [languageId],
            this,
            ...SystemdCompletionProvider.triggerCharacters
        );
    }

    afterChangedConfig() {
        this.fileTypeToSections = [];
        this.booleanItems = undefined;
    }

    getBooleanCompletion() {
        if (this.booleanItems) return this.booleanItems;
        const enums = this.config.booleanStyle.split("-");
        this.booleanItems = enums.map((it, index) => {
            const ci = new CompletionItem(it, CompletionItemKind.Keyword);
            ci.sortText = `bool${index}`;
            return ci;
        });
    }

    provideCompletionItems(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: CompletionContext
    ): CompletionItem[] | undefined {
        const beforeText = document.getText(new Range(zeroPos, position));
        const cursorContext = getCursorInfoFromSystemdConf(beforeText);
        const file = SystemdDocumentManager.instance.getType(document);
        const { section } = cursorContext;

        switch (cursorContext.type) {
            case CursorType.directiveKey: {
                const pending = getPendingText();

                const directives = this.managers.filterDirectives(pending, { section, file });
                if (!directives) return;
                const range = new Range(position.translate(0, -pending.length), position);
                directives.forEach((it) => (it.range = range));
                return directives;
            }
            case CursorType.section: {
                return this.getSectionItems(file);
            }
            case CursorType.directiveValue: {
                const pending = getPendingText();
                if (pending.endsWith("%") && !pending.endsWith("%%")) return this.managers.getSpecifiers();

                const directive = cursorContext.directiveKey;
                if (directive) {
                    const capabilities = SystemdCapabilities.instance.getCompletionItems(directive);
                    if (capabilities) return capabilities;

                    const units = getUnitNameCompletionItems(directive);
                    if (units) return units;

                    const calendarWords = getCalendarCompletion(directive, pending);
                    if (calendarWords) return calendarWords;
                }

                const items = this.managers.filterValueEnum(cursorContext, file);
                if (items) return items;

                if (directive && section) {
                    const list = this.managers.getDirectiveList(directive, { section, file });
                    if (list && list.length > 0) {
                        const directive = list[0];
                        if (directive.signatures === PredefinedSignature.Boolean) return this.getBooleanCompletion();
                    }
                }
                return;
            }
        }

        function getPendingText() {
            if (!cursorContext || !cursorContext.pendingLoc) return "";
            const offset = cursorContext.pendingLoc[0];
            return beforeText.slice(offset);
        }
    }

    resolveCompletionItem(_item: CompletionItem, token: CancellationToken): ProviderResult<CompletionItem> {
        if (typeof (_item as RequiredDirectiveCompletionItem).category !== "number") return _item;

        const item = _item as RequiredDirectiveCompletionItem;
        return this.managers.resolveCompletionItem(item);
    }
}
