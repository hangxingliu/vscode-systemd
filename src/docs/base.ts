import { DocsContext, ManPageInfo } from "../hint-data/types-runtime";

export function genVersionDocs(item: { deprecated?: number; since?: number }, full = false) {
    let docs: string | undefined;
    if (item.deprecated) docs = `*Abandoned since version ${item.deprecated}*   \n`;
    if (full && item.since) docs = `${docs || ""}*Added in version ${item.since}*   \n`;
    return docs;
}

export function genManPageLink(manPage: ManPageInfo, docs?: DocsContext | false) {
    let url = manPage.url.toString();
    if (docs && docs.ref) url += docs.ref;
    const markdown = `[${manPage.title}](${url})`;
    return markdown;
}
