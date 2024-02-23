import { Cheerio, Element } from "cheerio";
import {
    DuplicateChecker,
    assertLength,
    findElements,
    getElementInfo,
    getHTMLDoc,
    getMarkdownHelpFromElement,
    print,
    toMarkdown,
} from "../utils/crawler-utils";
import { RawManPageInfo } from "./fetch-directive-list";
import {
    ManifestItem,
    ManifestItemForDirective,
    ManifestItemForDocsMarkdown,
    ManifestItemForManPageInfo,
    ManifestItemForSection,
    ManifestItemType,
} from "./types-manifest";
import { similarSections } from "../syntax/systemd-sections";
import { extractDirectiveSignature } from "./extract-directive-signature";

const ignoredH2Sections: string[] = [
    "Commands",
    "Concepts",
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
];

export async function fetchDirectiveDetailsFromManPage(
    manPage: RawManPageInfo & { manPageURL: string },
    nextIds: { docs: number; sections: number }
) {
    // const manPageURL = resolveURL(manpageURLs.directives, pageUri);
    const { id: manPageId, pageName, pageUri, manPageURL } = manPage;
    const debugName = `man page "${pageName}"`;

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
    const dtList: Array<[Element, sectionIndex?: number, sectionName?: string]> = [];
    for (const h2 of $h2List) {
        const $h2 = $(h2);
        const h2text = getText($h2);
        if (ignoredH2Sections.includes(h2text)) continue;

        let sectionName: string | undefined;
        const mtx = h2text.match(/^(.*?)\[([^\]]+)\](.+)$/);
        if (mtx) {
            sectionName = mtx[2];
            if (!sectionName.match(/^[\w-]+$/) || mtx[3].trim() !== "Section Options")
                throw new Error(`Invalid section name in "${h2text}"`);
        }
        // patch
        if (!sectionName && h2text === "Options") {
            if (pageName === "systemd.service(5)") sectionName = "Service";
            else if (pageName === "systemd.socket(5)") sectionName = "Socket";
            else if (pageName === "systemd.mount(5)") sectionName = "Mount";
            else if (pageName === "systemd.automount(5)") sectionName = "Automount";
            else if (pageName === "systemd.timer(5)") sectionName = "Timer";
            else if (pageName === "journal-remote.conf(5)") sectionName = "Remote";
            else if (pageName === "coredump.conf(5)") sectionName = "Coredump";
            else if (pageName === "resolved.conf(5)") sectionName = "Resolve";
            else if (pageName === "logind.conf(5)") sectionName = "Login";
            else if (pageName === "pstore.conf(5)") sectionName = "PStore";
            else if (pageName === "journald.conf(5)") sectionName = "Journal";
            else if (pageName === "homed.conf(5)") sectionName = "Home";
            else if (pageName === "systemd.path(5)") sectionName = "Path";
        }
        // print.debug(h2text);
        let sectionIndex: number | undefined;
        if (sectionName) {
            sectionIndex = nextIds.sections++;
            result.sections.push([ManifestItemType.Section, sectionIndex, sectionName]);
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
        const getCurrentDocsIndex = () => {
            if (typeof currentDocsIndex === "number") return currentDocsIndex;

            const $dd = $dt.next("dd");
            assertLength(`description of the directive "${text}"`, $dd, 1);
            const docsMarkdown = getMarkdownHelpFromElement($dd);
            if (!docsMarkdown) throw new Error(`No description for the directive "${text}"`);

            currentDocsIndex = nextIds.docs++;
            pushResult([ManifestItemType.DocsMarkdown, currentDocsIndex, docsMarkdown, urlRefId]);
            return currentDocsIndex;
        };

        const items = extractDirectiveSignature(text);
        for (const directive of items) {
            if (!validDirectiveNames.has(directive.name)) continue;

            duplicate.check(directive.name + (sectionName ? `in [${sectionName}]` : ""));
            pushResult([
                ManifestItemType.Directive,
                directive.name,
                directive.params,
                getCurrentDocsIndex(),
                manPageId,
                sectionIndex,
            ]);
        }
    }
    if (duplicate.hasDuplicate()) throw new Error(`Duplicate items in the page "${manPageURL}"`);

    result.directives.sort((a, b) => (a[1] > b[1] ? 1 : -1));
    return result;

    function getText(el: Cheerio<Element>) {
        el = el.clone();
        el.find("a.headerlink").remove();
        return el.text().trim();
    }
}
