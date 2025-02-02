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
    CompletionItemTag,
} from "vscode";
import { languageIds } from "./syntax/const-language-conf";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { RequiredDirectiveCompletionItem } from "./hint-data/types-runtime";
import { isMkosiFile, SystemdFileType } from "./parser/file-info";
import { getSectionCompletionItems } from "./hint-data/get-section-completion";
import { getCalendarCompletion } from "./hint-data/get-calendar-completion";
import { SystemdDocumentManager } from "./vscode-documents";
import { SystemdCapabilities } from "./hint-data/manager/capabilities";
import { PredefinedSignature } from "./hint-data/types-manifest";
import { ValueEnumExtendsFn } from "./hint-data/manager/value-enum";
import { SystemdUnitsManager } from "./hint-data/manager/special-units";
import { SystemdCursorContext } from "./parser-v2/get-cursor-context.js";
import { TokenType } from "./parser-v2/types.js";

const zeroPos = new Position(0, 0);
const deprecatedTags = [CompletionItemTag.Deprecated];

export class SystemdCompletionProvider implements CompletionItemProvider {
    static readonly triggerCharacters: string[] = [
        "[",
        "=",
        // "\n",
        "%",
        ".",
        // todo: enable the following character after implemented the property ValueEnum#sep
        " ",
        "@",
    ];
    private fileTypeToSections: Array<Array<CompletionItem>> = [];
    private podmanEnabled: boolean;
    constructor(private readonly config: ExtensionConfig, private readonly managers: HintDataManagers) {
        this.podmanEnabled = config.podmanCompletion;
        config.event(this.afterChangedConfig);
    }

    getSectionItems(fileType: SystemdFileType) {
        const cache = this.fileTypeToSections;
        if (!cache[fileType]) cache[fileType] = getSectionCompletionItems(fileType, this.podmanEnabled);
        return cache[fileType];
    }

    register() {
        return languages.registerCompletionItemProvider(
            languageIds,
            this,
            ...SystemdCompletionProvider.triggerCharacters
        );
    }

    // clear cache after config is changed
    private readonly afterChangedConfig = () => {
        if (this.podmanEnabled !== this.config.podmanCompletion) {
            this.podmanEnabled = this.config.podmanCompletion;
            this.fileTypeToSections = [];
        }
    };

    private readonly extendsValueEnum: ValueEnumExtendsFn = (rule) => {
        if (rule.extends === PredefinedSignature.Boolean) return this.getBooleanCompletion(false);
        if (rule.extends === PredefinedSignature.BooleanOrAuto) return this.getBooleanCompletion(true);
    };

    getBooleanCompletion(withAuto: boolean) {
        const enums = this.config.booleanStyle.split("-");
        if (withAuto) enums.push("auto");
        return enums.map((it, index) => {
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
        // console.log(`char=${JSON.stringify(context.triggerCharacter)} kind=${context.triggerKind}`);
        const beforeText = document.getText(new Range(zeroPos, position));
        const file = SystemdDocumentManager.instance.getType(document);
        const version = this.config.version;

        const mkosi = isMkosiFile(file);
        const cursor = SystemdCursorContext.get(beforeText, { mkosi });
        switch (cursor.complete) {
            case TokenType.directiveKey: {
                const pending = getPendingText();
                const section = cursor.section?.name || "";

                let directives = this.managers.filterDirectives(pending, { section, file });
                if (!directives) return;

                const range = new Range(position.translate(0, -pending.length), position);
                if (version) {
                    directives = directives.filter((it) => {
                        if (it.since && it.since > version) return false;
                        if (it.deprecated) it.tags = it.deprecated > version ? [] : deprecatedTags;
                        return true;
                    });
                }
                for (const it of directives) it.range = range;
                return directives;
            }
            case TokenType.section: {
                return this.getSectionItems(file);
            }
            case TokenType.directiveValue: {
                const pending = getPendingText();
                if (pending.endsWith("%") && !pending.endsWith("%%")) return this.managers.getSpecifiers();

                const directive = cursor.key?.name || "";
                const section = cursor.section?.name || "";
                if (directive) {
                    const capabilities = SystemdCapabilities.instance.getCompletionItems(directive);
                    if (capabilities) return capabilities;

                    const units = SystemdUnitsManager.instance.getCompletionItems(
                        directive,
                        pending,
                        position,
                        context
                    );
                    if (units) {
                        if (version) return units.filter((it) => !(it.since && it.since > version));
                        return units;
                    }

                    const calendarWords = getCalendarCompletion(directive, pending);
                    if (calendarWords) return calendarWords;
                }

                const items = this.managers.filterValueEnum({
                    cursor,
                    file,
                    position,
                    pendingText: pending,
                    extendsFn: this.extendsValueEnum,
                    ...context,
                });
                if (items) return items;

                if (directive && section) {
                    const list = this.managers.getDirectiveList(directive, { section, file });
                    if (list && list.length > 0) {
                        const directive = list[0];
                        if (directive.signatures === PredefinedSignature.Boolean)
                            return this.getBooleanCompletion(false);
                        if (directive.signatures === PredefinedSignature.BooleanOrAuto)
                            return this.getBooleanCompletion(true);
                    }
                }
                return;
            }
        }

        function getPendingText() {
            if (!cursor || !cursor.from) return "";
            const offset = cursor.from[0];
            return beforeText.slice(offset);
        }
    }

    resolveCompletionItem(_item: CompletionItem, token: CancellationToken): ProviderResult<CompletionItem> {
        if (typeof (_item as RequiredDirectiveCompletionItem).category !== "number") return _item;

        const item = _item as RequiredDirectiveCompletionItem;
        return this.managers.resolveCompletionItem(item);
    }
}
