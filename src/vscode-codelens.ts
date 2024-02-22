import { TextDocument, CancellationToken, CodeLensProvider, CodeLens } from "vscode";
import { ExtensionConfig } from "./config/vscode-config-loader";
import { HintDataManagers } from "./hint-data/manager/multiple";
import { systemdFileTypeNames } from "./parser/file-info";
import { SystemdCommands } from "./vscode-commands";
import { SystemdDocumentManager } from "./vscode-documents";

export class SystemdCodeLens implements CodeLensProvider {
    constructor(private config: ExtensionConfig, private readonly managers: HintDataManagers) {}

    provideCodeLenses(document: TextDocument, token: CancellationToken) {
        const manager = SystemdDocumentManager.instance;
        const fileType = manager.getType(document);
        const codeLens = new CodeLens(
            document.lineAt(0).range,
            SystemdCommands.get("changeUnitFileType", "Systemd Unit Type: " + systemdFileTypeNames[fileType], [
                document,
            ])
        );
        return [codeLens];
    }
}
