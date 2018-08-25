#!/usr/bin/env node
//@ts-check

const _ = require('lodash');
const colors = require('colors/safe');
const path = require('path');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const { request } = require('./request-with-cache');

const URL_DIRECTIVES = 'https://www.freedesktop.org/software/systemd/man/systemd.directives.html';
const URL_DOCS_BASE = 'https://www.freedesktop.org/software/systemd/man/';

const OUTPUT_DIR = path.join(__dirname, '../syntaxes/');
const OUTPUT_DIRECTIVES = path.join(OUTPUT_DIR, 'directives.json');

function doing(what) { console.log(colors.bold(`[.] ${what}`)); }
function debug(what) { console.log(colors.dim(`debug: ${what}`)); }

main().catch(error => console.log(colors.red(error)));

async function main() {
	const result = [];

	doing('Getting all directives ...');

	const response = await request(URL_DIRECTIVES, {});
	const $ = cheerio.load(response);

	/** @type {CheerioElement[]} */
	const allDirectives = [];

	debug('finding special <h2>  ...');
	const h2Array = $('h2').toArray().filter(it => {
		const id = it.attribs.id;
		return id == 'Unit directives' || id == 'Network directives' || id == 'Journal fields' ||
			id == 'System manager directives' || id == 'Miscellaneous options and directives';
	});
	if (h2Array.length <= 0)
		throw new Error(`match result is empty!`);

	for (const h2 of h2Array) {
		debug('finding dl.variablelist > dt in h2\'s parent ...');
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
			console.log(colors.yellow(`skip non-directive item: ${name}`));
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

			const docURI = $(docLink).attr('href');
			const docsResponse = await request(URL_DOCS_BASE + docURI, {});
			const $docs = cheerio.load(docsResponse);

			debug(`getting docs in ${docURI} ...`);

			const docsNameElement = $docs(`dl.variablelist > dt > .term > .varname`)
				.toArray().filter(it => _.get(it, 'firstChild.data', '').startsWith(directiveName));
			if (docsNameElement.length <= 0)
				throw new Error(`match result is empty! (${directiveName})`);

			const nameWithPlaceholder = $(docsNameElement[0]).text();

			const docsText = [];
			let docsElement = $docs(docsNameElement[0]).parents('dt')[0];
			while (docsElement.next && docsElement.next.tagName.toLowerCase() == 'dd') {
				const el = docsElement.next;
				const $clone = $docs(el).clone();
				$clone.find('div').remove();
				docsText.push($clone.text());

				docsElement = el;
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

	doing(`write to ${OUTPUT_DIRECTIVES} ...`)
	fs.writeFileSync(OUTPUT_DIRECTIVES,
		JSON.stringify(Object.keys(mergeMap).map(key => mergeMap[key]), null, '\t'));

	console.log(colors.inverse('success: all done!'));
}
