import { Trie } from "./string-trie";

export type OptionsForParseRegExp = {
  addFlags?: string;
  delFlags?: string;
}
export function parseRegExp(str: string, opts?: OptionsForParseRegExp) {
  if (!str || typeof str !== 'string' || str[0] !== '/')
    throw new Error(`invalid regexp string (it is not started with "/")`);
  const lastIndex = str.lastIndexOf('/');
  if (lastIndex <= 0)
    throw new Error(`invalid regexp string (it is not paired "/")`);
  const regexp = str.slice(1, lastIndex);
  let flags = str.slice(lastIndex + 1);
  if (opts) {
    const { addFlags, delFlags } = opts;
    const flagsSet = new Set(flags.split(''));
    if (addFlags && typeof addFlags === 'string') {
      addFlags.split('').forEach(ch => flagsSet.add(ch));
      flags = Array.from(flagsSet).join('')
    }
    if (delFlags && typeof delFlags === 'string') {
      delFlags.split('').forEach(ch => flagsSet.delete(ch));
      flags = Array.from(flagsSet).join('')
    }
  }
  return new RegExp(regexp, flags);
}

export function createEnumForRegExp(values: string[], prefixes?: true | string[]) {
    const result: Array<{ value: string; children: string[]; self?: boolean }> = [];
    if (prefixes === true) {
        const trie = new Trie();
        for (const v of values) trie.insert(v);
        const allPrefixes = trie.findPrefixes(
            (prefix, items) => prefix.length > 6 || (prefix.length >= 4 && items >= 3)
        );
        prefixes = allPrefixes.map(it => it.prefix);
    } else if (!prefixes) prefixes = [];
    else prefixes = prefixes.filter((it) => typeof it === "string" && it);
    prefixes = prefixes.sort((a, b) => b.length - a.length);

    for (const v of values) {
        const prefix = prefixes.find((it) => v.startsWith(it));
        if (prefix) {
            const item = result.find((it) => it.value === prefix);
            const suffix = v.slice(prefix.length);
            if (item) {
                if (suffix) item.children.push(suffix);
                else item.self = true;
            } else {
                const newItem: (typeof result)[0] = { value: prefix, children: [] };
                if (suffix) newItem.children.push(suffix);
                else newItem.self = true;
                result.push(newItem);
            }
            continue;
        }
        result.push({ value: v, children: [] });
    }

    result.sort((a, b) => a.value.localeCompare(b.value));
    return result
        .map((it) => {
            const v = escape(it.value);
            if (it.children.length > 0) {
                const suffixes = it.children.map(escape).join("|");
                return `${v}(?:${suffixes})${it.self ? "?" : ""}`;
            }
            return v;
        })
        .join("|");

    function escape(str: string) {
        return str.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
    }
}
