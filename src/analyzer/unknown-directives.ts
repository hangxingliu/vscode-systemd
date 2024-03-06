import { readdirSync, readFileSync } from 'fs'
import { resolve as resolvePath } from 'path'
import { isManifestItemForDirective } from "../hint-data/types-manifest"
import { getDirectiveKeys } from "../parser/get-directive-keys"
import { customDirectives } from "../hint-data/custom-directives"

const hintData: unknown[][] = require('../../src/hint-data/directives.json');
const directiveNames = new Set(hintData.filter(isManifestItemForDirective).map(it => it[1]));

const customNames = new Set<string>();
customDirectives.forEach(it => {
    const names = Array.isArray(it.name) ? it.name : [it.name];
    names.forEach(name => customNames.add(name));
})

const baseDir = resolvePath(__dirname, 'systemd');
const files = readdirSync(baseDir, { withFileTypes: true }).filter(it => it.isFile()).map(it => resolvePath(baseDir, it.name));

const unknownKeys = new Set<string>();
for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const conf = readFileSync(file, 'utf8');
    const directives = getDirectiveKeys(conf);
    for (let j = 0; j < directives.length; j++) {
        const { directiveKey } = directives[j];
        if (directiveKey.startsWith("X-") || directiveKey.startsWith('x-')) continue;
        if (directiveKey.startsWith('_')) continue;
        if (directiveKey.match(/^[A-Z_]+$/)) continue;
        if (customNames.has(directiveKey)) continue;
        if (directiveNames.has(directiveKey)) continue;
        unknownKeys.add(directiveKey);
    }
}
console.log(Array.from(unknownKeys));
