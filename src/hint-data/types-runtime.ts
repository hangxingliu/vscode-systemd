import type { CompletionItem, MarkdownString, Uri } from "vscode";

type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & { [P in Keys]-?: T[P] };

// the value of this enum represents priority and array index
export const enum DirectiveCategory {
    service = 0,
    timer = 1,
    socket = 2,
    network = 3,
    netdev = 4,
    podman = 5,
    link = 6,
    dnssd = 7,
    path = 8,
    mount = 9,
    default = 10,
    fallback = 11,
}

export type ManPageInfo = {
    title: string;
    desc: MarkdownString;
    url: Uri;
};
export type DocsContext = {
    /** Eg: "#XXXX=" */
    ref: string;
    /** Markdown */
    str: MarkdownString;
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
