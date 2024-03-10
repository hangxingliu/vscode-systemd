import { directives as exec } from "./systemd-exec";
import { directives as link } from "./systemd-link";
import { directives as logind } from "./systemd-logind";
import { directives as netdev } from "./systemd-netdev";
import { directives as network } from "./systemd-network";
import { directives as nspawn } from "./systemd-nspawn";
import { directives as resource_control } from "./systemd-resource-control";
import { directives as service } from "./systemd-service";
import { directives as system } from "./systemd-system";
import { directives as sleep } from "./systemd-sleep";
import { directives as unit } from "./systemd-unit";
import { CustomSystemdDirective } from "./types";

export { CustomSystemdDirective } from "./types";

export const directives = {
    exec,
    link,
    logind,
    netdev,
    network,
    nspawn,
    resource_control,
    service,
    system,
    sleep,
    unit,
};
export const customDirectives: CustomSystemdDirective[] = [];
Object.values(directives).forEach(it => customDirectives.push(...it));

export const allDeadNames = new Set<string>();
customDirectives.forEach((it) => {
    if (!it.dead) return;
    if (Array.isArray(it.name)) it.name.forEach((name) => allDeadNames.add(name));
    else allDeadNames.add(it.name);
});
