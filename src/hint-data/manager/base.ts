import {
    CompletionItem,
    CompletionItemKind,
    CompletionItemLabel,
    CompletionItemTag,
    MarkdownString,
    Uri,
} from "vscode";
import {
    DirectiveCategory,
    ManPageInfo,
    RequiredDirectiveCompletionItem,
    SectionInfo,
    SpecifierCompletionItem,
} from "../types-runtime";
import { MapList } from "../../utils/data-types";
import { ValueEnumManager } from "../value-enum-manager";
import { SystemdValueEnum } from "../value-enum";
import {
    isManifestItemForDirective,
    isManifestItemForDocsMarkdown,
    isManifestItemForManPageInfo,
    isManifestItemForSection,
    isManifestItemForSpecifier,
} from "../types-manifest";
import { CustomSystemdDirective, deprecatedDirectivesSet } from "../../syntax/const";

type ExtraProps<T extends CompletionItem> = Omit<T, keyof CompletionItem>;
const fallbackResolveEnum: ValueEnumManager["resolve"] = () => undefined;

export class HintDataManager {
    readonly manPageBaseUri: Uri;

    readonly manPages: Array<ManPageInfo> = [];
    readonly docsMarkdown: Array<MarkdownString> = [];
    /** key is lowercase name of the section */
    readonly sectionIdMap = new MapList<number>();
    readonly sections: Array<SectionInfo> = [];

    /** key is lowercase name */
    readonly directivesMap = new MapList<RequiredDirectiveCompletionItem>();
    readonly directives: Array<RequiredDirectiveCompletionItem> = [];
    readonly specifiers: Array<SpecifierCompletionItem> = [];

    private enumManager: ValueEnumManager | undefined;
    resolveEnum = fallbackResolveEnum;

    constructor(readonly category: DirectiveCategory, manPageBaseUri: string) {
        this.manPageBaseUri = Uri.parse(manPageBaseUri);
    }
    bindValueEnum(enums: ReadonlyArray<SystemdValueEnum>) {
        const manager = new ValueEnumManager(enums);
        this.enumManager = manager;
        this.resolveEnum = manager.resolve.bind(manager);
    }

    addItems(items: unknown[][]) {
        items.forEach((it) => this.addItem(it));
    }
    addItem(item: unknown[]) {
        if (isManifestItemForManPageInfo(item)) {
            this.manPages[item[1]] = {
                title: item[2],
                desc: new MarkdownString(item[3]),
                url: Uri.joinPath(this.manPageBaseUri, item[4]),
            };
            return;
        }

        if (isManifestItemForDocsMarkdown(item)) {
            this.docsMarkdown[item[1]] = new MarkdownString(item[2]);
            return;
        }

        if (isManifestItemForSection(item)) {
            const [, sectionId, name] = item;
            const nameLC = name.toLowerCase();
            this.sectionIdMap.push(nameLC, sectionId);
            this.sections[sectionId] = { name, nameLC };
        }

        if (isManifestItemForDirective(item)) {
            const [, directiveName, signature, docsIndex, manPageIndex, sectionIndex] = item;
            const label: CompletionItemLabel = { label: directiveName };
            if (signature) label.detail = " " + signature;

            const ci = new CompletionItem(label, CompletionItemKind.Property);
            if (deprecatedDirectivesSet.has(directiveName)) ci.tags = [CompletionItemTag.Deprecated];

            const directiveNameLC = directiveName.toLowerCase();
            const extraProps: ExtraProps<RequiredDirectiveCompletionItem> = {
                category: this.category,
                sectionIndex: sectionIndex || 0,
                manPage: manPageIndex,
                directiveNameLC,
                directiveName,
                docsIndex,
                signatures: Array.isArray(signature) ? signature : [signature],
            };
            const completionItem: RequiredDirectiveCompletionItem = Object.assign(ci, extraProps);
            this.directivesMap.push(directiveNameLC, completionItem);
            this.directives.push(completionItem);
            return;
        }

        if (isManifestItemForSpecifier(item)) {
            const [, specifier, meaning] = item;
            const label = `${specifier} (${meaning})`;
            const ci = new CompletionItem(specifier, CompletionItemKind.Value);
            ci.label = label;
            ci.insertText = specifier;
            ci.detail = meaning;
            ci.documentation = new MarkdownString(item[3]); // details

            const extraProps: ExtraProps<SpecifierCompletionItem> = {
                category: this.category,
                specifierChar: specifier,
                specifierMeaning: meaning,
            };
            const s: SpecifierCompletionItem = Object.assign(ci, extraProps);
            this.specifiers.push(s);
            return;
        }
    }

    addCustomDirective(item: CustomSystemdDirective) {
        if (!item) return;
        const names: string[] = [];
        const namesLC: string[] = [];
        const array = Array.isArray(item.name) ? item.name : [item.name];
        for (let i = 0; i < array.length; i++) {
            const name = array[i];
            const nameLC = name.toLowerCase();
            if (this.directivesMap.has(nameLC)) continue;
            names.push(name);
            namesLC.push(nameLC);
        }
        let docsIndex: number | undefined;
        if (typeof item.description === "string") {
            docsIndex = this.docsMarkdown.push(new MarkdownString(item.description)) - 1;
        }
        for (let i = 0; i < names.length; i++) {
            const directiveName = names[i];
            const directiveNameLC = directiveName.toLowerCase();
            const extraProps: ExtraProps<RequiredDirectiveCompletionItem> = {
                category: this.category,
                sectionIndex: 0,
                directiveNameLC,
                directiveName,
                docsIndex,
            };
            const ci: RequiredDirectiveCompletionItem = Object.assign(
                new CompletionItem(directiveName, CompletionItemKind.Property),
                extraProps
            );
            this.directivesMap.push(directiveNameLC, ci);
            this.directives.push(ci);
        }
    }
}
