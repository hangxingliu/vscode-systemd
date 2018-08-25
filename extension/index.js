//@ts-check

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const DOCUMENT_SELECTOR = ['systemd-unit-file'];

const SECTIONS = ["Unit", "Install", "Service", "Socket", "Mount", "Automount", "Swap", "Path", "Timer"];

const DIRECTIVE_JSON = path.join(__dirname, '..', 'syntaxes', 'directives.json');

/** @returns {string} */
function getLastLineText(document, position) {
	if (position.line <= 1) return '';
	return document.lineAt(position.line - 1).text;
}

/** @returns {string} */
function getTextBeforeCursor(document, position) {
	var start = new vscode.Position(position.line, 0);
	var range = new vscode.Range(start, position);
	return document.getText(range);
}

/** @returns {string}  */
function getTextBeforeCursor(document, position) {
	const lineText = document.lineAt(position).text;
	const pos = position.character;
	return lineText.slice(0, pos);
}

/** @returns {string} */
function getTextAroundCursor(document, position) {
	let lineText = document.lineAt(position).text,
		pos = position.character;
	let beforeText = lineText.slice(0, pos),
		afterText = lineText.slice(pos);
	beforeText = (beforeText.match(/\w*$/) || [''])[0];
	afterText = (afterText.match(/^\w*/) || [''])[0];
	return beforeText + afterText;
}


function activate(context) {
	/** @type {any[]} */
	const directives = JSON.parse(fs.readFileSync(DIRECTIVE_JSON, 'utf8'));

	const completionItems = directives.map(it => {
		const completion = new vscode.CompletionItem(it.name, vscode.CompletionItemKind.Method);
		completion.detail = it.docs.map(doc => doc.name).join(' ');
		return completion;
	});

	let subscriptions = context.subscriptions;
	subscriptions.push(
		vscode.languages.registerCompletionItemProvider(DOCUMENT_SELECTOR, {
			provideCompletionItems: (document, position/*, token*/) => {
				const beforeText = getTextBeforeCursor(document, position);
				if (beforeText[0] == '#' || beforeText[0] == ';' || beforeText.indexOf('# ') >= 0 || beforeText.indexOf('; ') >= 0 ||
					beforeText.indexOf('=') >= 0)
					return;

				const mtx = beforeText.match(/^\s*\[(\w*)/);
				if (mtx)
					return SECTIONS.map(it => new vscode.CompletionItem(it, vscode.CompletionItemKind.Module));

				const lastLine = getLastLineText(document, position);
				if (lastLine.endsWith('\\'))
					return;

				const mtx2 = beforeText.match(/^\s*(\w*)/);
				if (!mtx2) return;
				return completionItems;
			},
			resolveCompletionItem: (item/*, token*/) => item
		}, '[\\n'));
}

function deactivate() {

}

exports.activate = activate;
exports.deactivate = deactivate;
