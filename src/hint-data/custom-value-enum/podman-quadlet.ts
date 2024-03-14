import type { SystemdValueEnum } from "./types";

export const podmanValueEnum: ReadonlyArray<SystemdValueEnum> = [
    {
        directive: "AutoUpdate",
        section: "Container",
        manPage: "podman-systemd.unit.5",
        values: ["registry", "local", "${name}/${local|registry}"],
    },
    {
        directive: "ExitCodePropagation",
        section: "Container",
        manPage: "podman-systemd.unit.5",
        values: ["all", "any", "none"],
    },
];
