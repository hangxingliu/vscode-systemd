export const enum ManifestItemType {
    Directive = 2,
    ManPageInfo = 3,
    DocsMarkdown = 4,
    Specifier = 5,
}
export type ManifestItem =
    | ManifestItemForDirective
    | ManifestItemForManPageInfo
    | ManifestItemForDocsMarkdown
    | ManifestItemForSpecifier;

export type ManifestItemForDirective = [
    type: ManifestItemType.Directive,
    directiveName: string,
    signature: string | string[],
    docsMarkdown: string | number,
    manPageIndex: number,
    sectionName?: string,
];
export type ManifestItemForManPageInfo = [
    type: ManifestItemType.ManPageInfo,
    manPageIndex: number,
    manPageName: string,
    manPageDescMarkdown: string,
    manPageURI: string
];
export type ManifestItemForDocsMarkdown = [
    type: ManifestItemType.DocsMarkdown,
    markdownIndex: number,
    markdown: string
];
export type ManifestItemForSpecifier = [
    type: ManifestItemType.Specifier,
    /** without first '%' */
    specifier: string,
    meaning: string,
    detailsMarkdown: string
];

export function isManifestItemForDirective(row: unknown[]): row is ManifestItemForDirective {
    return row && row[0] === ManifestItemType.Directive;
}
export function isManifestItemForManPageInfo(row: unknown[]): row is ManifestItemForManPageInfo {
    return row && row[0] === ManifestItemType.ManPageInfo;
}
export function isManifestItemForDocsMarkdown(row: unknown[]): row is ManifestItemForDocsMarkdown {
    return row && row[0] === ManifestItemType.DocsMarkdown;
}
export function isManifestItemForSpecifier(row: unknown[]): row is ManifestItemForSpecifier {
    return row && row[0] === ManifestItemType.Specifier;
}