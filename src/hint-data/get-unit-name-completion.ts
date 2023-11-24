import { CompletionItem, CompletionItemKind } from "vscode";
import { wellknownSystemdTargets } from "./wellknown-targets";

const directivesWithUnitName = new Set([
    "before",
    "after",
    "requires",
    "requiredby",
    "wants",
    "wantedby",
    "upholds",
    "upheldby",
    "partof",
    "consistsof",
    "bindsto",
    "boundby",
    "requisite",
    "requisiteof",
    "conflicts",
    "conflictedby",
    "triggers",
    "triggeredby",
    "propagatesreloadto",
    "reloadpropagatedfrom",
    "stoppropagatedfrom",
    "propagatesstopto",
    "following",
]);
let cached: CompletionItem[];

export function getUnitNameCompletionItems(directiveKey: string) {
    if (!directiveKey) return;
    const lc = directiveKey.toLocaleLowerCase();
    if (!directivesWithUnitName.has(lc)) return;
    if (cached) return cached;
    cached = wellknownSystemdTargets.map((it) => {
        const completion = new CompletionItem(it[0], CompletionItemKind.File);
        if (it[1]) completion.detail = it[1];
        return completion;
    });
    return cached;
}
