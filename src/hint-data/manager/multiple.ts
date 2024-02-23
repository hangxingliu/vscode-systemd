import { CompletionItem } from "vscode";
import { customDirectives } from "../../syntax/const";
import { manpageURLs } from "../manpage-url";
import { DirectiveCategory, RequiredDirectiveCompletionItem, SpecifierCompletionItem } from "../types-runtime";
import { HintDataManager } from "./base";
import { CursorInfo } from "../../parser";
import { isValidArrayIndex } from "../../utils/data-types";
import { systemdValueEnum } from "../value-enum";
import { podmanValueEnum } from "../podman/value-enum";
import { SystemdFileType } from "../../parser/file-info";
import { getSubsetOfManagers } from "./subset";
import { sectionGroups } from "../../syntax/const-sections";
import { SectionGroupMatcher } from "../../syntax/sections-utils";

function mergeItems<T>(base: T[] | undefined, newItems: T[] | undefined): T[] | undefined {
    if (newItems && newItems.length > 0) return base ? base.concat(newItems) : newItems;
    return base;
}

function filterBySectionIds(sectionIds: Set<number> | undefined, it: RequiredDirectiveCompletionItem) {
    if (!sectionIds) return true;
    if (!it.sectionIndex) return true;
    return sectionIds.has(it.sectionIndex);
}

export type HintDataFilterRule = {
    section?: string;
    file?: SystemdFileType;
};

export class HintDataManagers {
    private readonly managers: Array<HintDataManager | undefined> = [];
    private readonly groups = new SectionGroupMatcher(sectionGroups);

    private initManager(manager: HintDataManager, items?: unknown[][]) {
        if (items) manager.addItems(items);
        this.managers[manager.category] = manager;
    }
    subset(fileType?: SystemdFileType) {
        if (typeof fileType !== "number") return this;
        const result = new HintDataManagers();
        for (const it of getSubsetOfManagers(this.managers, fileType)) result.managers[it.category] = it;
        return result;
    }

    init() {
        const service = new HintDataManager(DirectiveCategory.service, manpageURLs.base);
        this.initManager(service, require("../manifests/service.json"));

        const timer = new HintDataManager(DirectiveCategory.timer, manpageURLs.base);
        this.initManager(timer, require("../manifests/timer.json"));

        const socket = new HintDataManager(DirectiveCategory.socket, manpageURLs.base);
        this.initManager(socket, require("../manifests/socket.json"));

        const network = new HintDataManager(DirectiveCategory.network, manpageURLs.base);
        this.initManager(network, require("../manifests/network.json"));

        const netdev = new HintDataManager(DirectiveCategory.netdev, manpageURLs.base);
        this.initManager(netdev, require("../manifests/netdev.json"));

        const podman = new HintDataManager(DirectiveCategory.podman, manpageURLs.podmanBase);
        podman.bindValueEnum(podmanValueEnum);
        this.initManager(podman, require("../manifests/podman.json"));

        const link = new HintDataManager(DirectiveCategory.link, manpageURLs.base);
        this.initManager(link, require("../manifests/link.json"));

        const dnssd = new HintDataManager(DirectiveCategory.dnssd, manpageURLs.base);
        this.initManager(dnssd, require("../manifests/dnssd.json"));

        const path = new HintDataManager(DirectiveCategory.path, manpageURLs.base);
        this.initManager(path, require("../manifests/path.json"));

        const mount = new HintDataManager(DirectiveCategory.mount, manpageURLs.base);
        this.initManager(mount, require("../manifests/mount.json"));

        const defaults = new HintDataManager(DirectiveCategory.default, manpageURLs.base);
        defaults.bindValueEnum(systemdValueEnum);
        this.initManager(defaults, require("../manifests/default.json"));

        const fallback = new HintDataManager(DirectiveCategory.fallback, manpageURLs.base);
        for (const directive of customDirectives) fallback.addCustomDirective(directive);
        this.initManager(fallback);
    }

    getSpecifiers() {
        let specifiers: Array<SpecifierCompletionItem> | undefined;
        for (const it of this.managers) if (it) specifiers = mergeItems(specifiers, it.specifiers);
        return specifiers;
    }

    hasDirective(directiveNameLC: string) {
        for (const it of this.managers) if (it && it.directivesMap.has(directiveNameLC)) return true;
        return false;
    }

