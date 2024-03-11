import { CompletionItem } from "vscode";
import { manpageURLs } from "../manpage-url";
import {
    DirectiveCategory,
    DocsContext,
    RequiredDirectiveCompletionItem,
    SpecifierCompletionItem,
} from "../types-runtime";
import { HintDataManager } from "./base";
import { CursorInfo } from "../../parser";
import { isValidArrayIndex } from "../../utils/data-types";
import { systemdValueEnum } from "../custom-value-enum";
import { podmanValueEnum } from "../podman/value-enum";
import { SystemdFileType } from "../../parser/file-info";
import { getSubsetOfManagers } from "./subset";
import { sectionGroups, similarSections } from "../../syntax/const-sections";
import { SectionGroupMatcher } from "../../syntax/sections-utils";
import { CustomSystemdDirective, directives } from "../custom-directives";
import { createMarkdown } from "../../utils/vscode";
import { genVersionDocs } from "../../docs/base";
import { ValueEnumExtendsFn } from "../value-enum-manager";

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
    // key: directive name, value: since version
    private readonly allDeprecatedNames = new Map<string, number>();

    private initManager(manager: HintDataManager, items?: unknown[][]) {
        if (items) manager.addItems(items);
        this.managers[manager.category] = manager;
    }
    private initFromItems(category: DirectiveCategory, items: unknown[][], baseURL?: string) {
        if (!baseURL) baseURL = manpageURLs.base;
        const manager = new HintDataManager(category, baseURL);
        manager.addItems(items);
        this.managers[manager.category] = manager;
        return manager;
    }
    private addCustom(category: DirectiveCategory, items: CustomSystemdDirective[]) {
        const manager = this.managers[category];
        const deprecated = this.allDeprecatedNames;
        for (const it of items) {
            if (!it.dead && !it.deprecated) continue;
            for (const name of Array.isArray(it.name) ? it.name : [it.name]) deprecated.set(name, it.deprecated || 0);
            manager!.addCustomDirective(it);
        }
    }
    subset(fileType?: SystemdFileType) {
        if (typeof fileType !== "number") return this;
        const result = new HintDataManagers();
        for (const it of getSubsetOfManagers(this.managers, fileType)) result.managers[it.category] = it;
        return result;
    }

    init() {
        // ls src/hint-data/manifests/ | sort | sed 's:.json::' | awk '!/capabilities/ && !/default/ && !/podman/ {print "this.initFromItems(DirectiveCategory." $1 ", require(\"../manifests/" $1 ".json\"));"}'
        this.initFromItems(DirectiveCategory.automount, require("../manifests/automount.json"));
        this.initFromItems(DirectiveCategory.coredump, require("../manifests/coredump.json"));
        this.initFromItems(DirectiveCategory.dnssd, require("../manifests/dnssd.json"));
        this.initFromItems(DirectiveCategory.homed, require("../manifests/homed.json"));
        this.initFromItems(DirectiveCategory.journal_remote, require("../manifests/journal_remote.json"));
        this.initFromItems(DirectiveCategory.journal_upload, require("../manifests/journal_upload.json"));
        this.initFromItems(DirectiveCategory.journald, require("../manifests/journald.json"));
        this.initFromItems(DirectiveCategory.link, require("../manifests/link.json"));
        this.initFromItems(DirectiveCategory.logind, require("../manifests/logind.json"));
        this.initFromItems(DirectiveCategory.mount, require("../manifests/mount.json"));
        this.initFromItems(DirectiveCategory.netdev, require("../manifests/netdev.json"));
        this.initFromItems(DirectiveCategory.network, require("../manifests/network.json"));
        this.initFromItems(DirectiveCategory.networkd, require("../manifests/networkd.json"));
        this.initFromItems(DirectiveCategory.nspawn, require("../manifests/nspawn.json"));
        this.initFromItems(DirectiveCategory.oomd, require("../manifests/oomd.json"));
        this.initFromItems(DirectiveCategory.path, require("../manifests/path.json"));
        this.initFromItems(DirectiveCategory.pstore, require("../manifests/pstore.json"));
        this.initFromItems(DirectiveCategory.repartd, require("../manifests/repartd.json"));
        this.initFromItems(DirectiveCategory.scope, require("../manifests/scope.json"));
        this.initFromItems(DirectiveCategory.service, require("../manifests/service.json"));
        this.initFromItems(DirectiveCategory.sleep, require("../manifests/sleep.json"));
        this.initFromItems(DirectiveCategory.socket, require("../manifests/socket.json"));
        this.initFromItems(DirectiveCategory.swap, require("../manifests/swap.json"));
        this.initFromItems(DirectiveCategory.system, require("../manifests/system.json"));
        this.initFromItems(DirectiveCategory.sysupdated, require("../manifests/sysupdated.json"));
        this.initFromItems(DirectiveCategory.timer, require("../manifests/timer.json"));
        this.initFromItems(DirectiveCategory.timesyncd, require("../manifests/timesyncd.json"));

        const podman = new HintDataManager(DirectiveCategory.podman, manpageURLs.podmanBase);
        podman.bindValueEnum(podmanValueEnum);
        this.initManager(podman, require("../manifests/podman.json"));

        const defaults = new HintDataManager(DirectiveCategory.default, manpageURLs.base);
        defaults.bindValueEnum(systemdValueEnum);
        this.initManager(defaults, require("../manifests/default.json"));

        this.addCustom(DirectiveCategory.default, directives.exec);
        this.addCustom(DirectiveCategory.link, directives.link);
        this.addCustom(DirectiveCategory.logind, directives.logind);
        this.addCustom(DirectiveCategory.netdev, directives.netdev);
        this.addCustom(DirectiveCategory.network, directives.network);
        this.addCustom(DirectiveCategory.nspawn, directives.nspawn);
        this.addCustom(DirectiveCategory.default, directives.resource_control);
        this.addCustom(DirectiveCategory.service, directives.service);
        this.addCustom(DirectiveCategory.system, directives.system);
        this.addCustom(DirectiveCategory.sleep, directives.sleep);
        this.addCustom(DirectiveCategory.default, directives.unit);

        const fallback = new HintDataManager(DirectiveCategory.fallback, manpageURLs.base);
        this.initManager(fallback);
    }

    getSpecifiers() {
        let specifiers: Array<SpecifierCompletionItem> | undefined;
        for (const it of this.managers) if (it) specifiers = mergeItems(specifiers, it.specifiers);
        return specifiers;
    }

    getDeprecatedNames(currentVersion?: number) {
        if (!currentVersion) return new Set(this.allDeprecatedNames.keys());
        const names = new Set<string>();
        for (const [name, version] of this.allDeprecatedNames) {
            if (version > currentVersion) continue;
            names.add(name);
        }
        return names;
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
            const name = section.replace(/[\[\]]/g, "");
            const nameLC = name.toLowerCase();
            if (name) {
                const similarSection = similarSections.get(name);
                if (similarSection) result.push(similarSection.toLowerCase());
                else result.push(nameLC);
            }
            const matchedGroup = this.groups.match(nameLC);
            result.push(...matchedGroup);
        }
        return result;
    }

    filterDirectives(text: string, filter: HintDataFilterRule) {
        /** A lowercase prefix string */
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
                if (it.hidden) return false;
                if (prefix.length <= 2 && it.manPage && manager.hiddenManPages.has(it.manPage)) return false;
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

    filterValueEnum(cursorContext: CursorInfo, fileType: SystemdFileType, extendsFn?: ValueEnumExtendsFn) {
        let items: Array<CompletionItem> | undefined;
        for (const it of this.managers)
            if (it && it.resolveEnum) items = mergeItems(items, it.resolveEnum(cursorContext, fileType, extendsFn));
        return items;
    }
    hasValueEnum(cursorContext: CursorInfo, fileType: SystemdFileType) {
        for (const it of this.managers) if (it && it.hasEnum) if (it.hasEnum(cursorContext, fileType)) return true;
        return false;
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
        if (item.detail && item.documentation) return item;

        const src = this.managers[item.category];
        if (!src) return item;

        if (item.manPage) {
            const manPage = src.manPages[item.manPage];
            if (manPage) item.detail = manPage.title;
        }

        let docs: DocsContext | undefined;
        if (item.docsIndex) docs = src.docsMarkdown[item.docsIndex];
        if (docs) {
            const { str } = docs;
            const prefix = genVersionDocs(item, true);
            if (prefix) {
                const markdown = createMarkdown(prefix, str.baseUri);
                markdown.appendMarkdown(str.value);
                item.documentation = markdown;
            } else {
                item.documentation = str;
            }
        }
        return item;
    }
}
