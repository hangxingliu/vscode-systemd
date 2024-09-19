export const enum SystemdFileType {
    unknown = 0,
    //
    //
    //
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html# */
    service = 1,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html# */
    timer = 2,
    /**
     * https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html
     * https://www.freedesktop.org/software/systemd/man/latest/networkd.conf.html
     */
    network = 3,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.netdev.html# */
    netdev = 4,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.socket.html# */
    socket = 5,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.link.html */
    link = 6,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.dnssd.html */
    dnssd = 7,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.path.html# */
    path = 8,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.mount.html# */
    mount = 9,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.nspawn.html */
    nspawn = 10,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.swap.html# */
    swap = 11,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.scope.html */
    scope = 12,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.automount.html */
    automount = 13,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.device.html */
    device = 14,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.slice.html */
    slice = 15,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.target.html# */
    target = 16,
    //
    //
    //
    /** https://www.freedesktop.org/software/systemd/man/latest/timesyncd.conf.html */
    timesyncd = 17,
    /** https://www.freedesktop.org/software/systemd/man/latest/sysupdate.d.html */
    sysupdated = 18,
    /** https://www.freedesktop.org/software/systemd/man/latest/repart.d.html */
    repartd = 19,
    /**
     * https://www.freedesktop.org/software/systemd/man/latest/systemd-sleep.conf.html
     * ALIAS: https://www.freedesktop.org/software/systemd/man/latest/sleep.conf.d.html
     */
    sleep = 20,
    /** https://www.freedesktop.org/software/systemd/man/latest/pstore.conf.html */
    pstore = 21,
    /** https://www.freedesktop.org/software/systemd/man/latest/oomd.conf.html */
    oomd = 22,
    /** https://www.freedesktop.org/software/systemd/man/latest/homed.conf.html */
    homed = 23,
    /** https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html */
    journald = 24,
    /** https://www.freedesktop.org/software/systemd/man/latest/journal-remote.conf.html */
    journal_remote = 25,
    /** https://www.freedesktop.org/software/systemd/man/latest/journal-upload.conf.html */
    journal_upload = 26,
    /** https://www.freedesktop.org/software/systemd/man/latest/logind.conf.html */
    logind = 27,
    /** https://www.freedesktop.org/software/systemd/man/latest/networkd.conf.html */
    networkd = 28,
    /** https://www.freedesktop.org/software/systemd/man/latest/coredump.conf.html */
    coredump = 29,
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd-system.conf.html */
    system = 30,
    /** https://www.freedesktop.org/software/systemd/man/latest/iocost.conf.html */
    iocost = 31,
    //
    //
    //
    /** https://github.com/systemd/mkosi/blob/main/mkosi/resources/mkosi.md */
    mkosi = 48,
    //
    //
    //
    /** https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html */
    podman_container = 64,
    podman_volume = 65,
    podman_kube = 66,
    podman_network = 67,
    podman_image = 68,
    podman_pod = 69,
}

export const podmanFileTypes = new Set([
    SystemdFileType.podman_container,
    SystemdFileType.podman_volume,
    SystemdFileType.podman_kube,
    SystemdFileType.podman_network,
    SystemdFileType.podman_image,
    SystemdFileType.podman_pod,
]);

export const systemdFileTypeNames: { [type in SystemdFileType]: string } = {
    [SystemdFileType.unknown]: "Unspecified",
    //
    [SystemdFileType.service]: "Service unit configuration (*.service)",
    [SystemdFileType.timer]: "Timer unit configuration (*.timer)",
    [SystemdFileType.network]: "Network configuration (*.network)",
    [SystemdFileType.netdev]: "Virtual Network Device configuration (*.netdev)",
    [SystemdFileType.socket]: "Socket unit configuration (*.socket)",
    [SystemdFileType.link]: "Network device configuration (*.link)",
    [SystemdFileType.dnssd]: "DNS-SD configuration (*.dnssd)",
    [SystemdFileType.path]: "Path unit configuration (*.path)",
    [SystemdFileType.mount]: "Mount unit configuration (*.mount)",
    [SystemdFileType.target]: "Target unit configuration (*.target)",
    [SystemdFileType.automount]: "Automount unit configuration (*.automount)",
    [SystemdFileType.swap]: "Swap unit configuration (*.swap)",
    [SystemdFileType.scope]: "Scope unit configuration (*.scope)",
    [SystemdFileType.nspawn]: "Container settings (*.nspawn)",
    [SystemdFileType.device]: " Device unit configuration (*.device)",
    [SystemdFileType.slice]: " Slice unit configuration (*.slice)",
    //
    [SystemdFileType.sleep]: "systemd-sleep.conf - Suspend and hibernation configuration file",
    [SystemdFileType.timesyncd]: "timesyncd.conf - Network Time Synchronization configuration files",
    [SystemdFileType.sysupdated]: "sysupdate.d - Transfer Definition Files for Automatic Updates",
    [SystemdFileType.repartd]: "repart.d - Partition Definition Files for Automatic Boot-Time Repartitioning",
    [SystemdFileType.pstore]: "pstore.conf - PStore configuration file",
    [SystemdFileType.oomd]: "oomd.conf - Global systemd-oomd configuration files",
    [SystemdFileType.homed]: "homed.conf - Home area/user account manager configuration files",
    [SystemdFileType.journald]: "journald.conf - Journal service configuration files",
    [SystemdFileType.journal_remote]:
        "journal-remote.conf - Configuration files for the service accepting remote journal uploads",
    [SystemdFileType.journal_upload]: "journal-upload.conf - Configuration files for the journal upload service",
    [SystemdFileType.logind]: "logind.conf -  Login manager configuration files",
    [SystemdFileType.networkd]: "networkd.conf - Global Network configuration files",
    [SystemdFileType.coredump]: "coredump.conf - Core dump storage configuration files",
    [SystemdFileType.system]: "systemd-system.conf - System and session service manager configuration files",
    [SystemdFileType.iocost]: "iocost.conf - iocost solution manager configuration files",
    //
    [SystemdFileType.mkosi]: "mkosi.conf - Build Bespoke OS Images",
    //
    [SystemdFileType.podman_container]: "Podman Quadlet container units (*.container)",
    [SystemdFileType.podman_pod]: "Podman Quadlet pod units (*.pod)",
    [SystemdFileType.podman_image]: "Podman Quadlet image files (*.image)",
    [SystemdFileType.podman_network]: "Podman Quadlet network files (*.network)",
    [SystemdFileType.podman_volume]: "Podman Quadlet volume files (*.volume)",
    [SystemdFileType.podman_kube]: "Podman Quadlet kube units (*.kube)",
};