    /**
     * @param section Example: `[Service]`
     * @returns all matched section names and matched section group names, all in lower case
     */
    getLCSectionNames(section?: string): string[] {
        const result: string[] = [];
        if (section) {
            const nameLC = section.replace(/[\[\]]/g, "").toLowerCase();
            if (nameLC) result.push(nameLC);
            const matchedGroup = this.groups.match(nameLC);
            result.push(...matchedGroup);
        }
        return result;
    }

    filterDirectives(text: string, filter: HintDataFilterRule) {
        let prefix: string;
        const mtx = text.match(/^(.+[\.\-])/);
        if (mtx) prefix = mtx[1].toLowerCase();
        else if (text.startsWith("_")) prefix = "_";
        else prefix = "";

        let directives: RequiredDirectiveCompletionItem[] | undefined;

        const sectionNameLC = this.getLCSectionNames(filter.section);
        const managers =
            typeof filter.file === "number" ? getSubsetOfManagers(this.managers, filter.file) : this.managers;
        for (const manager of managers) {
            if (!manager) continue;
            let sectionIds: Set<number> | undefined;
            if (sectionNameLC.length > 0) {
                sectionIds = new Set();
                for (const nameLC of sectionNameLC) {
                    const ids = manager.sectionIdMap.get(nameLC);
                    if (ids) for (const id of ids) sectionIds.add(id);
                }
            }
            const dirs = manager.directives.filter((it) => {
                if (prefix) {
                    if (!it.directiveNameLC.startsWith(prefix)) return false;
                } else if (it.directiveNameLC.startsWith("_")) {
                    return false;
                }
                return filterBySectionIds(sectionIds, it);
            });
            directives = mergeItems(directives, dirs);
        }
        return directives;
    }

    getDirectiveList(directiveName: string, filter: HintDataFilterRule) {
        const sectionNameLC = this.getLCSectionNames(filter.section);

        const directiveNameLC = directiveName.toLowerCase();
        let directives: RequiredDirectiveCompletionItem[] | undefined;

        const managers =
            typeof filter.file === "number" ? getSubsetOfManagers(this.managers, filter.file) : this.managers;
        for (const it of managers) {
            if (!it) continue;
            let list = it.directivesMap.get(directiveNameLC);
            if (!list) continue;
            if (sectionNameLC.length > 0) {
                const sectionIds = new Set<number>();
                for (const nameLC of sectionNameLC) {
                    const ids = it.sectionIdMap.get(nameLC);
                    if (ids) for (const id of ids) sectionIds.add(id);
                }
                list = list.filter((it) => filterBySectionIds(sectionIds, it));
            }
            directives = mergeItems(directives, list);
        }
        if (!directives) return;

        const exactMatch = directives.filter((it) => it.directiveName === directiveName);
        if (exactMatch.length > 0) return exactMatch;
        return directives;
    }

    filterValueEnum(cursorContext: CursorInfo, fileType: SystemdFileType) {
        let items: Array<CompletionItem> | undefined;
        for (const it of this.managers)
            if (it && it.resolveEnum) items = mergeItems(items, it.resolveEnum(cursorContext, fileType));
        return items;
    }

    getDirectiveDocs(
        item: Pick<RequiredDirectiveCompletionItem, "category" | "manPage" | "docsIndex" | "sectionIndex">
    ) {
        const manager = this.managers[item.category];
        if (!manager) return;
        const manPage = isValidArrayIndex(item.manPage) && manager.manPages[item.manPage];
        const docs = isValidArrayIndex(item.docsIndex) && manager.docsMarkdown[item.docsIndex];
        let section = isValidArrayIndex(item.sectionIndex) && manager.sections[item.sectionIndex];
        // the internal group name is useless for users, so remove it
        if (section && this.groups.hasGroup(section.name)) section = false;
        return { manPage, docs, section };
    }

    resolveCompletionItem(item: RequiredDirectiveCompletionItem): CompletionItem {
        const src = this.managers[item.category];
        if (!src) return item;

        if (item.manPage) {
            const manPage = src.manPages[item.manPage];
            if (manPage) item.detail = manPage.title;
        }

        if (item.docsIndex) {
            const docs = src.docsMarkdown[item.docsIndex];
            if (docs) item.documentation = docs.str;
        }
        return item;
    }
}
