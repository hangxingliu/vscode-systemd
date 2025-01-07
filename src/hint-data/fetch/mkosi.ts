import { resolve } from "path";
import { cacheDir, logsDir, manifestDir } from "../../config/fs";
import { JsonFileWriter, SimpleHttpCache, getText, print } from "../../utils/crawler-utils";
import {
    ManifestItem,
    ManifestItemForDirective,
    ManifestItemForDocsMarkdown,
    ManifestItemForSpecifier,
    ManifestItemType,
    PredefinedSignature,
} from "../types-manifest";
import { extractDirectiveSignature, isBooleanArgument } from "./utils/directive-signature";
import { getVersionInfoInURL, manpageURLs } from "../manpage-url";
import { findFirst, getTokensInSection, markdownLexer, toPlainText } from "../../utils/markdown-utils";
import type { Token, Tokens } from "marked";
import { CrawlerDiagnosisFile } from "../../utils/crawler-utils-diagnosis-file.js";
import { HintDataChanges } from "./systemd-changes.js";

const url = manpageURLs.mkosi;
const targetFile = resolve(manifestDir, "mkosi.json");

let jsonFile: JsonFileWriter<ManifestItem> | undefined;
main().catch((error) => {
    if (jsonFile) jsonFile.close();
    console.error(error.stack);
});
async function main() {
    const version = getVersionInfoInURL(url);
    const diagnosis = CrawlerDiagnosisFile.initOrGet(logsDir, `mkosi-${version.str}`);
    SimpleHttpCache.init(cacheDir);

    const pathnames = new URL(url).pathname.split("/");
    const manPageName = pathnames[pathnames.length - 1];
    const manPageIndex = 1;
    let nextDocsId = 1;
    let nextSectionId = 1;

    const prevManifest = HintDataChanges.fromFile(targetFile);

    const markdown = await getText("mkosi.md", url);
    const markdownTokens = markdownLexer(markdown);
    jsonFile = new JsonFileWriter<ManifestItem>(targetFile);
    jsonFile.writeItem([
        ManifestItemType.ManPageInfo,
        manPageIndex,
        manPageName,
        "mkosi - Build Bespoke OS Images",
        url,
    ]);

    //#region Specifiers
    let h2 = findFirst<Tokens.Heading>(
        markdownTokens,
        {
            heading: 2,
            text: "Specifiers",
        },
        "REQUIRED"
    );
    const allSpecifiers: ManifestItemForSpecifier[] = [];
    const tables: Tokens.Table[] = getTokensInSection(markdownTokens, h2.index).filter(
        (it) => it.type === "table"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any[];
    for (const table of tables) {
        const { header, rows } = table;
        const specifierIndex = header.findIndex((it) => toPlainText(it.tokens).trim().toLowerCase() === "specifier");
        if (specifierIndex < 0) continue;
        for (const row of rows) {
            const specNameCol = row.splice(specifierIndex, 1);
            if (!specNameCol) throw new Error(`Invalid row for specifiers: ${table.raw}`);
            const specName = toPlainText(specNameCol[0].tokens);
            const specDocs = row.map((it) => toPlainText(it.tokens)).join("\n");

            const mtx = specName.match(/^%(.)$/);
            if (!mtx) throw new Error(`Invalid specifier name "${specName}"`);
            allSpecifiers.push([ManifestItemType.Specifier, mtx[1], specDocs, ""]);
        }
    }
    allSpecifiers.sort((a, b) => (a[1] > b[1] ? 1 : -1));
    jsonFile.writeItems(allSpecifiers);
    //#endregion Specifiers

    h2 = findFirst<Tokens.Heading>(
        markdownTokens,
        {
            heading: 2,
            text: "Configuration Settings",
        },
        "REQUIRED"
    );

    const sectionsQueue: Array<{
        sectionName: string;
        sectionRefId: string;
        tokens: Token[];
    }> = [];
    for (let i = h2.index; i < markdownTokens.length; i++) {
        const h3 = findFirst<Tokens.Heading>(markdownTokens, {
            after: i,
            heading: 3,
            notInNewSection: true,
        });
        if (!h3) break;

        const h3text = h3.token.text;
        diagnosis.write(`h3`, `${JSON.stringify(h3text)}`);

        const mtx = h3text.match(/^\s*\[([\w-]+)\]\s+section/i);
        if (!mtx) throw new Error(`Invalid h3 text "${h3text}"`);

        const [, sectionName] = mtx;
        const sectionRefId = manPageName + "#" + getLinkId(h3text || "");

        const tokens = getTokensInSection(markdownTokens, h3.index);
        diagnosis.count(`h3.tokens`, tokens);
        sectionsQueue.push({ sectionName, sectionRefId, tokens });
        i = h3.index - 1;
    }
    sectionsQueue.sort((a, b) => (a.sectionName > b.sectionName ? 1 : -1));

    for (const { sectionName, sectionRefId, tokens } of sectionsQueue) {
        const sectionId = nextSectionId++;
        jsonFile.writeItem([ManifestItemType.Section, sectionId, sectionName]);
        diagnosis.write(`section`, sectionName + " " + sectionRefId);

        const isDirectiveToken = (token: Token): token is Tokens.Paragraph =>
            token.type === "paragraph" && token.raw.startsWith("`");

        const allDocs: ManifestItemForDocsMarkdown[] = [];
        const allDirectives: ManifestItemForDirective[] = [];
        for (let j = 0; j < tokens.length; j++) {
            const directiveToken = tokens[j];
            if (!isDirectiveToken(directiveToken)) continue;

            const title = toPlainText(directiveToken.tokens || []);
            const signs = extractDirectiveSignature(title);
            // const directives = title.split(/,\s*/).filter((it) => !/^(?:--|-\w$)/.test(it));
            // console.log(directives);

            const _docs: string[] = [];
            while (++j < tokens.length) {
                if (isDirectiveToken(tokens[j])) break;
                _docs.push(tokens[j].raw);
            }
            j--;

            const docs = _docs.join("").trim().replace(/^:\s+/, "");
            const docsText = toPlainText(markdownLexer(docs));
            const currentDocsIndex = nextDocsId++;
            allDocs.push([ManifestItemType.DocsMarkdown, currentDocsIndex, docs, sectionRefId]);

            for (const sign of signs) {
                // console.log(sign.name, sign.params);
                let signParams: string[] | PredefinedSignature | undefined;
                if (isBooleanArgument(docsText))
                    signParams = /\s+or\s+auto\W/.test(docsText)
                        ? PredefinedSignature.BooleanOrAuto
                        : PredefinedSignature.Boolean;

                allDirectives.push([
                    ManifestItemType.Directive,
                    sign.name,
                    signParams || sign.params,
                    currentDocsIndex,
                    manPageIndex,
                    sectionId,
                ]);
            }
        }
        diagnosis.count(`allDocs`, allDocs);
        diagnosis.count(`allDirectives`, allDirectives);

        allDirectives.sort((a, b) => (a[1] > b[1] ? 1 : -1));
        jsonFile.writeItems(allDocs);
        jsonFile.writeItems(allDirectives);
    }

    await jsonFile.close();

    const r = HintDataChanges.getChanges(prevManifest, HintDataChanges.fromFile(jsonFile.filePath));
    if (r.logs.length > 0) {
        diagnosis.writeHeader(`change info`);
        r.logs.forEach((it) => diagnosis.write(it.type, it.explain));
    }
    if (r.newSections.length > 0) r.newSections.forEach((it) => diagnosis.write(`new-section`, it));

    diagnosis.writeHeader(`overview`);
    diagnosis.count(`removed directives`, r.removed.length);
    diagnosis.count(`added directives`, r.added);
    diagnosis.count(`changed directives`, r.changed);
    diagnosis.count(`new sections`, r.newSections);
    print.info(
        `removed = ${r.removed.length}; added = ${r.added}; changed = ${r.changed}; new-sections = ${r.newSections.length}`
    );
    return;

    function getLinkId(text: string) {
        return text
            .replace(/(?:^\W+|\W+$)/g, "")
            .replace(/\W+/g, "-")
            .toLowerCase();
    }
}
