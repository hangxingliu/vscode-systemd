const rawItems = require("../../hint-data/manifests/capabilities.json");
const allCapNames = new Set<string>();
for (const item of rawItems) {
    if (!Array.isArray(item) || typeof item[1] !== "string") continue;
    allCapNames.add(item[1]);
}

let namesRegExp: string | undefined;
{
    const part1: string[] = [];
    const part2: string[] = [];
    for (const name of allCapNames.values()) {
        if (name.startsWith("CAP_")) part1.push(name.replace("CAP_", ""));
        else part2.push(name);
    }
    const regexp: string[] = [];
    if (part1.length > 0) regexp.push(`CAP_(?:${part1.join("|")})`);
    if (part2.length > 0) regexp.push(part2.join("|"));
    namesRegExp = regexp.join("|");
}
export const capabilityNamesRegExp = namesRegExp;
