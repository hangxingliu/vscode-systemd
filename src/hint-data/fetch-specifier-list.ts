import { manpageURLs } from "./manpage-url";
import {
    AssertLevel,
    assertInnerText,
    assertLength,
    findElements,
    getHTMLDoc,
    getMarkdownHelpFromElement,
    print,
} from "../utils/crawler-utils";
import { ManifestItemForSpecifier, ManifestItemType } from "./types-manifest";

export async function fetchSpecifiersList() {
    const $ = await getHTMLDoc("specifiers docs", manpageURLs.specifiers);

    print.start("processing specifiers document");

    const $table = findElements($, "#Specifiers+p+.table table", "==1");
    const $thead = findElements($table, "thead", "==1");
    assertInnerText($thead.find("th"), ["Specifier", "Meaning", "Details"], { ignoreWhiteSpace: true });

    const trArray = findElements($table, "tbody tr", ">=39").toArray();
    assertLength("tbody tr", trArray, 39, AssertLevel.WARNING);

    const result: ManifestItemForSpecifier[] = [];
    for (let i = 0; i < trArray.length; i++) {
        const $tr = $(trArray[i]);
        const $td = findElements($tr, "td", "==3", `tr[${i}] td`);

        const rawSpecifier = $td.eq(0).text();
        const mtx = rawSpecifier.match(/\"\%(.)\"/);
        if (!mtx) throw new Error(`Invalid specifier text "${rawSpecifier}"`);

        const meaning = $td.eq(1).text();
        const markdown = getMarkdownHelpFromElement($td.eq(2));
        result.push([ManifestItemType.Specifier, mtx[1], meaning, markdown]);
    }
    return result;
}
