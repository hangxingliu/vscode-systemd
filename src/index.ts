import { ExtensionContext, languages, workspace } from "vscode";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { SystemdDiagnosticManager } from "./diagnostics";
import { languageId } from "./syntax/const";
import { SystemdCompletionProvider } from "./vscode-completion";
import { SystemdSignatureProvider } from "./vscode-signature";
import { vscodeConfigNS } from "./config/vscode-config";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { SystemdLint } from "./vscode-lint";
import { SystemdCommands } from "./vscode-commands";
import { SystemdDocumentManager } from "./vscode-documents";

export function activate(context: ExtensionContext) {
    const hintDataManager = new HintDataManagers();
    const config = ExtensionConfig.init(context);
    hintDataManager.init();

    const subs = context.subscriptions;
    const selector = [languageId];
    const diagnostics = SystemdDiagnosticManager.get();

    const docs = SystemdDocumentManager.init();
    const completion = new SystemdCompletionProvider(config, hintDataManager);
    const signature = new SystemdSignatureProvider(hintDataManager);
    const lint = new SystemdLint(config, hintDataManager);
    const commands = new SystemdCommands();

    subs.push(
        workspace.onDidChangeConfiguration((e) => {
            if (!e.affectsConfiguration(vscodeConfigNS)) return;

            config.reload();
            if (config.lintDirectiveKeys) lint.lintAll();
            else diagnostics.clear();
        })
    );
    subs.push(completion.register());
    subs.push(signature.register());
    subs.push(languages.registerHoverProvider(selector, signature));
    subs.push(languages.registerCodeActionsProvider(selector, lint));
    subs.push(
        workspace.onDidOpenTextDocument((doc) => {
            if (docs.onDidOpenTextDocument(doc)) lint.onDidOpenTextDocument(doc);
        })
    );
    subs.push(workspace.onDidCloseTextDocument((document) => diagnostics.delete(document.uri)));
    subs.push(workspace.onDidChangeTextDocument(lint.onDidChangeTextDocument));

    subs.push(commands.register("addUnknownDirective"));
    if (config.lintDirectiveKeys) lint.lintAll();
}

export function deactivate() {
    // noop
}
