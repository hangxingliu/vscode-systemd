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
} from "../syntax/const-sections";

const fileTypeToSections = new Map<SystemdFileType, SectionsDefinition[]>([
    [SystemdFileType.target, []],
    [SystemdFileType.device, []],
    [SystemdFileType.slice, []],
    //
    [SystemdFileType.service, [serviceSections]],
    [SystemdFileType.timer, [timerSections]],
    [SystemdFileType.socket, [socketSections]],
    [SystemdFileType.network, [networkSections]],
    [SystemdFileType.netdev, [netdevSections]],
    [SystemdFileType.link, [linkSections]],
    [SystemdFileType.dnssd, [dnssdSections]],
    [SystemdFileType.path, [pathSections]],
    [SystemdFileType.mount, [mountSections]],
    [SystemdFileType.automount, [automountSections]],
    [SystemdFileType.swap, [swapSections]],
    [SystemdFileType.nspawn, [nspawnSections]],
    [SystemdFileType.scope, [scopeSections]],
    //
    [SystemdFileType.coredump, [coredumpSections]],
    [SystemdFileType.homed, [homedSections]],
    [SystemdFileType.journald, [journaldSections]],
    [SystemdFileType.journal_remote, [journalRemoteSections]],
    [SystemdFileType.journal_upload, [journalUploadSections]],
    [SystemdFileType.logind, [logindSections]],
    [SystemdFileType.networkd, [networkdSections]],
    [SystemdFileType.oomd, [oomdSections]],
    [SystemdFileType.pstore, [pstoreSections]],
    [SystemdFileType.repartd, [repartdSections]],
    [SystemdFileType.sleep, [sleepSections]],
    [SystemdFileType.system, [systemManagerSections]],
    [SystemdFileType.sysupdated, [sysupdatedSections]],
    [SystemdFileType.timesyncd, [timesyncdSections]],
    //
    [SystemdFileType.podman, [serviceSections, podmanSections]],
    [SystemdFileType.podman_network, [podmanSections, networkSections]],
]);

export function getSectionCompletionItems(fileType: SystemdFileType, enabledPodman: boolean) {
    const items = new Set<SectionsDefinition[0]>(commonSections);
    const allSections = fileTypeToSections.get(fileType);
    if (allSections) {
        for (const sections of allSections) for (const section of sections) items.add(section);
    } else {
        for (const section of defaultSections) items.add(section);
        for (const section of podmanSections) items.add(section);
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
