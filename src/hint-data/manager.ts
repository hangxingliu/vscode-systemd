import { CompletionItem, CompletionItemKind, CompletionItemTag, MarkdownString, Uri } from "vscode";
import { deprecatedDirectivesSet } from "../syntax/const";
import { systemdDocsURLs } from "../utils/config";
import { isManifestItemForDirective, isManifestItemForDocsMarkdown, isManifestItemForManPageInfo } from "../utils/types";

export type ManPageInfo = {
    title: string;
    desc: MarkdownString;
    url: Uri;
}
export type MarkdownHelp = MarkdownString;
export type DirectiveCompletionItem = CompletionItem & {
    directiveName?: string;
    docsMarkdown?: number;
    manPage?: number;
}

export class HintDataManager {

    manPageBaseUri: Uri;
    manPages: Array<ManPageInfo> = [];
    docsMarkdown: Array<MarkdownHelp> = [];
    directives: Array<DirectiveCompletionItem> = [];

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
            this.directives.push(Object.assign(ci, {
                directiveName,
                docsMarkdown,
                manPage: item[4],
            }));
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
