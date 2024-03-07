export const enum ManifestItemType {
    Directive = 2,
    ManPageInfo = 3,
    DocsMarkdown = 4,
    Specifier = 5,
    Section = 6,
    /** Linux capabilities */
    Capability = 7,
}
export type ManifestItem =
    | ManifestItemForDirective
    | ManifestItemForManPageInfo
    | ManifestItemForDocsMarkdown
    | ManifestItemForSpecifier
    | ManifestItemForSection;

export type ManifestItemForCapability = [type: ManifestItemType.Capability, name: string, docs: string];

export const enum PredefinedSignature {
    Boolean = "b",
}
export type ManifestItemForDirective = [
    type: ManifestItemType.Directive,
    directiveName: string,
    signature: string[] | PredefinedSignature,
    docsMarkdown: number,
    manPageIndex: number,
    sectionIndex: number | null,
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
    markdown: string,
    /** Example: "Type=" in "...html#Type=" */
    urlRefId: string,
    sinceVersion?: number,
];
export type ManifestItemForSpecifier = [
    type: ManifestItemType.Specifier,
    /** without first '%' */
    specifier: string,
    meaning: string,
    detailsMarkdown: string
];
export type ManifestItemForSection = [
    //
    type: ManifestItemType.Section,
    sectionIndex: number,
    sectionName: string
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
export function isManifestItemForSection(row: unknown[]): row is ManifestItemForSection {
    return row && row[0] === ManifestItemType.Section;
}
export function isManifestItemForCapability(row: unknown[]): row is ManifestItemForCapability {
    return row && row[0] === ManifestItemType.Capability;
}
