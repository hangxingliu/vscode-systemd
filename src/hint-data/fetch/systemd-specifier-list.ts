import { manpageURLs } from "../manpage-url";
import {
    AssertLevel,
    assertInnerText,
    assertLength,
    findElements,
    getHTMLDoc,
    getMarkdownHelpFromElement,
    print,
} from "../../utils/crawler-utils";
import { ManifestItemForSpecifier, ManifestItemType } from "../types-manifest";
import { CrawlerDiagnosisFile } from "../../utils/crawler-utils-diagnosis-file.js";

export async function fetchSpecifiersList() {
    const diagnosis = CrawlerDiagnosisFile.get(true);
    const $ = await getHTMLDoc("specifiers docs", manpageURLs.specifiers);

    print.start("processing specifiers document");

    const $table = findElements($, "#Specifiers+p+.table table", "==1");
    const $thead = findElements($table, "thead", "==1");
    assertInnerText($thead.find("th"), ["Specifier", "Meaning", "Details"], { ignoreWhiteSpace: true });

    const trArray = findElements($table, "tbody tr", ">=40").toArray();
    assertLength("tbody tr", trArray, 40, AssertLevel.WARNING);

    const result: ManifestItemForSpecifier[] = [];
    for (let i = 0; i < trArray.length; i++) {
        const $tr = $(trArray[i]);
        const $td = findElements($tr, "td", "==3", `tr[${i}] td`);

        const rawSpecifier = $td.eq(0).text();
        const mtx = rawSpecifier.match(/\"\%(.)\"/);
        if (!mtx) throw new Error(`Invalid specifier text "${rawSpecifier}"`);

        const meaning = $td.eq(1).text();
        const markdown = getMarkdownHelpFromElement($td.eq(2));
        diagnosis.write("specifier", mtx[1]);
        result.push([ManifestItemType.Specifier, mtx[1], meaning, markdown]);
    }
    return result;
}
