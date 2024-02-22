import { workspace, ConfigurationTarget, commands, Command, TextDocument, window, QuickPickItem } from "vscode";
import { SystemdFileType, systemdFileTypeNames } from "./parser/file-info";
import { SystemdDocumentManager } from "./vscode-documents";

export const vscodeCommandNS = "systemd";
export type CmdFullName = `${typeof vscodeCommandNS}.${CmdName}`;
export type CmdName = keyof Omit<SystemdCommands, "register">;

export class SystemdCommands {
    static get<Name extends CmdName>(name: Name, title: string, args?: Parameters<SystemdCommands[Name]>): Command {
        const fullName: CmdFullName = `${vscodeCommandNS}.${name}`;
        return { title, command: fullName, arguments: args };
    }

    register(name: CmdName) {
        const fullName: CmdFullName = `${vscodeCommandNS}.${name}`;
        return commands.registerCommand(fullName, this[name].bind(this));
    }

    async addUnknownDirective(directive: string, scope: "Global" | "Workspace" | "WorkspaceFolder") {
        const key = "systemd.customDirectiveKeys".split(".");

        const conf = workspace.getConfiguration(key[0]);
        const value = new Set<string>(conf.get(key[1], []));
        value.add(directive);

        let scopeValue = ConfigurationTarget[scope];
        if (typeof scopeValue !== "number") scopeValue = ConfigurationTarget.Global;

        conf.update(key[1], Array.from(value), scopeValue);
    }

    async changeUnitFileType(document?: TextDocument) {
        if (!document) {
            document = window.activeTextEditor?.document;
            if (!document) return;
        }

        const manager = SystemdDocumentManager.instance;
        const currentType = String(manager.getType(document)!);
        const entries = Object.entries(systemdFileTypeNames);

        type ItemType = QuickPickItem & { typeStr: string };
        const items: Array<ItemType> = entries.map(([typeStr, typeName]) => {
            return {
                label: typeName,
                typeStr,
                picked: currentType === typeStr,
            };
        });
        const selected = await window.showQuickPick(items, {
            title: "Please select a type:",
        });
        if (!selected) return;

        const newType = parseInt(selected.typeStr, 10) as SystemdFileType;
        manager.setType(document, newType);
        workspace.openTextDocument(document.uri);
    }
}
