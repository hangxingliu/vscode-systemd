import { ExtensionContext, languages, workspace } from "vscode";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { SystemdDiagnosticManager } from "./diagnostics";
import { languageIds } from "./syntax/const-language-conf";
import { SystemdCompletionProvider } from "./vscode-completion";
import { SystemdSignatureProvider } from "./vscode-signature";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { SystemdLint } from "./vscode-lint";
import { SystemdCommands } from "./commands/vscode-commands";
import { SystemdCodeLens } from "./vscode-codelens";
import { SystemdDocumentManager } from "./vscode-documents";
import { SystemdCapabilities } from "./hint-data/manager/capabilities";
import { SystemdUnitsManager } from "./hint-data/manager/special-units";
import { SystemdFoldingRange } from "./vscode-folding-range";

export function activate(context: ExtensionContext) {
    const config = ExtensionConfig.init(context);
    const hintDataManager = new HintDataManagers();
    hintDataManager.init();
    SystemdCapabilities.init();
    SystemdUnitsManager.init();

    const diagnostics = SystemdDiagnosticManager.init();
    const docs = SystemdDocumentManager.init(context, config);
    const completion = new SystemdCompletionProvider(config, hintDataManager);
    const signature = new SystemdSignatureProvider(config, hintDataManager);
    const lint = new SystemdLint(config, hintDataManager, docs);
    const codeLens = new SystemdCodeLens(config, hintDataManager);
    const foldingRange = new SystemdFoldingRange();
    const commands = new SystemdCommands();

    const subs = context.subscriptions;
    subs.push(docs, config, diagnostics);
    //
    subs.push(completion.register());
    subs.push(signature.register());
    //
    subs.push(languages.registerHoverProvider(languageIds, signature));
    subs.push(languages.registerCodeActionsProvider(languageIds, lint));
    subs.push(languages.registerCodeLensProvider(languageIds, codeLens));
    subs.push(languages.registerFoldingRangeProvider(languageIds, foldingRange));
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
    subs.push(...commands.registerAll());

    if (config.lintDirectiveKeys) lint.lintAll();
}

export function deactivate() {
    // noop
}
