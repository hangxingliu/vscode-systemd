import { CompletionItem, CompletionItemKind, ExtensionContext, languages, Position, Range, TextDocument } from 'vscode';
import { knownSections } from "./syntax/const";

let directives = [];
const DOCUMENT_SELECTOR = ['systemd-unit-file'];
const completionItemsForSections = knownSections.map(it => {
    const ci = new CompletionItem(it, CompletionItemKind.Module);
    return ci;
})

function getLastLineText(document: TextDocument, position: Position): string {
    if (position.line <= 1) return '';
    return document.lineAt(position.line - 1).text;
}
function getTextBeforeCursor(document: TextDocument, position: Position): string {
    var start = new Position(position.line, 0);
    var range = new Range(start, position);
    return document.getText(range);
}

export function activate(context: ExtensionContext) {
    directives = require('./hint-data/directives.json');

    const completionItems = directives.map(it => {
        const completion = new CompletionItem(it.name, CompletionItemKind.Method);
        completion.detail = it.docs.map(doc => doc.name).join(' ');
        return completion;
    });

    let subscriptions = context.subscriptions;
    subscriptions.push(languages.registerCompletionItemProvider(DOCUMENT_SELECTOR, {
        provideCompletionItems,
        resolveCompletionItem: (item) => item
    }, '[', '=', '\n'));

    function provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
        const beforeText = getTextBeforeCursor(document, position);
        if (beforeText[0] == '#' || beforeText[0] == ';' || beforeText.indexOf('# ') >= 0 || beforeText.indexOf('; ') >= 0 ||
            beforeText.indexOf('=') >= 0)
            return;

        const mtx = beforeText.match(/^\s*\[(\w*)/);
        if (mtx) return completionItemsForSections;

        const lastLine = getLastLineText(document, position);
        if (lastLine.endsWith('\\'))
            return;

        const mtx2 = beforeText.match(/^\s*(\w*)/);
        if (!mtx2) return;
        return completionItems;
    }
}

export function deactivate() {
    // noop
}
