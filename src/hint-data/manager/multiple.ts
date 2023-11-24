import { CompletionItem } from "vscode";
import { customDirectives } from "../../syntax/const";
import { manpageURLs } from "../manpage-url";
import { DirectiveCategory, RequiredDirectiveCompletionItem, SpecifierCompletionItem } from "../types-runtime";
import { HintDataManager } from "./base";
import { CursorInfo } from "../../parser";
import { isValidArrayIndex } from "../../utils/data-types";
import { systemdValueEnum } from "../value-enum";
import { podmanValueEnum } from "../podman/value-enum";

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
};

export class HintDataManagers {
    private readonly managers: Array<HintDataManager | undefined> = [];
    private setManager(manager: HintDataManager) {
        this.managers[manager.category] = manager;
    }

    subset(filter: (manager: HintDataManager) => boolean) {
        const newManagers = new HintDataManagers();
        newManagers.managers.push(...this.managers.filter(filter));
        return newManagers;
    }

    init() {
        const defaultManager = new HintDataManager(DirectiveCategory.default, manpageURLs.base);
        defaultManager.addItems(require("../directives.json"));
        defaultManager.bindValueEnum(systemdValueEnum);
        this.setManager(defaultManager);

        const fallbackManager = new HintDataManager(DirectiveCategory.fallback, manpageURLs.base);
        for (const directive of customDirectives) fallbackManager.addCustomDirective(directive);
        this.setManager(fallbackManager);

        const podmanManager = new HintDataManager(DirectiveCategory.podman, manpageURLs.podmanBase);
        podmanManager.addItems(require("../podman/directives.json"));
        podmanManager.bindValueEnum(podmanValueEnum);
        this.setManager(podmanManager);
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

    filterDirectives(text: string, filter: HintDataFilterRule) {
        let prefix: string;
        const mtx = text.match(/^(.+[\.\-])/);
        if (mtx) prefix = mtx[1].toLowerCase();
        else if (text.startsWith("_")) prefix = "_";
        else prefix = "";

        let directives: RequiredDirectiveCompletionItem[] | undefined;

        let sectionNameLC: string | undefined;
        if (filter.section) sectionNameLC = filter.section.replace(/[\[\]]/g, "").toLowerCase();
        for (const manager of this.managers) {
            if (!manager) continue;
            let sectionIds: Set<number> | undefined;
            if (sectionNameLC) {
                const ids = manager.sectionIdMap.get(sectionNameLC);
                sectionIds = new Set(ids);
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

    getDirectiveList(directiveNameLC: string, filter: HintDataFilterRule) {
        let sectionNameLC: string | undefined;
        if (filter.section) sectionNameLC = filter.section.replace(/[\[\]]/g, "").toLowerCase();

        const { managers } = this;
        let directives: RequiredDirectiveCompletionItem[] | undefined;
        for (const it of managers) {
            if (!it) continue;
            let list = it.directivesMap.get(directiveNameLC);
            if (!list) continue;
            if (sectionNameLC) {
                const ids = it.sectionIdMap.get(sectionNameLC);
                const sectionIds = new Set(ids);
                list = list.filter((it) => filterBySectionIds(sectionIds, it));
            }
            directives = mergeItems(directives, list);
        }
        return directives;
    }

    filterValueEnum(cursorContext: CursorInfo) {
        let items: Array<CompletionItem> | undefined;
        for (const it of this.managers) if (it) items = mergeItems(items, it.resolveEnum(cursorContext));
        return items;
    }

    getDirectiveDocs(
        item: Pick<RequiredDirectiveCompletionItem, "category" | "manPage" | "docsIndex" | "sectionIndex">
    ) {
        const manager = this.managers[item.category];
        if (!manager) return;
        const manPage = isValidArrayIndex(item.manPage) && manager.manPages[item.manPage];
        const docs = isValidArrayIndex(item.docsIndex) && manager.docsMarkdown[item.docsIndex];
        const section = isValidArrayIndex(item.sectionIndex) && manager.sections[item.sectionIndex];
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
            if (docs) item.documentation = docs;
        }
        return item;
    }
}
