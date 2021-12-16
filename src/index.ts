import { CancellationToken, CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity, ExtensionContext, Hover, languages, Position, Range, SignatureHelp, SignatureHelpContext, SignatureInformation, TextDocument, window, workspace } from 'vscode';
import { ExtensionConfig } from './config/extension';
import { SystemdDiagnostic } from './diagnostics';
import { HintDataManager } from './hint-data/manager';
import { getCursorInfoFromSystemdConf } from './parser';
import { getDirectiveKeys } from './parser/get-directive-keys';
import { CursorType } from './parser/types';
import { deprecatedDirectivesSet, knownSections, languageId } from "./syntax/const";

const hintData = new HintDataManager();
const zeroPos = new Position(0, 0);

const completionItemsForSections = knownSections.map(it => {
    const ci = new CompletionItem(it, CompletionItemKind.Module);
    return ci;
})

export function activate(context: ExtensionContext) {
    hintData.addItems(require('./hint-data/directives.json'));

    const subs = context.subscriptions;
    const selector = [languageId];
    const config = ExtensionConfig.get()
    const diagnostic = SystemdDiagnostic.get();

    reloadConfig();
    subs.push(workspace.onDidChangeConfiguration(reloadConfig));

    subs.push(languages.registerCompletionItemProvider(selector, {
        provideCompletionItems,
        resolveCompletionItem: hintData.resolveDirectiveCompletionItem,
    }, '[', '=', '\n'));

    subs.push(languages.registerSignatureHelpProvider(selector, {
        provideSignatureHelp,
    }, "="));

    subs.push(languages.registerHoverProvider(selector, {
        provideHover,
    }));
    subs.push(workspace.onDidOpenTextDocument(document => lintDocument(document)));
    subs.push(workspace.onDidCloseTextDocument(document => diagnostic.delete(document.uri)))

    let timer: any;
    subs.push(workspace.onDidChangeTextDocument(ev => {
        const { document, contentChanges } = ev;
        if (document.languageId !== languageId) return;
        if (!document.uri) return;
        if (contentChanges.length < 1) return;
        clearTimeout(timer);
        timer = setTimeout(lintDocument.bind(this, document), 500);
    }))

    function reloadConfig() {
        config.reload();
        if (config.lintDirectiveKeys)
            window.visibleTextEditors.forEach(editor => lintDocument(editor.document));
        else
            diagnostic.clear();
    }
    function lintDocument(document: TextDocument) {
        if (!config.lintDirectiveKeys) return;
        if (document?.languageId !== languageId) return;
        if (!document.uri) return;

        const dirs = getDirectiveKeys(document.getText());
        const diagnostics = [];
        dirs.forEach(it => {
            const directiveName = it.directiveKey.trim();
            const directiveNameLC = directiveName.toLowerCase();
            const getRange = () => new Range(
                new Position(it.loc1[1], it.loc1[2]),
                new Position(it.loc2[1], it.loc2[2]),
            );
            if (deprecatedDirectivesSet.has(directiveName)) {
                const d = new Diagnostic(getRange(), `Deprecated directive "${directiveName}"`)
                d.severity = DiagnosticSeverity.Warning;
                diagnostics.push(d);
                return;
            }

            if (directiveNameLC.startsWith('x-')) return;
            if (hintData.directivesMap.has(directiveNameLC)) return;
            if (config.customDirectiveKeys.indexOf(directiveName) >= 0) return;
            if (config.customDirectiveRegexps.findIndex(it => it.test(directiveName)) >= 0)
                return;

            const d = new Diagnostic(getRange(), `Unknown directive "${directiveName}"`)
            d.severity = DiagnosticSeverity.Information;
            diagnostics.push(d);
        })
        diagnostic.set(document.uri, diagnostics)
    }

    function provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
        const beforeText = document.getText(new Range(zeroPos, position));
        const cursorContext = getCursorInfoFromSystemdConf(beforeText);
        switch (cursorContext.type) {
            case CursorType.directiveKey: return hintData.directives;
            case CursorType.section: return completionItemsForSections;
        }
    }
    function provideSignatureHelp(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: SignatureHelpContext
    ): SignatureHelp {
        const beforeText = document.getText(new Range(zeroPos, position));
        const cursor = getCursorInfoFromSystemdConf(beforeText);
        if (cursor.type !== CursorType.directiveValue) return null;

        const directive = (cursor.directiveKey || '').trim();
        const directiveNameLC = directive.toLowerCase();
        const dirs = hintData.directivesMap.getList(directiveNameLC);

        const help = new SignatureHelp();
        help.activeSignature = 0;
        help.signatures = dirs.map((dir) => {
            let sign = dir.signature;
            if (sign) sign += ' ';
            const manPage = hintData.manPages[dir.manPage];
            if (manPage) sign += manPage.title;
            return new SignatureInformation(sign, hintData.docsMarkdown[dir.docsMarkdown] || '')
        });
        return help;
    }

    function provideHover(document: TextDocument, position: Position): Hover {
        const beforeText = document.getText(new Range(zeroPos, position));
        const cursor = getCursorInfoFromSystemdConf(beforeText);

        const range = document.getWordRangeAtPosition(position);
        switch (cursor.type) {
            case CursorType.directiveKey: {
                const directive = document.getText(range);
                const directiveNameLC = directive.toLowerCase();
                const dirs = hintData.directivesMap.getList(directiveNameLC);
                if (dirs.length === 0) return null;
                const manPages = new Set<string>();
                const markdowns = [];
                dirs.forEach(it => {
                    const manPage = hintData.manPages[it.manPage];
                    const markdown = hintData.docsMarkdown[it.docsMarkdown];
                    if (manPage) manPages.add(manPage.title)
                    if (markdown) markdowns.push(markdown);
                })
                return new Hover([Array.from(manPages).join(', '), ...markdowns], range);
            }
        }
        return null;
    }
}

export function deactivate() {
    // noop
}
function createDiagnosticCollection() {
    throw new Error('Function not implemented.');
}