const fileExtToType = new Map<string, SystemdFileType>([
    ["nspawn", SystemdFileType.nspawn],
    ["service", SystemdFileType.service],
    ["socket", SystemdFileType.socket],
    ["timer", SystemdFileType.timer],
    ["automount", SystemdFileType.automount],
    ["link", SystemdFileType.link],
    ["dnssd", SystemdFileType.dnssd],
    ["path", SystemdFileType.path],
    ["mount", SystemdFileType.mount],
    ["swap", SystemdFileType.swap],
    ["target", SystemdFileType.target],
    ["netdev", SystemdFileType.netdev],
    ["scope", SystemdFileType.scope],
    ["slice", SystemdFileType.slice],
    // ["network", SystemdFileType.network],
    ["container", SystemdFileType.podman_container],
    ["pod", SystemdFileType.podman_pod],
    ["image", SystemdFileType.podman_image],
    ["volume", SystemdFileType.podman_volume],
    ["kube", SystemdFileType.podman_kube],
]);

export function parseSystemdFilePath(filePath: string | undefined | null, enablePodman = true): SystemdFileType {
    if (!filePath) return SystemdFileType.unknown;
    let mtx = filePath.match(/\.([\w-]+)$/);
    if (!mtx) return SystemdFileType.unknown;
    let ext = mtx[1];
    if (ext === "in") {
        // template file
        mtx = filePath.match(/\.([\w-]+)\.\w+$/);
        if (!mtx) return SystemdFileType.unknown;
        ext = mtx[1];
    }

    const type = fileExtToType.get(ext);
    if (type) return type;

    if (ext === "network") {
        if (enablePodman && (filePath.includes("containers/") || filePath.includes("podman/") || filePath.includes("quadlets/")))
            return SystemdFileType.podman_network;
        return SystemdFileType.network;
    }
    if (ext === "conf") {
        const index = filePath.lastIndexOf('/');
        const fileName = index >= 0 ? filePath.slice(index + 1) : filePath;

        //
        if (fileName === 'mkosi.local.conf') return SystemdFileType.mkosi;
        if (fileName === 'mkosi.conf') return SystemdFileType.mkosi;
        if (filePath.includes("mkosi.conf.d/")) return SystemdFileType.mkosi;

        if (filePath.includes("service.d/")) return SystemdFileType.service;
        if (filePath.includes("slice.d/")) return SystemdFileType.slice;
        if (filePath.includes("scope.d/")) return SystemdFileType.scope;
        //
        if (filePath.includes("systemd/system.conf") || filePath.includes("systemd/user.conf"))
            return SystemdFileType.system;
        if (filePath.includes("journald.conf") || filePath.includes("journald@")) return SystemdFileType.journald;

        if (filePath.includes("journal-remote.conf")) return SystemdFileType.journal_remote;
        if (filePath.includes("journal-upload.conf")) return SystemdFileType.journal_upload;
        if (filePath.includes("timesyncd.conf")) return SystemdFileType.timesyncd;
        if (filePath.includes("networkd.conf")) return SystemdFileType.networkd;
        if (filePath.includes("coredump.conf")) return SystemdFileType.coredump;
        if (filePath.includes("sysupdate.d")) return SystemdFileType.sysupdated;
        if (filePath.includes("iocost.conf")) return SystemdFileType.iocost;
        if (filePath.includes("logind.conf")) return SystemdFileType.logind;
        if (filePath.includes("pstore.conf")) return SystemdFileType.timesyncd;
        if (filePath.includes("sleep.conf")) return SystemdFileType.sleep;
        if (filePath.includes("homed.conf")) return SystemdFileType.homed;
        if (filePath.includes("oomd.conf")) return SystemdFileType.oomd;
        if (filePath.includes("repart.d")) return SystemdFileType.repartd;
    }

    return SystemdFileType.unknown;
}
