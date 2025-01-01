import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    Position,
    Range,
    Selection,
    TextDocument,
    TextDocumentChangeEvent,
    Uri,
    WorkspaceEdit,
    window,
    workspace,
} from "vscode";
import { SystemdCommands } from "./commands/vscode-commands";
import { ExtensionConfig, ReloadedConfigEvent } from "./config/vscode-config-loader";
import {
    SystemdDiagnostic,
    SystemdDiagnosticManager,
    SystemdDiagnosticType,
    getDiagnosticForDeprecated,
    getDiagnosticForUnknown,
    getDiagnosticForValue,
    saveExtraPropsForDiagnostic,
} from "./diagnostics";
import type { HintDataManagers } from "./hint-data/manager/multiple";
import { lintDirectiveValue } from "./lint/lint-directive-value";
import { allLanguageIds } from "./syntax/const-language-conf";
import type { SetDocumentTypeEvent, SystemdDocumentManager } from "./vscode-documents";
import { getDirectivesFromTokens } from "./parser-v2/get-directives";
import { tokenizer } from "./parser-v2/tokenizer";
import { CommonOptions, LocationTuple } from "./parser-v2/types";
import { SystemdFileType } from "./parser/file-info";

export class SystemdLint implements CodeActionProvider {
    // NodeJS.Timer or number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private timer: any;
    private deprecatedNames?: Set<string>;
    constructor(
        private readonly config: ExtensionConfig,
        private readonly managers: HintDataManagers,
        private readonly documents: SystemdDocumentManager
    ) {
        config.event(this.afterChangedConfig);
        documents.event(this.afterChangedDocTypes);
    }

    private readonly afterChangedDocTypes = (e: SetDocumentTypeEvent) => {
        if ("all" in e && e.all) return this.lintAllAsync(false);
        if ("fileName" in e) {
            const docs = workspace.textDocuments.filter((it) => it.fileName === e.fileName);
            for (const doc of docs) this.lintDocumentAsync(doc);
        }
    };

    private readonly afterChangedConfig = (e: ReloadedConfigEvent) => {
        const { prev, config } = e;
        if (prev.lintDirectiveKeys !== config.lintDirectiveKeys || prev.version !== config.version) {
            delete this.deprecatedNames;
            if (config.lintDirectiveKeys) this.lintAllAsync(false);
            else SystemdDiagnosticManager.init().clear();
        }
    };

    readonly onDidChangeTextDocument = (ev: TextDocumentChangeEvent) => {
        if (!this.config.lintDirectiveKeys) return;
        const { document, contentChanges } = ev;
        if (!allLanguageIds.has(document.languageId)) return;
        if (!document.uri) return;
        if (contentChanges && contentChanges.length < 1) return;
        this.lintDocumentAsync(document);
    };

    readonly onDidOpenTextDocument = (document: TextDocument) => {
        if (!this.config.lintDirectiveKeys) return;
        if (!allLanguageIds.has(document.languageId)) return;
        if (!document.uri) return;
        this.lintDocumentAsync(document);
    };

    private getDeprecatedNames() {
        if (!this.deprecatedNames) this.deprecatedNames = this.managers.getDeprecatedNames(this.config.version);
        return this.deprecatedNames;
    }

    lintAll(onlyVisible = true) {
        const lint = (document?: TextDocument) => {
            if (!document) return;
            if (!allLanguageIds.has(document.languageId)) return;
            if (!document.uri) return;
            this.lintDocument(document);
        };

        if (onlyVisible) for (const editor of window.visibleTextEditors) lint(editor.document);
        else for (const doc of workspace.textDocuments) lint(doc);
    }

