import { SystemdFileType } from "../../parser/file-info";
import { DirectiveCategory } from "../types-runtime";
import { HintDataManager } from "./base";

const runtimeCache: ReadonlyArray<HintDataManager>[] = [];
export function getSubsetOfManagers(managers: ReadonlyArray<HintDataManager | undefined>, fileInfo: SystemdFileType) {
    const cached = runtimeCache[fileInfo];
    if (cached) return cached;
    return (runtimeCache[fileInfo] = _getSubsetOfManagers(managers, fileInfo));
}

const fileTypeToDirectives = new Map<SystemdFileType, DirectiveCategory>([
    [SystemdFileType.service, DirectiveCategory.service],
    [SystemdFileType.timer, DirectiveCategory.timer],
    [SystemdFileType.socket, DirectiveCategory.socket],
    [SystemdFileType.network, DirectiveCategory.network],
    [SystemdFileType.netdev, DirectiveCategory.netdev],
    [SystemdFileType.link, DirectiveCategory.link],
    [SystemdFileType.dnssd, DirectiveCategory.dnssd],
    [SystemdFileType.path, DirectiveCategory.path],
    [SystemdFileType.mount, DirectiveCategory.mount],
    [SystemdFileType.automount, DirectiveCategory.automount],
    [SystemdFileType.swap, DirectiveCategory.swap],
    [SystemdFileType.scope, DirectiveCategory.scope],
    [SystemdFileType.nspawn, DirectiveCategory.nspawn],
    //
    [SystemdFileType.coredump, DirectiveCategory.coredump],
    [SystemdFileType.homed, DirectiveCategory.homed],
    [SystemdFileType.journald, DirectiveCategory.journald],
    [SystemdFileType.journal_remote, DirectiveCategory.journal_remote],
    [SystemdFileType.journal_upload, DirectiveCategory.journal_upload],
    [SystemdFileType.logind, DirectiveCategory.logind],
    [SystemdFileType.networkd, DirectiveCategory.networkd],
    [SystemdFileType.oomd, DirectiveCategory.oomd],
    [SystemdFileType.pstore, DirectiveCategory.pstore],
    [SystemdFileType.repartd, DirectiveCategory.repartd],
    [SystemdFileType.sleep, DirectiveCategory.sleep],
    [SystemdFileType.system, DirectiveCategory.system],
    [SystemdFileType.sysupdated, DirectiveCategory.sysupdated],
    [SystemdFileType.sysupdate_features, DirectiveCategory.sysupdate_features],
    [SystemdFileType.timesyncd, DirectiveCategory.timesyncd],
    // podman
    [SystemdFileType.podman_container, DirectiveCategory.podman],
    [SystemdFileType.podman_image, DirectiveCategory.podman],
    [SystemdFileType.podman_kube, DirectiveCategory.podman],
    [SystemdFileType.podman_network, DirectiveCategory.podman],
    [SystemdFileType.podman_pod, DirectiveCategory.podman],
    [SystemdFileType.podman_volume, DirectiveCategory.podman],
    [SystemdFileType.podman_build, DirectiveCategory.podman],
    // mkosi
    [SystemdFileType.mkosi, DirectiveCategory.mkosi],
]);

function _getSubsetOfManagers(
    managers: ReadonlyArray<HintDataManager | undefined>,
    fileInfo: SystemdFileType
): ReadonlyArray<HintDataManager> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: { [key in DirectiveCategory]: boolean } = [] as any;
    filters[DirectiveCategory.default] = true;
    filters[DirectiveCategory.fallback] = true;

    const result: Array<HintDataManager> = [];

    switch (fileInfo) {
        case SystemdFileType.mkosi:
            filters[DirectiveCategory.default] = false;
            filters[DirectiveCategory.mkosi] = true;
            break;
        case SystemdFileType.target:
        case SystemdFileType.device:
        case SystemdFileType.slice:
            break;
        // there is only one section `[IOCost]` in this type
        // we put it into the default manifest
        case SystemdFileType.iocost:
            break;
        //#region podman related patch
        case SystemdFileType.podman_container:
        case SystemdFileType.podman_volume:
            filters[DirectiveCategory.service] = true;
            filters[DirectiveCategory.podman] = true;
            break;
        //#endregion podman related patch
        default: {
            const onlyOne = fileTypeToDirectives.get(fileInfo);
            if (typeof onlyOne === "number") {
                filters[onlyOne] = true;
            } else {
                // unknown:
                for (const it of managers) {
                    if (!it) continue;
                    result.push(it);
                }
                return result;
            }
        }
    }
    for (const it of managers) if (it && filters[it.category]) result.push(it);
    return result;
}
