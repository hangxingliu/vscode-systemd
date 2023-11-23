import {
    CompletionItem,
    CompletionItemKind,
    CompletionItemLabel,
    CompletionItemTag,
    MarkdownString,
    Uri,
} from "vscode";
import { CustomSystemdDirective, deprecatedDirectivesSet } from "../syntax/const";
import { manpageURLs } from "./manpage-url";
import {
    isManifestItemForDirective,
    isManifestItemForDocsMarkdown,
    isManifestItemForManPageInfo,
    isManifestItemForSpecifier,
} from "./types-manifest";
import { MapList } from "../utils/data-types";
import { DirectiveCompletionItem, ManPageInfo, SpecifierCompletionItem } from "./types-runtime";

export class HintDataManager {
    manPageBaseUri: Uri;
    manPages: Array<ManPageInfo> = [];
    docsMarkdown: Array<MarkdownString> = [];
    directives: Array<DirectiveCompletionItem> = [];
    /** key is lowercase name */
    directivesMap = new MapList<DirectiveCompletionItem>();
    specifiers: Array<SpecifierCompletionItem> = [];

    constructor(items?: unknown[][]) {
        this.manPageBaseUri = Uri.parse(manpageURLs.base);
        if (items) this.addItems(items);
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
        if (isManifestItemForDirective(item)) {
            const [, directiveName, signature] = item;
            const label: CompletionItemLabel = { label: directiveName };
            if (signature) label.detail = " " + signature;

            const ci = new CompletionItem(label, CompletionItemKind.Property);
            if (deprecatedDirectivesSet.has(directiveName)) ci.tags = [CompletionItemTag.Deprecated];
            let docsMarkdown: number;
            if (typeof item[3] === "string") {
                // todo: bug in here:
                docsMarkdown = this.docsMarkdown.push(new MarkdownString(item[3])) - 1;
            } else {
                docsMarkdown = item[3];
            }

            const directiveNameLC = directiveName.toLowerCase();
            const completionItem: DirectiveCompletionItem = Object.assign(ci, {
                directiveNameLC,
                directiveName,
                docsMarkdown,
                signatures: Array.isArray(signature) ? signature : [signature],
                manPage: item[4],
            });
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
            const s = Object.assign(ci, {
                specifierChar: specifier,
                specifierMeaning: meaning,
            });
            this.specifiers.push(s);
            return;
        }
    }
    addFallbackItems(items: CustomSystemdDirective[]) {
        items.forEach((it) => this.addFallbackItem(it));
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
        let docsMarkdown: number | undefined;
        if (typeof item.description === "string") {
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
            const manPage = this.manPages[item.manPage];
            if (manPage) item.detail = manPage.title;
        }
        if (item.docsMarkdown) {
            const docs = this.docsMarkdown[item.docsMarkdown];
            if (docs) item.documentation = docs;
        }
        return item;
    };
}
