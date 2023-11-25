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
    podmanSections,
    socketSections,
} from "../syntax/const-sections";

export function getSectionCompletionItems(fileType: SystemdFileType) {
    const items = new Set<SectionsDefinition[0]>(commonSections);
    switch (fileType) {
        case SystemdFileType.service:
            serviceSections.forEach((it) => items.add(it));
            break;
        case SystemdFileType.timer:
            timerSections.forEach((it) => items.add(it));
            break;
        case SystemdFileType.netdev:
            netdevSections.forEach((it) => items.add(it));
            break;
        case SystemdFileType.link:
            linkSections.forEach((it) => items.add(it));
            break;
        case SystemdFileType.socket:
            socketSections.forEach((it) => items.add(it));
            break;
        case SystemdFileType.dnssd:
            dnssdSections.forEach((it) => items.add(it));
            break;
        case SystemdFileType.network:
            networkSections.forEach((it) => items.add(it));
            break;
        case SystemdFileType.podman:
            podmanSections.forEach((it) => items.add(it));
            break;
        case SystemdFileType.podman_network:
            podmanSections.forEach((it) => items.add(it));
            networkSections.forEach((it) => items.add(it));
            break;
        default:
            serviceSections.forEach((it) => items.add(it));
            timerSections.forEach((it) => items.add(it));
            netdevSections.forEach((it) => items.add(it));
            linkSections.forEach((it) => items.add(it));
            podmanSections.forEach((it) => items.add(it));
            networkSections.forEach((it) => items.add(it));
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