    lintDocumentAsync(document: TextDocument) {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.lintDocument.bind(this, document), 300);
    }
    lintAllAsync(onlyVisible: boolean) {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.lintAll.bind(this, onlyVisible), 300);
    }

    lintDocument(document: TextDocument) {
        const { config } = this;
        const { customDirectiveKeys, customDirectiveRegexps } = config;
        const fileType = this.documents.getType(document);

        const mkosiMode = fileType === SystemdFileType.mkosi
        const opts: CommonOptions = { mkosi: mkosiMode };
        const { tokens } = tokenizer(document.getText(), opts);
        const dirs = getDirectivesFromTokens(tokens);
        // console.log("lintDocument", dirs);

        const items: SystemdDiagnostic[] = [];
        const managers = this.managers.subset(fileType);
        const deprecatedNames = this.getDeprecatedNames();
        dirs.forEach((it) => {
            if (!it.key) return;

            let directiveName = it.key.trim();
            // compatible with the old mkosi `@` syntax (they have removed it)
            if (mkosiMode && directiveName.startsWith('@'))
                directiveName = directiveName.slice(1);
            const directiveNameLC = directiveName.toLowerCase();

            //#region lint by name
            if (directiveNameLC.startsWith("x-")) return;
            if (directiveNameLC.startsWith("-")) return;
            if (customDirectiveKeys.indexOf(directiveName) >= 0) return;
            if (customDirectiveRegexps.findIndex((it) => it.test(directiveName)) >= 0) return;
            //#endregion lint by name

            const {
                keyRange: [start, end],
                valueRanges,
            } = it;
            const getRange = () => new Range(new Position(start[1], start[2]), new Position(end[1], end[2]));
            const getValueRange = () => {
                let start: LocationTuple;
                let end: LocationTuple;
                if (valueRanges.length > 0) {
                    start = valueRanges[0][0];
                    end = valueRanges[valueRanges.length - 1][1];
                } else {
                    start = it.keyRange[0];
                    end = it.keyRange[1];
                }
                return new Range(new Position(start[1], start[2]), new Position(end[1], end[2]));
            };

            if (deprecatedNames.has(directiveName)) {
                const matched = managers.getDirectiveList(directiveName, {
                    section: it.section,
                    file: fileType,
                });
                if (matched && matched.length > 0) {
                    for (const it of matched) {
                        if (!it.deprecated) continue;

                        const d = getDiagnosticForDeprecated(getRange(), directiveName);
                        if (it.fix) {
                            const { help, rename, url } = it.fix;
                            d.message = help;
                            if (rename) d.rename = rename;
                            if (url) d.url = url;
                        }
                        d.message += `\nSince version "${it.deprecated}"`;
                        return items.push(d);
                    }
                }
            }

            // lint value
            const matched = lintDirectiveValue(it);
            if (matched) {
                let msg = matched.msg;
                if (matched.url) msg += `\n${matched.url}`;
                const d = getDiagnosticForValue(getValueRange(), directiveName, msg);
                return items.push(d);
            }

            if (managers.hasDirective(directiveNameLC)) return;
            items.push(getDiagnosticForUnknown(getRange(), directiveName));
            return;
        });

        SystemdDiagnosticManager.init().set(document.uri, items);
        for (const it of items) saveExtraPropsForDiagnostic(it);
        return items;
    }

    provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken
    ): CodeAction[] | null {
        if (context.diagnostics.length <= 0) return null;
        // console.log(context.diagnostics[0]);
        // const diagnostics = SystemdDiagnosticManager.init();
        // const diagnostics = diagnostics.get(document?.uri, range);
        const result: CodeAction[] = [];
        for (let i = 0; i < context.diagnostics.length; i++) {
            const ds = context.diagnostics[i];
            if (typeof ds.code !== "string" || ds.code[0] !== "{") continue;
            const { type, directive, rename, url } = JSON.parse(ds.code) as SystemdDiagnostic;
            const { range } = ds;
            if (!directive) continue;
            if (type === SystemdDiagnosticType.unknownDirective) {
                const title1 = `Mark "${directive}" as a known directive globally`;
                const title2 = `Mark "${directive}" as a known directive for this workspace`;
                const action1 = new CodeAction(title1, CodeActionKind.QuickFix);
                const action2 = new CodeAction(title2, CodeActionKind.QuickFix);
                action1.command = SystemdCommands.get("addUnknownDirective", title1, [directive, "Global"]);
                action2.command = SystemdCommands.get("addUnknownDirective", title2, [directive, "Workspace"]);
                action1.diagnostics = [ds];
                result.push(action2, action1);
                continue;
            }

            if (type === SystemdDiagnosticType.deprecatedDirective) {
                if (rename) {
                    const title = `Rename to "${rename}"`;
                    const action = new CodeAction(title, CodeActionKind.QuickFix);
                    const edit = new WorkspaceEdit();
                    edit.replace(document.uri, range, rename, {
                        label: `Rename deprecated directive`,
                        needsConfirmation: false,
                    });
                    action.edit = edit;
                    action.diagnostics = [ds];
                    result.push(action);
                    continue;
                }

                if (url) {
                    const uri = Uri.parse(url);
                    const title = `Show external help on "${uri.authority}"`;
                    const action = new CodeAction(title, CodeActionKind.QuickFix);
                    action.command = {
                        title,
                        command: "vscode.open",
                        arguments: [uri],
                    };
                    action.diagnostics = [ds];
                    result.push(action);
                    continue;
                }
            }
        }
        return result;
    }
}
