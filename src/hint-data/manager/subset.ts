import { SystemdFileType } from "../../parser/file-info";
import { DirectiveCategory } from "../types-runtime";
import { HintDataManagers } from "./multiple";

export function getSubsetOfManagers(managers: HintDataManagers, fileInfo: SystemdFileType) {
    switch (fileInfo) {
        case SystemdFileType.podman:
        case SystemdFileType.podman_network:
            return managers;
        default:
            return managers.subset((it) => it.category !== DirectiveCategory.podman);
    }
}
