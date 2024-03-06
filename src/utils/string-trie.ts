export class TrieNode extends Map<string, TrieNode> {
    count = 0;
}
export class Trie {
    root = new TrieNode();
    insert(word: string) {
        let ptr = this.root;
        ptr.count++;

        for (const char of word) {
            if (!ptr.has(char)) ptr.set(char, new TrieNode());
            ptr = ptr.get(char)!;
            ptr.count++;
        }
    }
    findPrefixes(ok: (prefix: string, items: number) => boolean) {
        const prefixes: Array<{ prefix: string; count: number }> = [];
        const search = (node: TrieNode, prefix: string): number => {
            if (node.count <= 1) return 0;
            let found = 0;
            for (const [char, child] of node.entries()) if (search(child, prefix + char)) found++;
            // matched rules and it is not a common prefix
            if (ok(prefix, node.count) && found !== 1) {
                prefixes.push({ prefix, count: node.count });
                return found + 1;
            }
            return found;
        };
        search(this.root, "");
        return prefixes;
    }
}
