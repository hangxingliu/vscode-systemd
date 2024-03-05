import { readFileSync, writeFileSync } from "fs";
import { packageJSON } from "./config/fs";
import { allVSCodeConfigs } from "./config/vscode-config";
import { vscodeCommandsHelp } from "./commands/vscode-commands-help";

const pkgJSON = readFileSync(packageJSON, "utf-8");
const indent = pkgJSON.match(/^\s+/m);

const pkg = JSON.parse(pkgJSON);
pkg.contributes.configuration[0].properties = allVSCodeConfigs;
pkg.contributes.commands = vscodeCommandsHelp;

writeFileSync(packageJSON, JSON.stringify(pkg, null, indent![0]) + "\n");
console.log(`updated "${packageJSON}"`);
