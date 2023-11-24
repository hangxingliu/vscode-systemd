import { CursorInfo } from "../parser";
import { SystemdValueEnum } from "./value-enum";
import { CompletionItem, CompletionItemKind } from "vscode";

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

    resolve(cursor: CursorInfo) {
        const key = cursor.directiveKey;
        if (!key) return;

        const keyLC = key.trim().toLowerCase();
        const enums = this.byName.get(keyLC);
        if (!enums) return;

        const resultText = new Set<string>();
        let section = cursor.section || "";
        if (section) section = section.replace(/[\[\]]/g, "");

        for (const valueEnum of enums) {
            if (valueEnum.section && valueEnum.section !== section) continue;
            for (const value of valueEnum.values) resultText.add(value);
        }

        return Array.from(resultText).map((it) => new CompletionItem(it, CompletionItemKind.Enum));
    }
}
