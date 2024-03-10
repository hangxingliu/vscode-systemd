import { resolve } from "path";

export const projectDir = resolve(__dirname, '../..');
export const srcDir = resolve(projectDir, 'src');
export const cacheDir = resolve(projectDir, 'cache');
export const logsDir = resolve(projectDir, 'logs');
export const hintDataDir = resolve(srcDir, 'hint-data');
export const packageJSON = resolve(projectDir, 'package.json');

export const manifestDir = resolve(hintDataDir, 'manifests');
export const defaultManifestFile = resolve(hintDataDir, 'default.json');
export const tmLanguageFile = resolve(srcDir, 'syntax/systemd.tmLanguage');

