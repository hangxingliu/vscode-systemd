import { directives as exec } from "./systemd-exec";
import { directives as link } from "./systemd-link";
import { directives as logind } from "./systemd-logind";
import { directives as netdev } from "./systemd-netdev";
import { directives as nspawn } from "./systemd-nspawn";
import { directives as resource_control } from "./systemd-resource-control";
import { directives as service } from "./systemd-service";
import { directives as system } from "./systemd-system";
import { directives as unit } from "./systemd-unit";

export { CustomSystemdDirective } from "./types";

export const customDirectives = [
    ...exec,
    ...link,
    ...logind,
    ...netdev,
    ...nspawn,
    ...resource_control,
    ...service,
    ...system,
    ...unit,
];

export const allDeadNames = new Set<string>();
customDirectives.forEach((it) => {
    if (!it.dead) return;
    if (Array.isArray(it.name)) it.name.forEach((name) => allDeadNames.add(name));
    else allDeadNames.add(it.name);
});
