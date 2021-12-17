import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity, DiagnosticTag, ExtensionContext, Hover, languages, Position, Range, SignatureHelp, SignatureHelpContext, SignatureInformation, TextDocument, window, workspace } from 'vscode';
import { ExtensionConfig } from './config/extension';
import { SystemdDiagnosticManager } from './diagnostics';
import { HintDataManager } from './hint-data/manager';
import { getCursorInfoFromSystemdConf } from './parser';
import { getDirectiveKeys } from './parser/get-directive-keys';
import { CursorType } from './parser/types';
import { customDirectives, deprecatedDirectivesSet, directivePrefixes, knownSections, languageId } from "./syntax/const";

const hintData = new HintDataManager();
const zeroPos = new Position(0, 0);

const completionItemsForSections = knownSections.map(it => {
    const ci = new CompletionItem(it, CompletionItemKind.Module);
    return ci;
})

export function activate(context: ExtensionContext) {
    hintData.addItems(require('./hint-data/directives.json'));
    hintData.addFallbackItems(customDirectives);

    const subs = context.subscriptions;
    const selector = [languageId];
    const config = ExtensionConfig.get()
    const diagnostics = SystemdDiagnosticManager.get();

    reloadConfig();
    subs.push(workspace.onDidChangeConfiguration(reloadConfig));

    subs.push(languages.registerCompletionItemProvider(selector, {
        provideCompletionItems,
        resolveCompletionItem: hintData.resolveDirectiveCompletionItem,
    }, '[', '=', '\n', '%', '.'));

    subs.push(languages.registerSignatureHelpProvider(selector, {
        provideSignatureHelp,
    }, "="));

    subs.push(languages.registerHoverProvider(selector, {
        provideHover,
    }));
    subs.push(workspace.onDidOpenTextDocument(document => lintDocument(document)));
    subs.push(workspace.onDidCloseTextDocument(document => diagnostics.delete(document.uri)))

    let timer: NodeJS.Timeout;
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
            diagnostics.clear();
    }
    function lintDocument(document: TextDocument) {
        if (!config.lintDirectiveKeys) return;
        if (document?.languageId !== languageId) return;
        if (!document.uri) return;

        const dirs = getDirectiveKeys(document.getText());
        const items = [];
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
                d.tags = [DiagnosticTag.Deprecated]
                items.push(d);
                return;
            }

            if (hintData.directivesMap.has(directiveNameLC)) return;
            if (directivePrefixes.find(p => directiveName.startsWith(p))) return;
            if (config.customDirectiveKeys.indexOf(directiveName) >= 0) return;
            if (config.customDirectiveRegexps.findIndex(it => it.test(directiveName)) >= 0)
                return;

            const d = new Diagnostic(getRange(), `Unknown directive "${directiveName}"`)
            d.severity = DiagnosticSeverity.Information;
            items.push(d);
        })
        diagnostics.set(document.uri, items)
    }

    function provideCompletionItems(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: CompletionContext
    ): CompletionItem[] {
        const beforeText = document.getText(new Range(zeroPos, position));
        const cursorContext = getCursorInfoFromSystemdConf(beforeText);

        switch (cursorContext.type) {
            case CursorType.directiveKey: {
                const pending = getPendingText();

                let directives = hintData.directives
                const mtx = pending.match(/^(.+[\.\-])/);
                if (mtx) {
                    const prefix = mtx[1].toLowerCase();
                    directives = directives
                        .filter(it => it.directiveNameLC.startsWith(prefix));
                }

                const range = new Range(position.translate(0, -pending.length), position);
                directives.forEach(it => it.range = range);
                return directives;
            }
            case CursorType.section: return completionItemsForSections;
            case CursorType.directiveValue: {
                const pending = getPendingText();
                if (pending.endsWith('%') && !pending.endsWith('%%'))
                    return hintData.specifiers;
            }
        }
        function getPendingText() {
            const offset = cursorContext.pendingLoc[0];
            return beforeText.slice(offset);
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
            case CursorType.directiveValue: {
                const p0 = new Position(position.line, Math.max(position.character - 2, 0));
                const p1 = new Position(position.line, position.character + 2);
                const text = document.getText(new Range(p0, p1));
                const mtx = text.match(/\%(.)/);
                if (mtx) {
                    const ch = mtx[1]
                    const it = hintData.specifiers.find(it => it.specifierChar === ch);
                    if (it)
                        return new Hover([
                            `Specifier %${ch} (${it.specifierMeaning})`,
                            it.documentation,
                        ]);
                }
            }
        }
        return null;
    }
}

export function deactivate() {
    // noop
}

