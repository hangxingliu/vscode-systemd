import { ExtensionContext, languages, workspace } from "vscode";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { SystemdDiagnosticManager } from "./diagnostics";
import { languageId } from "./syntax/const-language-conf";
import { SystemdCompletionProvider } from "./vscode-completion";
import { SystemdSignatureProvider } from "./vscode-signature";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { SystemdLint } from "./vscode-lint";
import { SystemdCommands } from "./commands/vscode-commands";
import { SystemdCodeLens } from "./vscode-codelens";
import { SystemdDocumentManager } from "./vscode-documents";
import { SystemdCapabilities } from "./hint-data/manager/capabilities";

export function activate(context: ExtensionContext) {
    const hintDataManager = new HintDataManagers();
    const config = ExtensionConfig.init(context);
    hintDataManager.init();
    SystemdCapabilities.init();

    const docs = SystemdDocumentManager.init(context, config);
    const completion = new SystemdCompletionProvider(config, hintDataManager);
    const signature = new SystemdSignatureProvider(config, hintDataManager);
    const lint = new SystemdLint(config, hintDataManager, docs);
    const codeLens = new SystemdCodeLens(config, hintDataManager);
    const commands = new SystemdCommands();

    const subs = context.subscriptions;
    subs.push(docs, config);
    //
    subs.push(completion.register());
    subs.push(signature.register());
    //
    subs.push(languages.registerHoverProvider(selector, signature));
    subs.push(languages.registerCodeActionsProvider(selector, lint));
    subs.push(languages.registerCodeLensProvider(selector, codeLens));
    //
    subs.push(
        workspace.onDidOpenTextDocument((doc) => {
            if (docs.onDidOpenTextDocument(doc)) lint.onDidOpenTextDocument(doc);
        })
    );
    subs.push(workspace.onDidCloseTextDocument((document) => diagnostics.delete(document.uri)));
    subs.push(workspace.onDidChangeTextDocument(lint.onDidChangeTextDocument));
    subs.push(workspace.onDidDeleteFiles(docs.onDidDeleteFiles));
    //
    subs.push(commands.register("addUnknownDirective"));
    subs.push(commands.register("changeUnitFileType"));

    if (config.lintDirectiveKeys) lint.lintAll();
}

export function deactivate() {
    // noop
}
