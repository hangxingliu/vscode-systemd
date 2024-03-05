import {
    window,
    Selection,
    Range,
    Position,
    TextDocument,
    TextDocumentChangeEvent,
    CodeActionProvider,
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
} from "vscode";
import {
    SystemdDiagnostic,
    SystemdDiagnosticManager,
    SystemdDiagnosticType,
    getDiagnosticForDeprecated,
    getDiagnosticForValue,
    getDiagnosticForUnknown,
} from "./diagnostics";
import { getDirectiveKeys } from "./parser/get-directive-keys";
import { deprecatedDirectivesSet, directivePrefixes, languageId } from "./syntax/const";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { SystemdCommands } from "./commands/vscode-commands";
import { SystemdDocumentManager } from "./vscode-documents";

export class SystemdLint implements CodeActionProvider {
    // NodeJS.Timer or number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private timer: any;
    constructor(private config: ExtensionConfig, private readonly managers: HintDataManagers) {}

    readonly onDidChangeTextDocument = (ev: TextDocumentChangeEvent) => {
        if (!this.config.lintDirectiveKeys) return;
        const { document, contentChanges } = ev;
        if (document.languageId !== languageId) return;
        if (!document.uri) return;
        if (contentChanges && contentChanges.length < 1) return;
        this.lintDocumentAsync(document);
    };

    readonly onDidOpenTextDocument = (document: TextDocument) => {
        if (!this.config.lintDirectiveKeys) return;
        if (document.languageId !== languageId) return;
        if (!document.uri) return;
        this.lintDocumentAsync(document);
    };

    lintAll() {
        for (const editor of window.visibleTextEditors) {
            const { document } = editor;
            if (!document) continue;
            if (document.languageId !== languageId) continue;
            if (!document.uri) continue;
            this.lintDocument(document);
        }
    }

    lintDocumentAsync(document: TextDocument) {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.lintDocument.bind(this, document), 300);
    }

    lintDocument(document: TextDocument) {
        const items: SystemdDiagnostic[] = [];
        const dirs = getDirectiveKeys(document.getText());
        const { config } = this;
        const { customDirectiveKeys, customDirectiveRegexps } = config;
        const fileType = SystemdDocumentManager.instance.getType(document);

        const managers = this.managers.subset(fileType);
        dirs.forEach((it) => {
            const directiveName = it.directiveKey.trim();
            const directiveNameLC = directiveName.toLowerCase();
            const getRange = (addOffset?: number) =>
                new Range(
                    new Position(it.loc1[1], it.loc1[2]),
                    new Position(it.loc2[1], it.loc2[2] + (addOffset || 0))
                );
            if (deprecatedDirectivesSet.has(directiveName)) {
                items.push(getDiagnosticForDeprecated(getRange(), directiveName));
                return;
            }
            // example lint:
            // https://github.com/systemd/systemd/blob/effefa30de46f25d0f50a36210a9835097381c2b/src/core/load-fragment.c#L665
            if (directiveName === "KillMode") {
                if (it.value.toLowerCase() === "none") {
                    const msg =
                        "Unit uses KillMode=none. " +
                        "This is unsafe, as it disables systemd's process lifecycle management for the service. " +
                        "Please update the service to use a safer KillMode=, such as 'mixed' or 'control-group'. " +
                        "Support for KillMode=none is deprecated and will eventually be removed.";
                    const d = getDiagnosticForValue(getRange(it.value.length + 1), directiveName, msg);
                    items.push(d);
                    return;
                }
            }

            if (directivePrefixes.find((p) => directiveName.startsWith(p))) return;
            if (managers.hasDirective(directiveNameLC)) return;
            if (customDirectiveKeys.indexOf(directiveName) >= 0) return;
            if (customDirectiveRegexps.findIndex((it) => it.test(directiveName)) >= 0) return;
            items.push(getDiagnosticForUnknown(getRange(), directiveName));
            return;
        });

        SystemdDiagnosticManager.get().set(document.uri, items);
        return items;
    }

    provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken
    ): CodeAction[] {
        const diagnostics = SystemdDiagnosticManager.get();
        const ds = diagnostics.get(document?.uri, range);
        const result: CodeAction[] = [];
        for (let i = 0; i < ds.length; i++) {
            const { type, directive } = ds[i];
            if (!directive) continue;
            if (type === SystemdDiagnosticType.unknownDirective) {
                const title1 = `Mark "${directive}" as a known directive globally`;
                const title2 = `Mark "${directive}" as a known directive for this workspace`;
                const action1 = new CodeAction(title1, CodeActionKind.QuickFix);
                const action2 = new CodeAction(title2, CodeActionKind.QuickFix);
                action1.command = SystemdCommands.get("addUnknownDirective", title1, [directive, "Global"]);
                action2.command = SystemdCommands.get("addUnknownDirective", title2, [directive, "Workspace"]);
                result.push(action2, action1);
            }
        }
        return result;
    }
}
