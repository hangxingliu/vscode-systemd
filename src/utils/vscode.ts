import { CompletionItem, MarkdownString, Uri } from "vscode";

export function cloneCompletionItem<T extends CompletionItem>(ci: T): T{
    if (!ci) return ci;
    const newCI = new CompletionItem(ci.label, ci.kind);
    Object.assign(newCI, ci);
    return newCI as T;
}

export function createMarkdown(markdown: string, baseUri?: Uri) {
    const result = new MarkdownString(markdown);
    // https://github.com/microsoft/vscode/blob/d73fa8b14a6c873958d00a7d7ad13fcb540a052c/src/vs/base/browser/dom.ts#L1861
    result.supportHtml = true;
    if (baseUri) result.baseUri = baseUri;
    return result;
}
