import { CursorInfo } from "../parser";
import { SystemdFileType } from "../parser/file-info";
import { SystemdValueEnum } from "./value-enum";
import { CompletionItem, CompletionItemKind, MarkdownString } from "vscode";

export class ValueEnumManager {
    private byName = new Map<string, SystemdValueEnum[]>();

    constructor(allValueEnum: ReadonlyArray<SystemdValueEnum>) {
        const byName = this.byName;
        for (const valueEnum of allValueEnum) {
            const lc = valueEnum.directive.toLowerCase();
            const list = byName.get(lc);
            if (!list) byName.set(lc, [valueEnum]);
            else list.push(valueEnum);
        }
    }

    resolve(cursor: CursorInfo, file: SystemdFileType) {
        const key = cursor.directiveKey;
        if (!key) return;

        const keyLC = key.trim().toLowerCase();
        let enums = this.byName.get(keyLC);
        if (!enums) return;

        const resultText = new Set<string>();
        const desc: Record<string, string> = {};

        let section = cursor.section || "";
        if (section) section = section.replace(/[\[\]]/g, "");

        const exactMatch = enums.filter((it) => it.directive === key);
        if (exactMatch.length > 0) enums = exactMatch;

        for (const valueEnum of enums) {
            if (valueEnum.section && valueEnum.section !== section) continue;
            if (typeof valueEnum.file === "number" && valueEnum.file !== file) continue;
            for (const value of valueEnum.values) resultText.add(value);
            if (valueEnum.desc) Object.assign(desc, valueEnum.desc);
        }

        return Array.from(resultText).map((it) => {
            const ci = new CompletionItem(it, CompletionItemKind.Enum);
            const docs = desc[it];
            if (docs) ci.documentation = new MarkdownString(docs);
            return ci;
        });
    }
}
