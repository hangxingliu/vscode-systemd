#!/usr/bin/env node

import { directivesDataFile, hintDataDir, systemdDocsURLs } from './config';
import { print, getText, initHttpCache, loadHtml, writeJSON, lengthShouldBeEqual, AssertLevel, MapList, lengthShouldBeMoreThanOrEqual, resolveURL, JsonFileWriter, toMarkdown } from './helper';
import { ManifestItemForDirective, ManifestItemForDocsMarkdown, ManifestItemForManPageInfo, ManifestItemType } from './types';
import type { Cheerio, Element } from "cheerio";

const normalizeDirectiveHeadingId = (id: unknown) => String(id || '').trim().replace(/\W/g, '').replace(/\s+/g, ' ').toLowerCase();
const parseManPageLink = (link: string) => {
    const index = link.lastIndexOf('#');
    if (index < 0) throw new Error(`Invalid man page link "${link}"`);
    const docsUri = link.slice(0, index);
    const itemId = link.slice(index + 1);
    return { docsUri, itemId };
}

main().catch((error) => print.error(error.stack));
async function main() {
    initHttpCache();

    const result = [];

    const html = await getText("directives docs", systemdDocsURLs.directives);
    const $ = loadHtml(html);
    print.start("processing directives document");

    const allDirectives: Element[] = [];

    const directiveHeadings = new Map([
        'Unit directives',
        'Home Area/User Account directives',
        'UDEV directives',
        'Network directives',
        'Journal fields',
        'PAM configuration directives',
        '/etc/crypttab, /etc/veritytab and /etc/fstab options',
        'systemd.nspawn(5) directives',
        'Program configuration options',
        'Miscellaneous options and directives',
    ].map(normalizeDirectiveHeadingId).map(it => [it, 0]));


    print.debug(`searching "h2" ...`);
    const allH2 = $('h2').toArray();
    // console.log(allH2.map(it=>it.attribs.id), allH2.length)
    lengthShouldBeEqual('all <h2>', allH2, 24, AssertLevel.WARNING);

    const directivesH2: typeof allH2 = [];
    for (const h2 of allH2) {
        const id = normalizeDirectiveHeadingId(h2.attribs.id);
        const existed = directiveHeadings.get(id)
        if (typeof existed !== 'number') continue;
        if (existed > 0)
            throw new Error(`Duplicated directive heading "${$(h2).text()}"`);
        directiveHeadings.set(id, existed + 1);
        directivesH2.push(h2);
    }
    lengthShouldBeEqual('<h2> about directives', directivesH2, directiveHeadings.size);

    type RawDirectiveInfo = {
        name: string,
        manPageIndex: number,
        itemId: string,
    }
    type ManPageInfo = {
        docsUri: string;
        docsName: string;
        directiveNames: string[];
    }
    const directivesMap = new MapList<RawDirectiveInfo>();
    const manPages: ManPageInfo[] = [{ docsUri: '', docsName: 'placeholder', directiveNames: [] }];

    let directivesCount = 0;
    for (const h2 of directivesH2) {
        const $h2 = $(h2);
        const h2Name = $h2.text().trim();
        print.debug(`searching "dl.variablelist > dt" in "${h2Name}" ...`);

        const dtArray = $h2.parent().find('dl.variablelist > dt').toArray();
        if (dtArray.length <= 0)
            throw new Error(`There are no dt elements in "${h2Name}"`);

        for (const dt of dtArray) {
            const $el = $(dt);
            const elText = $el.text();
            if (!dt.attribs.id) throw new Error(`The id attribute of dt "${elText}" is empty`);

            const $term = $el.find('span.term');
            lengthShouldBeEqual(`span.term of dt "${elText}"`, $term, 1);

            const termText = $term.text().trim();
            if (!termText.match(/^([\w\s\$\%\{\}\-\.\+"']+)=?$/))
                throw new Error(`Invalid term text "${termText}"`);
            // it is not a directive
            if (termText.indexOf('=') < 0) continue;
            if (!termText.endsWith('='))
                throw new Error(`Invalid term text "${termText}"`);

            const directiveName = termText.slice(0, -1);

            const $linkContainer = $el.next('dd');
            if ($linkContainer.length !== 1)
                throw new Error(`can't find dd element after directive "${termText}" (found=${$linkContainer.length})`);

            const $links = $linkContainer.find('a');
            lengthShouldBeMoreThanOrEqual(`links for "${termText}"`, $links, 1);

            $links.toArray().forEach(it => {
                const docsName = $(it).text();
                const docsLink = it.attribs.href;
                if (!docsLink) throw new Error(`no href attribute of document link element for directive "${termText}"`);

                const { docsUri, itemId } = parseManPageLink(docsLink);
                let manPageIndex = manPages.findIndex(it => it.docsUri === docsUri);
                if (manPageIndex < 0)
                    manPageIndex = manPages.push({ docsUri, docsName, directiveNames: [] }) - 1;
                directivesMap.push(directiveName, { name: directiveName, itemId, manPageIndex });
                manPages[manPageIndex].directiveNames.push(directiveName);
                directivesCount++;
            });
        }
    }
    print.debug(`found ${directivesCount} directives (${directivesMap.size} directive names)`);

    let docsMarkdownIndex = 1;
    const jsonFile = new JsonFileWriter(directivesDataFile);
    for (let manPageIndex = 1; manPageIndex < manPages.length; manPageIndex++) {
        const { docsUri, docsName, directiveNames } = manPages[manPageIndex];
        const manPageURL = resolveURL(systemdDocsURLs.directives, docsUri);

        const html = await getText(`man page "${docsName}"`, manPageURL);
        const $ = loadHtml(html);

        print.debug(`start processing man page "${docsName}" for ${directiveNames.length} directives ...`);

        const $nameH2 = $('.refnamediv h2');
        lengthShouldBeEqual(`name h2 of man page "${docsName}"`, $nameH2, 1);

        const description = $nameH2.next('p').text().trim();
        if (!description) throw new Error(`description of man page "${docsName}" is empty!`);

        print.debug(`man page "${docsName}" description: ${description}`);
        jsonFile.writeItem([
            ManifestItemType.ManPageInfo,
            manPageIndex,
            docsName,
            toMarkdown(description),
            docsUri
        ] as ManifestItemForManPageInfo);

        const $dtList = $('dt');
        const idMap = new Map<string, Cheerio<Element>>();
        const docsMap = new Map<string, number>();
        const idMap2 = new Map<string, Cheerio<Element>>();
        const docsMap2 = new Map<string, number>();
        $dtList.each((i, el) => {
            const $el = $(el);
            const id = el.attribs.id;
            const text = $el.text().trim();
            if (!id) throw new Error(`id field is empty for dt element "${text}"`);
            if (idMap.has(id))
                throw new Error(`duplicated dt element id "${id}"`);

            const $dd = $($el.next('dd'));
            lengthShouldBeEqual(`description of directive "${text}"`, $dd, 1);
            const docsMarkdown = toMarkdown($dd.html());

            jsonFile.writeItem([
                ManifestItemType.DocsMarkdown,
                docsMarkdownIndex,
                docsMarkdown,
            ] as ManifestItemForDocsMarkdown)

            idMap.set(id, $el);
            docsMap.set(id, docsMarkdownIndex);

            const parts = text.split(',');
            parts.forEach(part => {
                part = part.replace('¶', '').trim();
                const mtx = part.match(/^([\w\-\.]+)=/);
                if (!mtx) return;
                const id2 = mtx[1] + '=';
                idMap2.set(id2, $el);
                docsMap2.set(id2, docsMarkdownIndex);
            });
            docsMarkdownIndex++;
        });
        print.debug(`found ${idMap.size} dt elements`);

        for (const directiveName of directiveNames) {
            const directives = directivesMap.get(directiveName);
            const matchedDirectives = directives.filter(it => it.manPageIndex === manPageIndex);
            for (const directive of matchedDirectives) {
                let $dt = idMap.get(directive.itemId);
                let docs = docsMap.get(directive.itemId);
                if (!$dt) {
                    $dt = idMap2.get(directive.itemId);
                    docs = docsMap2.get(directive.itemId);
                }
                if (!$dt)
                    throw new Error(`can't found dt with id "${directive.itemId}"`);

                let signature = '';
                const text = $dt.text().replace('¶', '').trim();
                const index = text.indexOf(directiveName + '=');
                if (index >= 0) {
                    const mtx = text
                        .slice(index + directiveName.length + 1)
                        .match(/(.+?)(?=\s|,|$)/);
                    if (mtx) signature = mtx[1];
                }
                jsonFile.writeItem([
                    ManifestItemType.Directive,
                    directiveName,
                    signature,
                    docs,
                    manPageIndex,
                ] as ManifestItemForDirective);
            }
        }
    } // end of loop for man pages
    jsonFile.close();
    print.done();
}
