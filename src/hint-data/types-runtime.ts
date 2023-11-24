import type { CompletionItem, MarkdownString, Uri } from "vscode";

type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & { [P in Keys]-?: T[P] };

export const enum DirectiveCategory {
    default = 0,
    podman = 1,
    fallback = 2,
}

export type ManPageInfo = {
    title: string;
    desc: MarkdownString;
    url: Uri;
};

export type DirectiveCompletionItem = CompletionItem & {
    category?: DirectiveCategory;
    sectionIndex?: number;
    directiveNameLC?: string;
    directiveName?: string;
    signatures?: string[];
    docsIndex?: number;
    manPage?: number;
};
export type RequiredDirectiveCompletionItem = PartialRequired<
    DirectiveCompletionItem,
    "category" | "directiveNameLC" | "directiveName" | "sectionIndex"
>;

export type SpecifierCompletionItem = CompletionItem & {
    category: DirectiveCategory;
    specifierChar: string;
    specifierMeaning: string;
};

export type SectionInfo = {
    name: string;
    nameLC: string;
};
