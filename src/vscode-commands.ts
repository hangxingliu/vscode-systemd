import { workspace, ConfigurationTarget, commands, Command } from "vscode";

export const vscodeCommandNS = "systemd";
export type CmdFullName = `${typeof vscodeCommandNS}.${CmdName}`;
export type CmdName = keyof Omit<SystemdCommands, "register">;

export type AddUnknownDirectiveCmdArgs = Parameters<SystemdCommands["addUnknownDirective"]>;

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
}
