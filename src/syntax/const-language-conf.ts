export const languageId = {
    systemd: "systemd-conf",
    mkosi: "mkosi-conf",
};
export const languageIds = [languageId.systemd, languageId.mkosi] as const;
export const allLanguageIds = new Set(languageIds);

export const languageAliases = ["Systemd Configuration", "systemd-conf", "systemd-unit-file"];
export const firstLine = /^\[(Unit|Install)\]/;
export const filenamePatterns = [
    "**/systemd/*.conf",
    "**/systemd/*.conf.d/*.conf",
    "**/*.{service,slice,scope}.d/*.conf",
    "**/{repart,sysupdate}.d/*.conf",
];

export const jinja2extensions = [
    // `.in` is used in `systemd` repository (2024-02)
    {
        append: ".in",
        for: ["**/systemd/*.conf", "**/*.{service,slice,scope}.d/*.conf", "**/{repart,sysupdate}.d/*.conf", ".service"],
    },
    // https://jinja.palletsprojects.com/en/3.1.x/templates/#template-file-extension
    ".jinja",
];

export const podmanExtensions = [".container", ".volume", ".network", ".kube", ".image", ".pod", ".build"];

export const extensions = [
    ".link",
    ".dnssd",
    ".netdev",
    ".network",
    ".nspawn",
    ".service",
    ".socket",
    ".device",
    ".mount",
    ".automount",
    ".swap",
    ".target",
    ".path",
    ".timer",
    ".snapshot",
    ".slice",
    ".scope",
];
