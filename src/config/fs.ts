import { resolve } from "path";

export const projectDir = resolve(__dirname, '../..');
export const srcDir = resolve(projectDir, 'src');
export const cacheDir = resolve(projectDir, 'cache');
export const hintDataDir = resolve(srcDir, 'hint-data');

export const directivesDataFile = resolve(hintDataDir, 'directives.json');

