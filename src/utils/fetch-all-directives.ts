#!/usr/bin/env node

import { directivesDataFile, systemdDocsURLs } from './config';
import { print, getText, initHttpCache, loadHtml, writeJSON } from './helper';
import type { Element } from "cheerio";

main().catch((error) => print.error(error.stack));
async function main() {
    initHttpCache();

    const result = [];

    const html = await getText("directives docs", systemdDocsURLs.directives);
    const $ = loadHtml(html);
    print.start("processing directives document");

    const allDirectives: Element[] = [];

    print.debug('finding special <h2>  ...');
    const h2Array = $('h2').toArray().filter(it => {
        const id = it.attribs.id;
        return id == 'Unit directives' || id == 'Network directives' || id == 'Journal fields' ||
            id == 'System manager directives' || id == 'Miscellaneous options and directives';
    });
    if (h2Array.length <= 0)
        throw new Error(`match result is empty!`);

    for (const h2 of h2Array) {
        print.debug('finding dl.variablelist > dt in h2\'s parent ...');
        const directives = $(h2.parent).find('dl.variablelist > dt').toArray();
        if (directives.length <= 0)
            throw new Error(`match result is empty!`);
        allDirectives.push(...directives);
    }

    for (const directiveElement of allDirectives) {
        const el = $(directiveElement);
        const name = directiveElement.attribs.id;
        if (!name)
            throw new Error(`element.attr.id is empty! (html: ${el.html()})`);

        if (!name.endsWith('=') && !name.endsWith('=1')) {
            print.warning(`skip non-directive item: ${name}`);
            continue;
        }

        const directiveName = name.replace(/=1?$/, '');
        const docLinks = $(directiveElement.next).find('a').toArray();
        if (docLinks.length <= 0)
            throw new Error(`document links for directive ${directiveName} is missing`);

        const docs = [];
        for (const docLink of docLinks) {
            const docName = $(docLink).find('.refentrytitle').text();
            if (!docName)
                throw new Error(`name of document links for directive ${directiveName} is missing`);

            let docURI = $(docLink).attr('href');
            docURI = docURI.replace(/\#.+$/, '');
            const docsHTML = await getText(`directive "${docURI}"`, systemdDocsURLs.base + docURI);
            const $docs = loadHtml(docsHTML);
            print.debug(`getting docs in ${docURI} ...`);

            const docsNameElement = $docs(`dl.variablelist > dt > .term > .varname`)
                .toArray().filter(it => (it?.firstChild?.['data'] || '').startsWith(directiveName));
            if (docsNameElement.length <= 0)
                throw new Error(`match result is empty! (${directiveName})`);

            const nameWithPlaceholder = $(docsNameElement[0]).text();

            const docsText = [];
            let docsElement = $docs(docsNameElement[0]).parents('dt')[0];
            while (docsElement.next && docsElement.next['tagName'].toLowerCase() == 'dd') {
                const el = docsElement.next;
                const $clone = $docs(el).clone();
                $clone.find('div').remove();
                docsText.push($clone.text());
                docsElement = el as any;
            }

            docs.push({
                name: docName,
                sign: nameWithPlaceholder,
                text: docsText[0] ? docsText[0].slice(0, 100).replace(/\s+/g, ' ') : '',
            });
        }
        result.push({ name: directiveName, docs });
    }

    // merge
    const mergeMap = {};
    for (const it of result) {
        if (!(it.name in mergeMap))
            mergeMap[it.name] = { name: it.name, docs: [] };
        mergeMap[it.name].docs.push(...it.docs);
    }

    writeJSON(directivesDataFile,
        Object.keys(mergeMap).map(key => mergeMap[key]));
    print.done();
}
