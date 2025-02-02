import { Cheerio } from "cheerio";
import type { Element } from "domhandler";
import {
    DuplicateChecker,
    assertLength,
    findElements,
    getElementInfo,
    getHTMLDoc,
    getMarkdownHelpFromElement,
    print,
    toMarkdown,
} from "../../utils/crawler-utils";
import { RawManPageInfo } from "./systemd-directive-list";
import {
    ManifestItem,
    ManifestItemForDirective,
    ManifestItemForDocsMarkdown,
    ManifestItemForManPageInfo,
    ManifestItemForSection,
    ManifestItemType,
    PredefinedSignature,
} from "../types-manifest";
import {
    extractDirectiveSignature,
    extractVersionInfoFromMarkdown,
    isBooleanArgument,
} from "./utils/directive-signature";
import { similarSections } from "../../syntax/common/section-names";
import { extractSectionNameFromDocs } from "./utils/section-names";
import { CrawlerDiagnosisFile } from "../../utils/crawler-utils-diagnosis-file.js";

const ignoredH2Sections: Array<string | `${string}\n${string}`> = [
    "Commands",
    "Concepts",
    "Configuration Directories and Precedence",
    "Description",
    "Directories",
    // "Environment",
    "Environment Variables in Spawned Processes",
    "Examples",
    "Files",
    // "fstab",
    "History",
    "Rules Files",
    "See Also",
    "Signals",
    "Sockets and FIFOs",
    "Specifiers",
    "Process Exit Codes",
    "Implicit Dependencies",
    "Credentials\nsystemd-firstboot(1)",

    // https://www.freedesktop.org/software/systemd/man/2/homectl.html
    "User Record Properties",
    // Added for systemd v256
    // https://www.freedesktop.org/software/systemd/man/256/systemd-network-generator.service.html
    "Credentials\nsystemd-network-generator.service(8)",
];

