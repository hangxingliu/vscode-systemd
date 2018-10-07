#!/usr/bin/env node
//@ts-check

const path = require('path');
const TARGET = path.join(__dirname, '..', 'syntaxes', 'systemd-unit-file.tmLanguage.json');

const schema = "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json";
const syntaxName = "systemd unit file";
const scopeName = "source.systemdUnitFile";
const patterns = {
	"single-line-comments": {
		patterns: [{
			name: "comment.line",
			match: "#.*$"
		}, {
			name: "comment.line",
			match: ";.*$"
		}]
	},
	"known-sections": {
		patterns: [{
			name: "entity.name.section",
			match: "^\\s*\\[(Unit|Install|Service|Socket|Mount|Automount|Swap|Path|Timer)\\]"
		}]
	},
	"unknown-sections": {
		patterns: [{
			name: "keyword.other",
			match: "^\\s*\\[.*\\]"
		}]
	},
	"-sction-known-options-insert-point": null,
	// "install-section-known-options": {
	// 	  patterns: [{
	//      match: `^\\s*(Alias|WantedBy|RequiredBy|Also|DefaultInstance)\\s*=`,
	//      captures: { "1": { name: "entity.name.tag" } },
	// 	  }]
	// },
	"options-prefixed-with-x": {
		patterns: [{
			match: `^\\s*(X-.*)\\s*=`,
			captures: { "1": { name: "entity.name.tag" } },
		}]
	},
	"unknown-options": {
		patterns: [{
			name: "keyword.other",
			match: "^[^=]+="
		}]
	},
	"-constants-insert-point": null,
	// "socket-bind-ipv6-only": {
	// 	patterns: [{
	// 		name: "constant.language",
	// 		match: "\\b(default|both|ipv6-only)\\b"
	// 	}]
	// },
	"specifiers": {
		patterns: [{
			name: "constant.other.placeholder",
			match: "(%(n|N|p|P|i|I|f|c|r|R|t|u|U|h|s|m|b|H|v|)\\b|%%)"
		}]
	},
	"booleans": {
		patterns: [{
			name: "constant.language",
			match: "\\b(true|false|on|off|yes|no)\\b"
		}]
	},
	"numbers": {
		patterns: [{
			name: "constant.numeric",
			match: "\\b\\d+\\b"
		}]
	},
	"suffixed-with-a-time-unit": {
		patterns: [{
			name: "constant.numeric",
			match: "\\b\\d+(s|min|h|d|w|ms|us)\\b"
		}]
	}
};

const fs = require('fs-extra');

main();
function main() {
	const optionsMap = {};
	const directives = fs.readJSONSync(path.join(__dirname, '..', 'syntaxes', 'directives.json'));
	directives.forEach(it => {
		const directiveName = it.name;
		it.docs.forEach(doc => {
			if (!(doc.name in optionsMap))
				optionsMap[doc.name] = [];
			optionsMap[doc.name].push(directiveName);
		})
	});
	const constants = fs.readJSONSync(path.join(__dirname, 'constants-map.json'));

	const repositoryResult = {};
	Object.keys(patterns).map(key => {
		if (key == '-sction-known-options-insert-point') {
			for (const sectionName in optionsMap) {
				const repoName = sectionName.replace(/^systemd\./, '') + '-section-known-options';
				repositoryResult[repoName] = {
					patterns: [{
						match: `^\\s*(${optionsMap[sectionName].join('|')})\\s*=`,
						captures: { "1": { name: "entity.name.tag" } },
					}]
				};
			}
			return;
		}
		if (key == '-constants-insert-point') {
			for (const constantName in constants) {
				const repoName = constantName.split(',')[0].replace(/\W/g, '-').toLowerCase() + '-constants';
				repositoryResult[repoName] = {
					patterns: [{
						name: "constant.language",
						match: `\\b(${constants[constantName].join('|')})\\b`
					}]
				};
			}
			return;
		}
		repositoryResult[key] = patterns[key];
	})

	const tmLanguageResult = {
		"$schema": schema,
		"!!!!  WARNING  !!!!": "This file is generated by utils script! DON'T edit it manually!",
		name: syntaxName,
		patterns: Object.keys(repositoryResult).map(it => ({ include: '#' + it })),
		repository: repositoryResult,
		scopeName
	};

	fs.writeJsonSync(TARGET, tmLanguageResult, { spaces: '\t' });
	console.log(`success: syntax file are generated!`);
	console.log(`  time: ${new Date().toLocaleString()}`);
	console.log(`  file: ${TARGET}`);
}

