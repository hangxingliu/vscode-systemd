/**
 * MANUAL SECTIONS
 *   The standard sections of the manual include:
 *
 *   1      User Commands
 *   2      System Calls
 *   3      C Library Functions
 *   4      Devices and Special Files
 *   5      File Formats and Conventions
 *   6      Games et. al.
 *   7      Miscellanea
 *   8      System Administration tools and Daemons
 */
export type ManPageBase = "linux" | "systemd";
const manPageBase = {
    linux: "https://man7.org/linux/man-pages/",
    systemd: "https://www.freedesktop.org/software/systemd/man/latest/",
};
export const manpageURLs = {
    historyBase: (version: number) => `https://www.freedesktop.org/software/systemd/man/${version}/`,
    //
    base: "https://www.freedesktop.org/software/systemd/man/257/",
    specifiers: "https://www.freedesktop.org/software/systemd/man/257/systemd.unit.html",
    directives: "https://www.freedesktop.org/software/systemd/man/257/systemd.directives.html",
    specialUnits: "https://www.freedesktop.org/software/systemd/man/257/systemd.special.html",
    //
    podman: "https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html",
    podmanBase: "https://docs.podman.io/en/latest/markdown/",
    //
    // mkosi: "https://raw.githubusercontent.com/systemd/mkosi/main/mkosi/resources/man/mkosi.1.md", //
    mkosi: "https://raw.githubusercontent.com/systemd/mkosi/b67d9048ddabc1257efaf32a93381238672fdd6f/mkosi/resources/man/mkosi.1.md", // 2024-01-08
    // mkosi: "https://raw.githubusercontent.com/systemd/mkosi/2d8ea594b1b44777f90b03e82f370ac604ff1482/mkosi/resources/mkosi.md", // 2024-09-29
    mkosiBase: "https://github.com/systemd/mkosi/blob/main/mkosi/resources/man/",
    //
    capabilities: "https://man7.org/linux/man-pages/man7/capabilities.7.html",
    capabilitiesBase: "https://man7.org/linux/man-pages/man7/",
} as const;

type VersionInfo = { str: string; asInt?: number };
export function getVersionInfoInURL(url: `${string}/man/${string}` | `${string}/mkosi/${string}`): VersionInfo;
export function getVersionInfoInURL(url?: string): VersionInfo | undefined;
export function getVersionInfoInURL(url?: string): VersionInfo | undefined {
    // systemd
    let mtx = (url || "").match(/\/man\/(\d+|latest|devel)/i);
    // podman
    if (!mtx) mtx = (url || "").match(/\/(?:[\w\-]+)\/(v\d+\.\d+\.\d+|latest)\//i);
    // mkosi
    if (!mtx) mtx = (url || "").match(/\/systemd\/mkosi\/(main|[0-9a-f]{7})/i);
    if (!mtx) return;
    let str = mtx[1];
    let asInt: number | undefined = parseInt(str, 10);
    if (!Number.isSafeInteger(asInt)) asInt = undefined;
    else if (!str.startsWith("v")) str = `v${str}`;
    return { str, asInt };
}
export function getVersionStrInURL(url?: string): string {
    return getVersionInfoInURL(url)?.str || "unknown";
}

export function getManPageURL(name: `${string}(${number})`, base?: ManPageBase): string;
export function getManPageURL(name: string, base?: ManPageBase): string | undefined;
/** @param name Example: `"chown(2)"` */
export function getManPageURL(name: string, base?: ManPageBase) {
    const op = name.indexOf("(");
    if (op < 0) return;
    const section = name[op + 1];
    if (!section) return;

    if (!base || base === "linux") {
        return `${manPageBase.linux}man${section}/${name.slice(0, op)}.${section}.html`;
    } else if (base === "systemd") {
        return `${manPageBase.systemd}${name.slice(0, op)}.html`;
    }
}
