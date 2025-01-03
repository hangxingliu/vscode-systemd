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
    base: "https://www.freedesktop.org/software/systemd/man/255/",
    specifiers: "https://www.freedesktop.org/software/systemd/man/255/systemd.unit.html",
    directives: "https://www.freedesktop.org/software/systemd/man/255/systemd.directives.html",
    specialUnits: "https://www.freedesktop.org/software/systemd/man/255/systemd.special.html",
    //
    podman: "https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html",
    podmanBase: "https://docs.podman.io/en/latest/markdown/",
    //
    mkosi: "https://raw.githubusercontent.com/systemd/mkosi/main/mkosi/resources/man/mkosi.1.md",
    mkosiBase: "https://github.com/systemd/mkosi/blob/main/mkosi/resources/man/",
    //
    capabilities: "https://man7.org/linux/man-pages/man7/capabilities.7.html",
    capabilitiesBase: "https://man7.org/linux/man-pages/man7/",
};

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
