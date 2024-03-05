import { CmdFullName } from "./vscode-commands";
import { CommandItem } from "./vscode-commands-types";

export const vscodeCommandsHelp: ReadonlyArray<CommandItem<CmdFullName>> = [
    {
        command: "systemd.changeUnitFileType",
        category: "Systemd",
        title: "Change the type of the current unit file",
    },
];
