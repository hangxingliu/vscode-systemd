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
    DocsContext,
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
import { CustomSystemdDirective } from "../custom-directives";

type ExtraProps<T extends CompletionItem> = Omit<T, keyof CompletionItem>;

const hiddenManPageTitles = new Set([
    "vconsole.conf(5)",
    "crypttab(5)",
    // A separate [Device] section does not exist, since no device-specific options may be configured.
    // https://www.freedesktop.org/software/systemd/man/latest/systemd.device.html
    "systemd.device(5)",
]);

export class HintDataManager {
    readonly manPageBaseUri: Uri;

    readonly manPages: Array<ManPageInfo> = [];
    readonly hiddenManPages = new Set<number>();
    readonly docsMarkdown: Array<DocsContext> = [];
    /** key is lowercase name of the section */
    readonly sectionIdMap = new MapList<number>();
    readonly sections: Array<SectionInfo> = [];
    private maxSectionId = 1;

    /** key is lowercase name */
    readonly directivesMap = new MapList<RequiredDirectiveCompletionItem>();
    readonly directives: Array<RequiredDirectiveCompletionItem> = [];
    readonly specifiers: Array<SpecifierCompletionItem> = [];

    private enumManager: ValueEnumManager | undefined;
    resolveEnum?: ValueEnumManager["resolve"];

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
            const title = item[2];
            const base = this.manPageBaseUri;
            const desc = new MarkdownString(item[3]);
            desc.baseUri = base;
            const rawUri = item[4];
            let url: Uri;
            if (rawUri.match(/^\w+\:\/\//)) url = Uri.parse(rawUri);
            else url = Uri.joinPath(base, rawUri);
            this.manPages[item[1]] = { title, desc, url };
            // `man man`:
            // 5      File Formats and Conventions
            // /etc/vconsole.conf
            if (!title.includes("(5)") || hiddenManPageTitles.has(title)) this.hiddenManPages.add(item[1]);
            return;
        }

        if (isManifestItemForDocsMarkdown(item)) {
            const base = this.manPageBaseUri;
            const desc = new MarkdownString(item[2]);
            desc.baseUri = base;
            this.docsMarkdown[item[1]] = { ref: item[3], str: desc };
            return;
        }

        if (isManifestItemForSection(item)) {
            const [, sectionId, name] = item;
            const nameLC = name.toLowerCase();
            this.sectionIdMap.push(nameLC, sectionId);
            this.sections[sectionId] = { name, nameLC };
            if (sectionId > this.maxSectionId) this.maxSectionId = sectionId;
        }

        if (isManifestItemForDirective(item)) {
            const [, directiveName, signature, docsIndex, manPageIndex, sectionIndex] = item;
            const label: CompletionItemLabel = { label: directiveName };
            if (signature) label.detail = " " + signature;

            const ci = new CompletionItem(label, CompletionItemKind.Property);
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
            // if (this.directivesMap.has(nameLC)) continue;
            names.push(name);
            namesLC.push(nameLC);
        }
        let docsIndex: number | undefined;
        if (typeof item.docs === "string") {
            const markdown = new MarkdownString(item.docs);
            docsIndex = this.docsMarkdown.push({ str: markdown, ref: "" }) - 1;
        }

        const sectionIndexes = new Set<number>();
        const sectionNames = Array.isArray(item.section) ? item.section : [item.section];
        for (const sectionName of sectionNames) {
            const sectionNameLC = sectionName.toLowerCase();
            const indexes = this.sectionIdMap.get(sectionNameLC);
            if (indexes) {
                for (const index of indexes) sectionIndexes.add(index);
            } else {
                const sectionId = ++this.maxSectionId;
                this.sectionIdMap.push(sectionNameLC, sectionId);
                this.sections[sectionId] = { name: sectionName, nameLC: sectionNameLC };
                sectionIndexes.add(sectionId);
            }
        }

        for (const sectionIndex of sectionIndexes) {
            for (let i = 0; i < names.length; i++) {
                const directiveName = names[i];
                const directiveNameLC = directiveName.toLowerCase();
                const extraProps: ExtraProps<RequiredDirectiveCompletionItem> = {
                    category: this.category,
                    sectionIndex,
                    directiveNameLC,
                    directiveName,
                    docsIndex,
                };
                if (item.dead || item.internal) extraProps.hidden = true;

                const label: CompletionItemLabel = { label: directiveName };
                if (item.signature) label.detail = " " + item.signature;

                const ci: RequiredDirectiveCompletionItem = Object.assign(
                    new CompletionItem(label, CompletionItemKind.Property),
                    extraProps
                );
                if (item.deprecated) ci.tags = [CompletionItemTag.Deprecated];
                this.directivesMap.push(directiveNameLC, ci);
                this.directives.push(ci);
            }
        }
    }
}
