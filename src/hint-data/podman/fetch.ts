import { resolve } from "path";
import { cacheDir, manifestDir } from "../../config/fs";
import {
    JsonFileWriter,
    SimpleHttpCache,
    assertLength,
    findElements,
    getHTMLDoc,
    getMarkdownHelpFromElement,
    matchElementsByText,
    print,
} from "../../utils/crawler-utils";
import {
    ManifestItem,
    ManifestItemForDirective,
    ManifestItemForDocsMarkdown,
    ManifestItemType,
    PredefinedSignature,
} from "../types-manifest";
import { Cheerio, Element } from "cheerio";
import { extractDirectiveSignature } from "../extract-directive-signature";
import { _PODMAN_BOOLEAN_DIRECTIVES } from "./boolean-directives";

const url = "https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html";
const targetFile = resolve(manifestDir, "podman.json");

let jsonFile: JsonFileWriter<ManifestItem> | undefined;
main().catch((error) => {
    if (jsonFile) jsonFile.close();
    console.error(error.stack);
});
async function main() {
    SimpleHttpCache.init(cacheDir);
    const $ = await getHTMLDoc("podman-systemd.unit", url);
    const $allH1 = findElements($, "h1", ">=11");
    // $allH1.map((i, el) => console.log($(el).text()));
    const matchedH1 = matchElementsByText(
        $allH1,
        [
            "Container units [Container]",
            "Pod units [Pod]",
            "Kube units [Kube]",
            "Network units [Network]",
            "Volume units [Volume]",
            "Image units [Image]",
        ],
        {}
    );

    const manPageIndex = 1;
    const jsonFile = new JsonFileWriter<ManifestItem>(targetFile);
    jsonFile.writeItem([
        ManifestItemType.ManPageInfo,
        manPageIndex,
        "podman-systemd.unit(5)",
        "systemd units using Podman Quadlet",
        url,
    ]);
    let nextDocsId = 1;
    let nextSectionId = 1;

    for (const h1 of matchedH1) {
        const $h1 = $(h1);
        const h1text = getText($h1);
        const sectionNameMtx = h1text.match(/units\s+\[(\w+)\]/);
        if (!sectionNameMtx) throw new Error(`Unknown header "${h1text}"`);
        const [, sectionName] = sectionNameMtx;
        const sectionId = nextSectionId++;
        jsonFile.writeItem([ManifestItemType.Section, sectionId, sectionName]);
        print.start(`processing "${h1text}" ...`);

        const $allCode = findElements($h1.parent(), "section > h2 > code", ">0");

        const allDocs: ManifestItemForDocsMarkdown[] = [];
        const allDirectives: ManifestItemForDirective[] = [];
        for (const code of $allCode) {
            const $code = $(code);
            const title = getText($code);
            const signs = extractDirectiveSignature(title);
            assertLength("signatures in the header", signs, 1);

            const $link = findElements($code.parent(), "a.headerlink", "=1");
            const urlRefId = $link.attr("href");
            if (!urlRefId || !urlRefId.startsWith("#"))
                throw new Error(`Invalid link "${urlRefId}" to directive "${title}"`);

            const section = $code.parent("h2").parent("section");
            assertLength("the section of h2", section, 1);

            const cloned = section.clone();
            cloned.find(" > h2").remove();

            const markdown = getMarkdownHelpFromElement(cloned);
            const currentDocsIndex = nextDocsId++;
            allDocs.push([ManifestItemType.DocsMarkdown, currentDocsIndex, markdown, urlRefId]);

            const [sign] = signs;
            let signParams: string[] | PredefinedSignature | undefined;
            if (_PODMAN_BOOLEAN_DIRECTIVES.has(`[${sectionName}]${sign.name}`)) {
                signParams = PredefinedSignature.Boolean;
            }

            allDirectives.push([
                ManifestItemType.Directive,
                sign.name,
                signParams || sign.params,
                currentDocsIndex,
                manPageIndex,
                sectionId,
            ]);
        }
        allDirectives.sort((a, b) => (a[1] > b[1] ? 1 : -1));
        jsonFile.writeItems(allDocs);
        jsonFile.writeItems(allDirectives);
    }
    jsonFile.close();

    function getText(el: Cheerio<Element>) {
        el = el.clone();
        el.find("a.headerlink").remove();
        return el.text().trim();
    }
}
