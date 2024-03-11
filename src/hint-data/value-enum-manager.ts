import { CursorInfo } from "../parser";
import { SystemdFileType } from "../parser/file-info";
import { getArray } from "../utils/data-types";
import { SystemdValueEnum } from "./custom-value-enum/types";
import { CompletionItem, CompletionItemKind, CompletionItemTag, MarkdownString, SnippetString } from "vscode";

export type ValueEnumExtendsFn = (valueEnum: SystemdValueEnum) => CompletionItem[] | null | undefined;
export class ValueEnumManager {
    private byName = new Map<string, SystemdValueEnum[]>();

    constructor(allValueEnum: ReadonlyArray<SystemdValueEnum>) {
        const byName = this.byName;
        for (const valueEnum of allValueEnum) {
            const names = getArray(valueEnum.directive)
            for (const name of names) {
                const lc = name.toLowerCase();
                const list = byName.get(lc);
                if (!list) byName.set(lc, [valueEnum]);
                else list.push(valueEnum);
            }
        }
    }

    resolve(cursor: CursorInfo, file: SystemdFileType, extendsFn?: ValueEnumExtendsFn) {
        const key = cursor.directiveKey;
        if (!key) return;

        const keyLC = key.trim().toLowerCase();
        let enums = this.byName.get(keyLC);
        if (!enums) return;

        const result: CompletionItem[] = [];
        const resultText: string[] = [];
        const docs: Record<string, string> = {};
        const tips: Record<string, string> = {};

        let section = cursor.section || "";
        if (section) section = section.replace(/[\[\]]/g, "");

        const exactMatch = enums.filter((it) => it.directive === key);
        if (exactMatch.length > 0) enums = exactMatch;

        const files: boolean[] = [];
        files[file] = true;
        //#region patch
        if (file === SystemdFileType.podman_container) files[SystemdFileType.service] = true;
        //#endregion patch
        for (const valueEnum of enums) {
            if (valueEnum.section && valueEnum.section !== section) continue;
            if (typeof valueEnum.file === "number" && !files[valueEnum.file]) continue;
            if (valueEnum.extends && extendsFn) {
                const items = extendsFn(valueEnum);
                if (items && items.length > 0) result.push(...items);
            }
            if (valueEnum.values) resultText.push(...valueEnum.values);
            if (valueEnum.tips) Object.assign(tips, valueEnum.tips);
            if (valueEnum.docs) {
                resultText.push(...Object.keys(valueEnum.docs));
                Object.assign(docs, valueEnum.docs);
            }
        }

        for (const it of new Set(resultText)) {
            const tip = tips[it];
            const documentation = docs[it];

            const ci = new CompletionItem(tip ? { label: it, detail: ` ${tip}` } : it, CompletionItemKind.Enum);
            if (it.match(/\$\{/)) {
                let i = 1;
                ci.insertText = new SnippetString(it.replace(/\$\{(\w+)\}/g, (_, key) => `\${${i++}:${key}}`));
            }
            if (tip && tip === "deprecated") ci.tags = [CompletionItemTag.Deprecated];
            if (documentation) ci.documentation = new MarkdownString(documentation);
            result.push(ci);
        }
        return result;
    }
}
