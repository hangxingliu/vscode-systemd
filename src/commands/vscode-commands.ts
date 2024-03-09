import {
    workspace,
    ConfigurationTarget,
    commands,
    Command,
    TextDocument,
    window,
    QuickPickItem,
    QuickPickItemKind,
    ThemeIcon,
} from "vscode";
import { SystemdFileType, parseSystemdFilePath, systemdFileTypeNames } from "../parser/file-info";
import { SystemdDocumentManager } from "../vscode-documents";
import { ExtensionConfig } from "../config/vscode-config-loader";

export const vscodeCommandNS = "systemd";
export type CmdFullName = `${typeof vscodeCommandNS}.${CmdName}`;
export type CmdName = keyof Omit<SystemdCommands, "register">;

export class SystemdCommands {
    /** Generate a VSCode command descriptor */
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
        const currentType = manager.getType(document);
        const entries = Object.entries(systemdFileTypeNames);

        type ItemType = QuickPickItem & { typeStr?: string };
        const firstItems: Array<ItemType> = [];
        const items: Array<ItemType> = [];

        const recommendedProps = {
            iconPath: new ThemeIcon("star"),
            description: "recommended",
        } as const;

        const recommended = new Set<string>();
        const defaultType = parseSystemdFilePath(document.fileName, ExtensionConfig.instance.podmanCompletion);
        if (defaultType) recommended.add(String(defaultType));
        if (defaultType === SystemdFileType.network) recommended.add(String(SystemdFileType.podman_network));
        else if (defaultType === SystemdFileType.podman_network) recommended.add(String(SystemdFileType.network));

        const currentTypeStr = String(currentType);
        for (const [typeStr, typeName] of entries) {
            const item: ItemType = { label: typeName, typeStr };
            if (typeStr === currentTypeStr) {
                item.iconPath = new ThemeIcon("check");
                item.description = "current";
                firstItems.unshift(item);
                continue;
            }
            if (recommended.has(typeStr)) {
                Object.assign(item, recommendedProps);
                firstItems.push(item);
                continue;
            }
            items.push(item);
        }
        firstItems.push({ label: "", kind: QuickPickItemKind.Separator });

        const selected = await window.showQuickPick(firstItems.concat(items), {
            title: "Please select a type:",
        });
        if (!selected || typeof selected.typeStr !== "string") return;

        const newType = parseInt(selected.typeStr, 10) as SystemdFileType;
        if (defaultType === newType) manager.setAutoType(document);
        else manager.setType(document, newType);
        workspace.openTextDocument(document.uri);
    }
}
