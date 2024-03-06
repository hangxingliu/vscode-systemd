import { CompletionItem, CompletionItemKind, MarkdownString } from "vscode";
import { SystemdFileType } from "../parser/file-info";
import {
    SectionsDefinition,
    commonSections,
    serviceSections,
    timerSections,
    linkSections,
    dnssdSections,
    netdevSections,
    networkSections,
    pathSections,
    swapSections,
    sleepSections,
    mountSections,
    podmanSections,
    socketSections,
    defaultSections,
    automountSections,
    nspawnSections,
    coredumpSections,
    homedSections,
    journaldSections,
    journalRemoteSections,
    logindSections,
    networkdSections,
    oomdSections,
    pstoreSections,
    repartdSections,
    systemManagerSections,
    sysupdatedSections,
    timesyncdSections,
    journalUploadSections,
    scopeSections,
    allPodmanSections,
    iocostSections,
} from "../syntax/const-sections";

const fileTypeToSections = new Map<SystemdFileType, SectionsDefinition>([
    [SystemdFileType.target, []],
    [SystemdFileType.device, []],
    [SystemdFileType.slice, []],
    //
    [SystemdFileType.service, serviceSections],
    [SystemdFileType.timer, timerSections],
    [SystemdFileType.socket, socketSections],
    [SystemdFileType.network, networkSections],
    [SystemdFileType.netdev, netdevSections],
    [SystemdFileType.link, linkSections],
    [SystemdFileType.dnssd, dnssdSections],
    [SystemdFileType.path, pathSections],
    [SystemdFileType.mount, mountSections],
    [SystemdFileType.automount, automountSections],
    [SystemdFileType.swap, swapSections],
    [SystemdFileType.nspawn, nspawnSections],
    [SystemdFileType.scope, scopeSections],
    //
    [SystemdFileType.coredump, coredumpSections],
    [SystemdFileType.homed, homedSections],
    [SystemdFileType.journald, journaldSections],
    [SystemdFileType.journal_remote, journalRemoteSections],
    [SystemdFileType.journal_upload, journalUploadSections],
    [SystemdFileType.logind, logindSections],
    [SystemdFileType.networkd, networkdSections],
    [SystemdFileType.oomd, oomdSections],
    [SystemdFileType.pstore, pstoreSections],
    [SystemdFileType.repartd, repartdSections],
    [SystemdFileType.sleep, sleepSections],
    [SystemdFileType.system, systemManagerSections],
    [SystemdFileType.sysupdated, sysupdatedSections],
    [SystemdFileType.timesyncd, timesyncdSections],
    [SystemdFileType.iocost, iocostSections],
    //
    [SystemdFileType.podman_container, podmanSections.Container],
    [SystemdFileType.podman_volume, podmanSections.Volume],
    [SystemdFileType.podman_kube, podmanSections.Kube],
    [SystemdFileType.podman_network, podmanSections.Network],
    [SystemdFileType.podman_pod, podmanSections.Pod],
    [SystemdFileType.podman_image, podmanSections.Image],
]);

export function getSectionCompletionItems(fileType: SystemdFileType, enabledPodman: boolean) {
    const items = new Set<SectionsDefinition[0]>(commonSections);

    const matched = fileTypeToSections.get(fileType);
    if (matched) {
        for (const section of matched) items.add(section);
    } else {
        for (const section of defaultSections) items.add(section);
        if (enabledPodman) for (const section of allPodmanSections) items.add(section);
    }

    return Array.from(items).map((it) => {
        let label: string;
        let docs: string | undefined;
        if (typeof it === "string") {
            label = it;
        } else {
            label = it[0];
            docs = it[1];
        }

        const completion = new CompletionItem(label, CompletionItemKind.Module);
        if (docs) completion.documentation = new MarkdownString(docs);
        return completion;
    });
}
