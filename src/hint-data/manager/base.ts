import { CompletionItem, CompletionItemKind, CompletionItemLabel, CompletionItemTag, Uri } from "vscode";
import {
    DirectiveCategory,
    DocsContext,
    ManPageInfo,
    RequiredDirectiveCompletionItem,
    SectionInfo,
    SpecifierCompletionItem,
} from "../types-runtime";
import { MapList } from "../../utils/data-types";
import { ValueEnumManager } from "./value-enum";
import { SystemdValueEnum } from "../custom-value-enum/types";
import {
    PredefinedSignature,
    isManifestItemForDirective,
    isManifestItemForDocsMarkdown,
    isManifestItemForManPageInfo,
    isManifestItemForSection,
    isManifestItemForSpecifier,
} from "../types-manifest";
import { CustomSystemdDirective } from "../custom-directives";
import { createMarkdown } from "../../utils/vscode";
import { isHiddenManPage } from "./hidden-manpage";

type ExtraProps<T extends CompletionItem> = Omit<T, keyof CompletionItem>;

export class HintDataManager {
    readonly manPageBaseUri: Uri;

    readonly manPages: Array<ManPageInfo> = [];
    private readonly manPageIndexes = new Map<string, number>();
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
    hasEnum?: ValueEnumManager["has"];

    constructor(readonly category: DirectiveCategory, manPageBaseUri: string) {
        this.manPageBaseUri = Uri.parse(manPageBaseUri);
    }
    bindValueEnum(enums: ReadonlyArray<SystemdValueEnum>) {
        const manager = new ValueEnumManager(enums);
        this.enumManager = manager;
        this.resolveEnum = manager.resolve.bind(manager);
        this.hasEnum = manager.has.bind(manager);
    }

    addItems(items: unknown[][]) {
        items.forEach((it) => this.addItem(it));
    }
    addItem(item: unknown[]) {
        if (isManifestItemForManPageInfo(item)) {
            const [, manPageIndex, title, descText, rawUri] = item;
            const base = this.manPageBaseUri;
            const desc = createMarkdown(descText, base);
            let url: Uri;
            if (rawUri.match(/^\w+\:\/\//)) url = Uri.parse(rawUri);
            else url = Uri.joinPath(base, rawUri);
            this.manPages[manPageIndex] = { title, desc, url };
            this.manPageIndexes.set(title, manPageIndex);
            if (isHiddenManPage(title, url)) this.hiddenManPages.add(manPageIndex);
            return;
        }

        if (isManifestItemForDocsMarkdown(item)) {
            const [, docsIndex, docsMarkdown, ref, sinceVersion] = item;
            const version = Number.isInteger(sinceVersion) ? sinceVersion! : 0;
            const desc = createMarkdown(docsMarkdown, this.manPageBaseUri);
            this.docsMarkdown[docsIndex] = { ref, str: desc, version };
            return;
        }

        if (isManifestItemForSection(item)) {
            const [, sectionId, name] = item;
            const nameLC = name.toLowerCase();
            this.sectionIdMap.push(nameLC, sectionId);
            this.sections[sectionId] = { name, nameLC };
            if (sectionId > this.maxSectionId) this.maxSectionId = sectionId;
            return;
        }

        if (isManifestItemForDirective(item)) {
            const [, directiveName, signatures, docsIndex, manPageIndex, sectionIndex] = item;
            const label: CompletionItemLabel = { label: directiveName };
            if (signatures) {
                if (signatures === PredefinedSignature.Boolean) {
                    label.detail = " boolean";
                } else if (signatures === PredefinedSignature.BooleanOrAuto) {
                    label.detail = " boolean|auto";
                } else {
                    label.detail = " " + signatures;
                }
            }

            const ci = new CompletionItem(label, CompletionItemKind.Property);
            const directiveNameLC = directiveName.toLowerCase();
            const extraProps: ExtraProps<RequiredDirectiveCompletionItem> = {
                category: this.category,
                sectionIndex: sectionIndex || 0,
                manPage: manPageIndex,
                directiveNameLC,
                directiveName,
                docsIndex,
                signatures,
            };
            if (docsIndex) {
                const docs = this.docsMarkdown[docsIndex];
                if (docs && docs.version) extraProps.since = docs.version;
            }
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
            ci.documentation = createMarkdown(item[3], this.manPageBaseUri); // details

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
        let renames: string[] = [];
        if (item.renamedTo) renames = Array.isArray(item.renamedTo) ? item.renamedTo : [item.renamedTo];
        const array = Array.isArray(item.name) ? item.name : [item.name];
        for (let i = 0; i < array.length; i++) {
            const name = array[i];
            const nameLC = name.toLowerCase();
            // if (this.directivesMap.has(nameLC)) continue;
            names.push(name);
            namesLC.push(nameLC);
        }

        let manPageIndex: number | undefined;
        let manPageInfo: ManPageInfo | undefined;
        if (typeof item.manPage === "string" && item.url) {
            const { manPage, url } = item;
            manPageIndex = this.manPageIndexes.get(manPage);
            if (typeof manPageIndex === "number") {
                manPageInfo = this.manPages[manPageIndex];
            } else {
                manPageInfo = { title: manPage, url: Uri.parse(url) };
                manPageIndex = this.manPages.push(manPageInfo) - 1;
                this.manPageIndexes.set(manPage, manPageIndex);
            }
        }

        let docsIndex: number | undefined;
        if (typeof item.docs === "string") {
            const markdown = createMarkdown(item.docs, this.manPageBaseUri);
            docsIndex = this.docsMarkdown.push({ str: markdown, ref: "", version: 0 }) - 1;
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
                    manPage: manPageIndex,
                    directiveNameLC,
                    directiveName,
                    docsIndex,
                };
                if (item.dead || item.internal) extraProps.hidden = true;

                const label: CompletionItemLabel = { label: directiveName };
                if (item.signature) {
                    label.detail = " " + item.signature;
                    extraProps.signatures =
                        item.signature === "boolean" ? PredefinedSignature.Boolean : [item.signature];
                }

                const ci = new CompletionItem(label, CompletionItemKind.Property);
                if (item.deprecated) {
                    extraProps.deprecated = item.deprecated;
                    ci.tags = [CompletionItemTag.Deprecated];
                }
                if (item.fixHelp || renames[i]) {
                    extraProps.fix = {
                        help: item.fixHelp || item.docs || "",
                        url: item.fixURL,
                        rename: renames[i],
                    };
                }
                const rci: RequiredDirectiveCompletionItem = Object.assign(ci, extraProps);
                this.directivesMap.push(directiveNameLC, rci);
                this.directives.push(rci);
            }
        }
    }
}
