import type { CompletionItem, MarkdownString, Uri } from "vscode";

export type ManPageInfo = {
    title: string;
    desc: MarkdownString;
    url: Uri;
};

export type DirectiveCompletionItem = CompletionItem & {
    directiveNameLC?: string;
    directiveName?: string;
    signatures?: string[];
    docsMarkdown?: number;
    manPage?: number;
};

export type SpecifierCompletionItem = CompletionItem & {
    specifierChar: string;
    specifierMeaning: string;
};
