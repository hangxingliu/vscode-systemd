import { CompletionItem, CompletionItemKind, CompletionItemTag, MarkdownString, Uri } from "vscode";
import { CustomSystemdDirective, deprecatedDirectivesSet } from "../syntax/const";
import { systemdDocsURLs } from "../config/url";
import { isManifestItemForDirective, isManifestItemForDocsMarkdown, isManifestItemForManPageInfo, isManifestItemForSpecifier } from "../utils/types";
import { MapList } from "../utils/data-types";

export type ManPageInfo = {
    title: string;
    desc: MarkdownString;
    url: Uri;
}
export type MarkdownHelp = MarkdownString;
export type DirectiveCompletionItem = CompletionItem & {
    directiveNameLC?: string;
    directiveName?: string;
    signature?: string;
    docsMarkdown?: number;
    manPage?: number;
}
export type SpecifierCompletionItem = CompletionItem & {
    specifierChar: string;
    specifierMeaning: string;
}


export class HintDataManager {

    manPageBaseUri: Uri;
    manPages: Array<ManPageInfo> = [];
    docsMarkdown: Array<MarkdownHelp> = [];
    directives: Array<DirectiveCompletionItem> = [];
    /** key is lowercase name */
    directivesMap = new MapList<DirectiveCompletionItem>();
    specifiers: Array<SpecifierCompletionItem> = [];

    constructor(items?: unknown[][]) {
        this.manPageBaseUri = Uri.parse(systemdDocsURLs.base);
        if (items) this.addItems(items);
    }
    addItems(items: unknown[][]) {
        items.forEach(it => this.addItem(it))
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
        if (isManifestItemForDirective(item)) {
            const directiveName = item[1];
            const ci = new CompletionItem(directiveName, CompletionItemKind.Property);
            if (deprecatedDirectivesSet.has(directiveName))
                ci.tags = [CompletionItemTag.Deprecated];
            let docsMarkdown: number;
            if (typeof item[3] === 'string') {
                docsMarkdown = this.docsMarkdown.push(new MarkdownString(item[3])) - 1;
            } else {
                docsMarkdown = item[3];
            }
            const directiveNameLC = directiveName.toLowerCase();
            const d = Object.assign(ci, {
                directiveNameLC,
                directiveName,
                docsMarkdown,
                signature: item[2],
                manPage: item[4],
            });
            this.directivesMap.push(directiveNameLC, d);
            this.directives.push(d);
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
            const s = Object.assign(ci, {
                specifierChar: specifier,
                specifierMeaning: meaning,
            });
            this.specifiers.push(s);
            return;
        }
    }
    addFallbackItems(items: CustomSystemdDirective[]) {
        items.forEach(it => this.addFallbackItem(it))
    }
    addFallbackItem(item: CustomSystemdDirective) {
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
        let docsMarkdown: number;
        if (typeof item.description === 'string') {
            docsMarkdown = this.docsMarkdown.push(new MarkdownString(item.description)) - 1;
        }
        for (let i = 0; i < names.length; i++) {
            const directiveName = names[i];
            const directiveNameLC = directiveName.toLowerCase();
            const ci = new CompletionItem(directiveName, CompletionItemKind.Property);
            const d = Object.assign(ci, {
                directiveNameLC,
                directiveName,
                docsMarkdown,
            });
            this.directivesMap.push(directiveNameLC, d);
            this.directives.push(d);
        }
    }

    resolveDirectiveCompletionItem = (item: DirectiveCompletionItem) => {
        if (item.manPage) {
            const manPage = this.manPages[item.manPage]
            if (manPage)
                item.detail = manPage.title;
        }
        if (item.docsMarkdown) {
            const docs = this.docsMarkdown[item.docsMarkdown];
            if (docs)
                item.documentation = docs;
        }
        return item;
    }

}
