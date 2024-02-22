import { readFileSync, writeFileSync } from "fs";
import { packageJSON } from "./config/fs";
import { allVSCodeConfigs } from "./config/vscode-config";
import type { CommandItem } from "./commands/vscode-command-types";
import type { CmdFullName } from "./vscode-commands";

const commandsInManifest: ReadonlyArray<CommandItem<CmdFullName>> = [
    {
        command: "systemd.changeUnitFileType",
        category: "Systemd",
        title: "Change the type of the current unit file",
    },
];

const pkgJSON = readFileSync(packageJSON, "utf-8");
const indent = pkgJSON.match(/^\s+/m);

const pkg = JSON.parse(pkgJSON);
pkg.contributes.configuration[0].properties = allVSCodeConfigs;
pkg.contributes.commands = commandsInManifest;

writeFileSync(packageJSON, JSON.stringify(pkg, null, indent![0]) + "\n");
console.log(`updated "${packageJSON}"`);
