import { Uri } from "vscode";

const hiddenManPageTitles = new Set([
    "vconsole.conf(5)",
    "crypttab(5)",
    // A separate [Device] section does not exist, since no device-specific options may be configured.
    // https://www.freedesktop.org/software/systemd/man/latest/systemd.device.html
    "systemd.device(5)",
]);

// `man man`:
// 5      File Formats and Conventions
// /etc/vconsole.conf
export function isHiddenManPage(title: string, url: Uri) {
    if (title.includes('mkosi.md')) return false;
    if (hiddenManPageTitles.has(title)) return true;
    if (!title.includes("(5)")) return true;
    return false;
}
