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
    [SystemdFileType.timesyncd, DirectiveCategory.timesyncd],
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
        case SystemdFileType.target:
        case SystemdFileType.device:
        case SystemdFileType.slice:
            break;
        case SystemdFileType.podman_network:
            filters[DirectiveCategory.network] = true;
            filters[DirectiveCategory.podman] = true;
            break;
        case SystemdFileType.podman:
            filters[DirectiveCategory.service] = true;
            filters[DirectiveCategory.podman] = true;
            break;
        default: {
            const onlyOne = fileTypeToDirectives.get(fileInfo);
            if (typeof onlyOne === "number") {
                filters[onlyOne] = true;
            } else {
                // unknown:
                for (const it of managers) if (it && it.category !== DirectiveCategory.podman) result.push(it);
                return result;
            }
        }
    }
    for (const it of managers) if (it && filters[it.category]) result.push(it);
    return result;
}
