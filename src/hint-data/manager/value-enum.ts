import { CursorInfo } from "../../parser";
import { SystemdFileType } from "../../parser/file-info";
import { getArray } from "../../utils/data-types";
import { SystemdValueEnum } from "../custom-value-enum/types";
import {
    CompletionItem,
    CompletionItemKind,
    CompletionItemTag,
    MarkdownString,
    Position,
    Range,
    SnippetString,
} from "vscode";

const whitespace = /^\s$/;

export type ValueEnumExtendsFn = (valueEnum: SystemdValueEnum) => CompletionItem[] | null | undefined;

export type ResolveValueEnumContext = {
    cursor: CursorInfo;
    file: SystemdFileType;
    position: Position;
    pendingText: string;

    extendsFn?: ValueEnumExtendsFn;
    triggerCharacter?: string;
};

export class ValueEnumManager {
    private byName = new Map<string, SystemdValueEnum[]>();

    constructor(allValueEnum: ReadonlyArray<SystemdValueEnum>) {
        const byName = this.byName;
        for (const valueEnum of allValueEnum) {
            const names = getArray(valueEnum.directive);
            for (const name of names) {
                const lc = name.toLowerCase();
                const list = byName.get(lc);
                if (!list) byName.set(lc, [valueEnum]);
                else list.push(valueEnum);
            }
        }
    }

    has(cursor: CursorInfo, file: SystemdFileType) {
        const key = cursor.directiveKey;
        if (!key) return false;

        const keyLC = key.trim().toLowerCase();
        return this.byName.has(keyLC);
    }

    resolve(context: ResolveValueEnumContext) {
        const { cursor, file, extendsFn, position, pendingText } = context;

        // todo: sep, prefix, triggerCharacter ...
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

        let sep: SystemdValueEnum["sep"];
        const prefixChars: Record<string, true> = {};

        const files: boolean[] = [];
        files[file] = true;
        //#region patch
        if (file === SystemdFileType.podman_container) files[SystemdFileType.service] = true;
        //#endregion patch
        for (const valueEnum of enums) {
            if (valueEnum.section && valueEnum.section !== section) continue;
            if (typeof valueEnum.file === "number" && !files[valueEnum.file]) continue;

            sep = valueEnum.sep;
            if (valueEnum.prefixChars) for (const ch of valueEnum.prefixChars) prefixChars[ch] = true;

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
        if (resultText.length <= 0) return result;

        //#region resolve the range of completion items
        let pending = 0;
        let matchedPrefix = 0;
        for (const ch of pendingText) {
            if (!prefixChars[ch]) break;
            matchedPrefix++;
        }
        if (sep === " ") {
            for (let i = pendingText.length - 1; i >= matchedPrefix; i--) {
                if (whitespace.test(pendingText[i])) break;
                pending++;
            }
        } else if (sep === "," || sep === ':') {
            for (let i = pendingText.length - 1; i >= matchedPrefix; i--) {
                if (pendingText === sep) {
                    if (whitespace.test(pendingText[i + 1])) pending--;
                    break;
                }
                pending++;
            }
        } else {
            pending = pendingText.length - matchedPrefix;
        }
        if (pending < 0) pending = 0;
        const range = new Range(pending > 0 ? position.translate(0, -pending) : position, position);
        //#endregion

        for (const it of new Set(resultText)) {
            const tip = tips[it];
            const documentation = docs[it];

            const ci = new CompletionItem(tip ? { label: it, detail: ` ${tip}` } : it, CompletionItemKind.Enum);
            if (it.match(/\$\{/)) ci.insertText = resolveInsertText(it);
            if (tip && tip === "deprecated") ci.tags = [CompletionItemTag.Deprecated];
            if (documentation) ci.documentation = new MarkdownString(documentation);
            if (sep === " ") ci.commitCharacters = [" "];
            ci.range = range;
            result.push(ci);
        }
        return result;
    }
}

function resolveInsertText(snippet: string) {
    let i = 0;
    const transformed = snippet.replace(/\$\{(.+?)\}/g, (_, key) => {
        // https://code.visualstudio.com/docs/editor/userdefinedsnippets#_grammar
        const choices = (key as string).split("|");
        if (choices.length > 1) return `\${${i++}|${choices.join(",")}|}`;
        return `\${${i++}:${key}}`;
    });
    return new SnippetString(transformed);
}
