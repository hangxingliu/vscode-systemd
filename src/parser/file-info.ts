/** internal use, excluding `network` */
const _podmanExts = new Set(["container", "volume", "kube", "image"]);

export const enum SystemdFileType {
    unknown = 0,
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
    /** https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html */
    podman = 20,
    /** https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html */
    podman_network = 21,
}

export const systemdFileTypeNames: { [type in SystemdFileType]: string } = {
    [SystemdFileType.unknown]: "Unspecified",
    [SystemdFileType.service]: "Service unit configuration (*.service)",
    [SystemdFileType.timer]: "Timer unit configuration (*.timer)",
    [SystemdFileType.network]: "Network configuration (*.network)",
    [SystemdFileType.netdev]: "Virtual Network Device configuration (*.netdev)",
    [SystemdFileType.socket]: "Socket unit configuration (*.socket)",
    [SystemdFileType.link]: "Network device configuration (*.link)",
    [SystemdFileType.dnssd]: "DNS-SD configuration (*.dnssd)",
    [SystemdFileType.podman]: "Systemd Unit Using Podman Quadlet",
    [SystemdFileType.podman_network]: "Systemd Unit Using Podman Quadlet or Network configuration",
};

export function parseSystemdFilePath(filePath: string | undefined | null, enablePodman = true): SystemdFileType {
    if (!filePath) return SystemdFileType.unknown;
    const mtx = filePath.match(/\.([\w-]+)$/);
    if (!mtx) return SystemdFileType.unknown;
    const ext = mtx[1];
    switch (ext) {
        case "service":
            return SystemdFileType.service;
        case "socket":
            return SystemdFileType.socket;
        case "netdev":
            return SystemdFileType.netdev;
        case "timer":
            return SystemdFileType.timer;
        case "link":
            return SystemdFileType.link;
        case "dnssd":
            return SystemdFileType.dnssd;
        case "network":
            return enablePodman ? SystemdFileType.podman_network : SystemdFileType.network;
    }
    if (enablePodman && _podmanExts.has(ext)) return SystemdFileType.podman;
    if (ext === "conf") {
        if (filePath.indexOf("networkd.conf") >= 0) return SystemdFileType.network;
    }
    return SystemdFileType.unknown;
}