export async function fetchDirectiveDetailsFromManPage(
    manPage: RawManPageInfo & { manPageURL: string },
    nextIds: { docs: number; sections: number }
) {
    const diagnosis = CrawlerDiagnosisFile.get(true);

    // const manPageURL = resolveURL(manpageURLs.directives, pageUri);
    const { id: manPageId, pageName, pageUri, manPageURL } = manPage;
    const debugName = `man page "${pageName}"`;

    const prevSection = { index: -1, name: "" };
    const result = {
        nextIds,
        manPage: [] as ManifestItemForManPageInfo[],
        sections: [] as ManifestItemForSection[],
        docs: [] as ManifestItemForDocsMarkdown[],
        directives: [] as ManifestItemForDirective[],
    };
    function pushResult(item: ManifestItem) {
        if (item[0] === ManifestItemType.ManPageInfo) return result.manPage.push(item);
        if (item[0] === ManifestItemType.DocsMarkdown) return result.docs.push(item);
        if (item[0] === ManifestItemType.Directive) return result.directives.push(item);
        if (item[0] === ManifestItemType.Section) return result.sections.push(item);
        throw new Error(`Unknown manifest item type: ${item[0]}`);
    }

    const validDirectiveNames = new Set(manPage.directiveNames);
    const $ = await getHTMLDoc(debugName, manPageURL);
    print.debug(`processing ${debugName} for ${validDirectiveNames.size} directives ...`);

    const $nameH2 = findElements($, ".refnamediv h2", "=1");
    const description = getText($nameH2.next("p"));
    if (!description) throw new Error(`description of ${debugName} is empty!`);

    print.info(`${debugName} description: ${description}`);
    pushResult([ManifestItemType.ManPageInfo, manPageId, pageName, toMarkdown(description), pageUri]);

    const $h2List = findElements($, ".refsect1 h2", ">0");
    const dtList: Array<[Element, sectionIndex: number | null, sectionName?: string]> = [];
    for (const h2 of $h2List) {
        const $h2 = $(h2);
        const h2text = getText($h2);
        const ignore = ignoredH2Sections.includes(h2text) || ignoredH2Sections.includes(`${h2text}\n${pageName}`);
        if (ignore) {
            diagnosis.write("man-page-h2", `[IGNORE] ${JSON.stringify(h2text)} ${JSON.stringify(pageName)}`);
            continue;
        }

        const sectionName = extractSectionNameFromDocs(h2text, pageName);
        diagnosis.write("man-page-h2", `${JSON.stringify(h2text)} ${JSON.stringify(pageName)}`);

        let sectionIndex: number | null = null;
        if (sectionName) {
            diagnosis.write(`section-name`, sectionName);
            if (prevSection.name === sectionName) {
                sectionIndex = prevSection.index;
            } else {
                sectionIndex = nextIds.sections++;
                pushResult([ManifestItemType.Section, sectionIndex, sectionName]);
                prevSection.index = sectionIndex;
                prevSection.name = sectionName;
            }
        }

        const mustContainItems = sectionName && !similarSections.has(sectionName);
        const $dt = findElements($h2.parent(), "dt", mustContainItems ? ">0" : undefined, `h2"${h2text}"`);
        for (const dt of $dt) {
            // ignore nested dt element
            if ($(dt).parents("dd").length > 0) continue;

            // console.log('>', getText($(dt)), sectionName);
            dtList.push([dt, sectionIndex, sectionName]);
        }
    }
    diagnosis.count(`dtList`, dtList);

    let directiveCount = 0;
    const duplicate = new DuplicateChecker();
    for (const [dt, sectionIndex, sectionName] of dtList) {
        const $dt = $(dt);
        const id = dt.attribs.id;
        const text = getText($dt);
        if (!id) throw new Error(`No id in dt"${text}"`);
        if (text.length <= 0) throw new Error(`No text in ${getElementInfo(dt)}`);

        const $link = findElements($dt, "a.headerlink", "=1");
        const urlRefId = $link.attr("href");
        if (!urlRefId || !urlRefId.startsWith("#")) throw new Error(`Invalid link "${urlRefId}" to directive`);

        let currentDocsIndex: number | undefined;
        let currentDocs: string | undefined;
        const getCurrentDocsIndex = () => {
            if (typeof currentDocsIndex === "number") return currentDocsIndex;

            const $dd = $dt.next("dd");
            assertLength(`description of the directive "${text}"`, $dd, 1);
            let docsMarkdown = getMarkdownHelpFromElement($dd);
            if (!docsMarkdown) throw new Error(`No description for the directive "${text}"`);

            const v = extractVersionInfoFromMarkdown(text, docsMarkdown);
            docsMarkdown = v.markdown;

            // a small patch for Visual Studio Code render something like `getty@tty2.service`
            // as a email address
            docsMarkdown = docsMarkdown.replace(/(\w)@(\w+\.)/g, `$1\\@$2`);

            currentDocs = docsMarkdown;
            currentDocsIndex = nextIds.docs++;
            pushResult([ManifestItemType.DocsMarkdown, currentDocsIndex, docsMarkdown, urlRefId, v.version]);
            return currentDocsIndex;
        };

        const items = extractDirectiveSignature(text);
        for (const directive of items) {
            if (!validDirectiveNames.has(directive.name)) continue;

            const docsIndex = getCurrentDocsIndex();
            let signParams: string[] | PredefinedSignature | undefined;
            if (directive.params.length === 0) {
                if (isBooleanArgument(currentDocs)) signParams = PredefinedSignature.Boolean;
            }

            duplicate.check(directive.name + (sectionName ? `in [${sectionName}]` : ""));
            directiveCount++;
            pushResult([
                ManifestItemType.Directive,
                directive.name,
                signParams || directive.params,
                docsIndex,
                manPageId,
                sectionIndex,
            ]);
        }
    }
    diagnosis.count("directives", directiveCount);
    if (duplicate.hasDuplicate()) throw new Error(`Duplicate items in the page "${manPageURL}"`);

    result.directives.sort((a, b) => (a[1] > b[1] ? 1 : -1));
    return result;

    function getText(el: Cheerio<Element>) {
        el = el.clone();
        el.find("a.headerlink").remove();
        return el.text().trim();
    }
}
