export const _PODMAN_BOOLEAN_DIRECTIVES = new Set([
    "[Container]EnvironmentHost",
    "[Container]NoNewPrivileges",
    "[Container]Notify",
    "[Container]ReadOnly",
    "[Container]ReadOnlyTmpfs",
    "[Container]RunInit",

    "[Kube]KubeDownForce",

    "[Network]DisableDNS",
    "[Network]Internal",
    "[Network]IPv6",

    "[Volume]Copy",

    "[Image]AllTags",
    "[Image]TLSVerify",
]);
