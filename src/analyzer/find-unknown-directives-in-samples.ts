import * as glob from "glob";
import { readFileSync } from "fs";
import { resolve as resolvePath } from "path";
import { isManifestItemForDirective } from "../hint-data/types-manifest";
import { CommonOptions } from "../parser-v2/types";
import { tokenizer } from "../parser-v2/tokenizer";
import { getDirectivesFromTokens } from "../parser-v2/get-directives";
import { customDirectives } from "../hint-data/custom-directives";
import { listManifestFiles } from "./_include.js";

const directiveNames = new Set<string>();
const manifestFiles = listManifestFiles();
for (const file of manifestFiles)
    for (const item of file.items) if (isManifestItemForDirective(item)) directiveNames.add(item[1]);

const customNames = new Set<string>();
customDirectives.forEach((it) => {
    const names = Array.isArray(it.name) ? it.name : [it.name];
    names.forEach((name) => customNames.add(name));
});

const cwd = resolvePath(__dirname, "../../test/samples");
const files: string[] = glob.sync("{systemd,mkosi}/**/*.{service,socket,conf,network,target,path}", { cwd });

const unknownKeys = new Set<string>();
for (let i = 0; i < files.length; i++) {
    const opts: CommonOptions = {};
    if (files[i].startsWith("mkosi/")) opts.mkosi = true;

    const filePath = resolvePath(cwd, files[i]);
    const conf = readFileSync(filePath, "utf8");
    const { tokens } = tokenizer(conf, opts);

    const directives = getDirectivesFromTokens(tokens, opts);
    for (let j = 0; j < directives.length; j++) {
        const { key: directiveKey } = directives[j];
        if (directiveKey.startsWith("X-") || directiveKey.startsWith("x-")) continue;
        if (directiveKey.startsWith("_")) continue;
        if (directiveKey.match(/^[A-Z_]+$/)) continue;
        if (customNames.has(directiveKey)) continue;
        if (directiveNames.has(directiveKey)) continue;
        if (unknownKeys.has(directiveKey)) continue;

        console.warn(`Unknown directive "${directiveKey}" in ${files[i]}`);
        unknownKeys.add(directiveKey)
    }
}
// console.log(Array.from(unknownKeys));
