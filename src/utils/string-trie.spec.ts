import { allSections } from "../syntax/const-sections";
import { getOrderedSectionNames } from "../syntax/sections-utils";
import { Trie } from "./string-trie";

testPrefix();
function testPrefix() {
    const sectionNames = getOrderedSectionNames(allSections);
    const trie = new Trie();
    for (const name of sectionNames) trie.insert(name);
    const prefixes = trie.findPrefixes((prefix, count) => {
        if (prefix.length > 7) return true;
        return prefix.length >= 4 && count >= 2;
    });
    console.log(prefixes);
    console.log(prefixes.length);
}
