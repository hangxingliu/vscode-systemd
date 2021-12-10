import { resolve } from "path";

export const projectDir = resolve(__dirname, '../..');
export const srcDir = resolve(projectDir, 'src');
export const cacheDir = resolve(projectDir, 'cache');
export const hintDataDir = resolve(srcDir, 'hint-data');

export const directivesDataFile = resolve(hintDataDir, 'directives.json');

export const systemdDocsURLs = {
    base: 'https://www.freedesktop.org/software/systemd/man/',
    directives: 'https://www.freedesktop.org/software/systemd/man/systemd.directives.html',
}
