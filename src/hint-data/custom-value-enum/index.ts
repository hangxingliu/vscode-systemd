import { SystemdValueEnum } from "./types";
import { valueEnum as netdev } from "./systemd-netdev";
import { valueEnum as network } from "./systemd-network";
import { valueEnum as service } from "./systemd-service";
import { valueEnum as socket } from "./systemd-socket";
import { valueEnum as system } from "./systemd-system";
import { valueEnum as unit } from "./systemd-unit";
import { valueEnum as exec } from "./systemd-exec";
import { valueEnum as kill } from "./systemd-kill";
import { valueEnum as link } from "./systemd-link";
import { valueEnum as misc } from "./systemd-misc";
import { valueEnum as resource_control } from "./systemd-resource-control";

export const systemdValueEnum: ReadonlyArray<SystemdValueEnum> = [
    ...unit,
    ...exec,
    ...resource_control,
    ...service,
    ...netdev,
    ...network,
    ...socket,
    ...system,
    ...kill,
    ...link,
    ...misc,
];
