import { CompletionItem } from "vscode";

export function cloneCompletionItem<T extends CompletionItem>(ci: T): T{
    if (!ci) return ci;
    const newCI = new CompletionItem(ci.label, ci.kind);
    Object.assign(newCI, ci);
    return newCI as T;
}
