import { CancellationToken, CodeAction, CodeActionContext, CodeActionKind, commands, CompletionContext, CompletionItem, CompletionItemKind, ConfigurationTarget, ExtensionContext, Hover, languages, Position, Range, Selection,SignatureHelp, SignatureHelpContext, SignatureInformation, TextDocument, window, workspace } from 'vscode';
import { ExtensionConfig } from './config/extension';
import { getDiagnosticForDeprecated, getDiagnosticForUnknown, SystemdDiagnostic, SystemdDiagnosticManager, SystemdDiagnosticType } from './diagnostics';
import { HintDataManager } from './hint-data/manager';
import { getCursorInfoFromSystemdConf } from './parser';
import { getDirectiveKeys } from './parser/get-directive-keys';
import { CursorType } from './parser/types';
import { customDirectives, deprecatedDirectivesSet, directivePrefixes, knownSections, languageId, optionsForServiceRestart, optionsForServiceType } from "./syntax/const";

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
    const commandNames = {
        addUnknownDirective: 'systemd.addUnknownDirective',
    }

    reloadConfig();
    subs.push(workspace.onDidChangeConfiguration(reloadConfig));

    subs.push(languages.registerCompletionItemProvider(selector, {
        provideCompletionItems,
        resolveCompletionItem: hintData.resolveDirectiveCompletionItem,
    }, '[', '=', '\n', '%', '.'));

    subs.push(languages.registerSignatureHelpProvider(selector, {
        provideSignatureHelp,
    }, "="));

    subs.push(languages.registerHoverProvider(selector, { provideHover }));
    subs.push(languages.registerCodeActionsProvider(selector, { provideCodeActions }));
    subs.push(commands.registerCommand(commandNames.addUnknownDirective, addUnknownDirective));
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
        const items: SystemdDiagnostic[] = [];
        dirs.forEach(it => {
            const directiveName = it.directiveKey.trim();
            const directiveNameLC = directiveName.toLowerCase();
            const getRange = () => new Range(
                new Position(it.loc1[1], it.loc1[2]),
                new Position(it.loc2[1], it.loc2[2]),
            );
            if (deprecatedDirectivesSet.has(directiveName)) {
                items.push(getDiagnosticForDeprecated(getRange(), directiveName));
                return
            }

            if (hintData.directivesMap.has(directiveNameLC)) return;
            if (directivePrefixes.find(p => directiveName.startsWith(p))) return;
            if (config.customDirectiveKeys.indexOf(directiveName) >= 0) return;
            if (config.customDirectiveRegexps.findIndex(it => it.test(directiveName)) >= 0)
                return;

            items.push(getDiagnosticForUnknown(getRange(), directiveName));
            return;
        })
        diagnostics.set(document.uri, items)
    }

    function provideCompletionItems(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: CompletionContext
    ): CompletionItem[] | undefined {
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
                if (cursorContext.section === '[Service]') {
                    const directiveNameLC = cursorContext.directiveKey.trim().toLowerCase();
                    switch (directiveNameLC) {
                        case 'type':
                            return optionsForServiceType.map(it => new CompletionItem(it, CompletionItemKind.Enum));
                        case 'restart':
                            return optionsForServiceRestart.map(it => new CompletionItem(it, CompletionItemKind.Enum));
                    }
                }
            }
        }
        function getPendingText() {
            if (!cursorContext || !cursorContext.pendingLoc) return '';
            const offset = cursorContext.pendingLoc[0];
            return beforeText.slice(offset);
        }
    }

    function provideSignatureHelp(
        document: TextDocument,
        position: Position,
        token: CancellationToken,
        context: SignatureHelpContext
    ): SignatureHelp | null {
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

    function provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext, token: CancellationToken): CodeAction[] {
        const ds = diagnostics.get(document?.uri, range);
        const result: CodeAction[] = [];
        for (let i = 0; i < ds.length; i++) {
            const { type, directive } = ds[i];
            if (type === SystemdDiagnosticType.unknownDirective) {
                const title1 = `Mark "${directive}" as a known directive globally`
                const title2 = `Mark "${directive}" as a known directive for this workspace`
                const action1 = new CodeAction(title1, CodeActionKind.QuickFix);
                const action2 = new CodeAction(title2, CodeActionKind.QuickFix);
                action1.command = {
                    title: title1,
                    command: commandNames.addUnknownDirective,
                    arguments: [directive, 'Global']
                };
                action2.command = {
                    title: title2,
                    command: commandNames.addUnknownDirective,
                    arguments: [directive, 'Workspace']
                };
                result.push(action2, action1)
            }
        }
        return result;
    }

    async function addUnknownDirective(directive: string, scope: 'Global' | 'Workspace' | 'WorkspaceFolder') {
        const key = 'systemd.customDirectiveKeys'.split('.')

        const conf = workspace.getConfiguration(key[0]);
        const value = new Set<string>(conf.get(key[1], []));
        value.add(directive);

        let scopeValue = ConfigurationTarget[scope];
        if (typeof scopeValue !== 'number') scopeValue = ConfigurationTarget.Global;

        conf.update(key[1], Array.from(value), scopeValue);
    }
}

export function deactivate() {
    // noop
}

