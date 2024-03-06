//
// Extract section names from the docs <h2> header text
//

import { SectionGroupName } from "../syntax/const-sections";

const defaultSectionNameForOptions = new Map([
    ["resolved.conf(5)", "Resolve"],
    ["pstore.conf(5)", "PStore"],
    ["homed.conf(5)", "Home"],
    ["journald.conf(5)", "Journal"],
    ["journal-remote.conf(5)", "Remote"],
    ["journal-upload.conf(5)", "Upload"],
    ["logind.conf(5)", "Login"],
    ["timesyncd.conf(5)", "Time"],
    ["systemd-sleep.conf(5)", "Sleep"],
    ["coredump.conf(5)", "Coredump"],
    ["systemd-system.conf(5)", "Manager"],
    ["iocost.conf(5)", "IOCost"],
    //
    ["systemd.service(5)", "Service"],
    ["systemd.socket(5)", "Socket"],
    ["systemd.timer(5)", "Timer"],
    ["systemd.automount(5)", "Automount"],
    ["systemd.path(5)", "Path"],
    ["systemd.mount(5)", "Mount"],
    ["systemd.swap(5)", "Swap"],
    ["systemd.scope(5)", "Scope"],
    //
    ["systemd.resource-control(5)", SectionGroupName.ResourceControl],
    ["systemd.kill(5)", SectionGroupName.Kill],
]);

/**
 * @param h2text Trimmed text from <h2> header. Example: `Options`, `[DHCPv4] Section Options`
 * @param pageName Example: `systemd.exec(5)`, `crypttab(5)`
 * @returns sectionName or `undefined`
 */
export function extractSectionNameFromDocs(h2text: string, pageName: string) {
    const mtx = h2text.match(/^(.*?)\[([^\]]+)\](.+)$/);
    if (mtx) {
        const sectionName = mtx[2];
        if (!sectionName.match(/^[\w-]+$/) || mtx[3].trim() !== "Section Options")
            throw new Error(`Invalid section name in "${h2text}"`);
        return sectionName;
    }

    // patch 1
    if (h2text === "Options") {
        const sectionName = defaultSectionNameForOptions.get(pageName);
        if (sectionName) return sectionName;
    }

    // patch 2
    if (pageName === "systemd.exec(5)") return SectionGroupName.Execution;
}
