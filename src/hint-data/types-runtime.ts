import type { CompletionItem, MarkdownString, Uri } from "vscode";
import type { PredefinedSignature } from "./types-manifest";

type PartialRequired<T, Keys extends keyof T> = Omit<T, Keys> & { [P in Keys]-?: T[P] };

// the value of this enum represents priority and array index
export const enum DirectiveCategory {
    service = 0,
    timer = 1,
    socket = 2,
    network = 3,
    netdev = 4,
    link = 5,
    dnssd = 6,
    path = 7,
    mount = 8,
    automount = 9,
    swap = 10,
    nspawn = 11,
    scope = 12,
    //
    podman = 13,
    //
    coredump = 14,
    homed = 15,
    journald = 16,
    journal_remote = 17,
    journal_upload = 18,
    logind = 19,
    networkd = 20,
    oomd = 21,
    pstore = 22,
    repartd = 23,
    sleep = 24,
    system = 25,
    sysupdated = 26,
    timesyncd = 27,
    //#region todo
    crypttab = 28,
    veritytab = 29,
    fstab = 30,
    //#endregion todo
    default = 31,
    fallback = 32,
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
    signatures?: string[] | PredefinedSignature;
    docsIndex?: number;
    manPage?: number;
    /** `true` represents that this item would not be shown in auto-completion by default */
    hidden?: boolean;
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
