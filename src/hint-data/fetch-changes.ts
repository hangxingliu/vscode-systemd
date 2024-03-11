import { readFileSync } from "fs";
import { CustomSystemdDirective } from "./custom-directives/types";
import {
    PredefinedSignature,
    isManifestItemForDirective,
    isManifestItemForDocsMarkdown,
    isManifestItemForManPageInfo,
    isManifestItemForSection,
    isManifestItemForSpecifier,
} from "./types-manifest";

type ManPageInfo = {
    title: string;
    url: string;
};
type DocsContext = {
    str: string;
    version: number;
};
type Directive = {
    name: string;
    manPage: string;
    manPageURL: string;
    section: string;
    docs: string;
    since?: number;
    signatures?: string[] | PredefinedSignature;
};
type Specifier = {
    name: string;
    meaning: string;
};
type SectionInfo = {
    name: string;
};

export class HintDataChanges {
    readonly manPages: Array<ManPageInfo> = [];
    readonly docs: Array<DocsContext> = [];
    readonly sections: Array<SectionInfo> = [];
    readonly directives: Array<Directive> = [];
    readonly specifiers: Array<Specifier> = [];

    constructor(readonly items?: unknown[][]) {
        if (items) items.forEach((it) => this.addItem(it));
    }
    addItem(item: unknown[]) {
        if (isManifestItemForManPageInfo(item)) {
            const [, manPageIndex, title, url] = item;
            this.manPages[manPageIndex] = { title, url };
            return;
        }

        if (isManifestItemForDocsMarkdown(item)) {
            const [, docsIndex, docsMarkdown, , sinceVersion] = item;
            const version = Number.isInteger(sinceVersion) ? sinceVersion! : 0;
            this.docs[docsIndex] = { str: docsMarkdown, version };
            return;
        }

        if (isManifestItemForSection(item)) {
            const [, sectionId, name] = item;
            this.sections[sectionId] = { name };
            return;
        }

        if (isManifestItemForDirective(item)) {
            const [, directiveName, signatures, docsIndex, manPageIndex, sectionIndex] = item;
            const directive: Directive = {
                name: directiveName,
                manPage: this.manPages[manPageIndex].title,
                manPageURL: this.manPages[manPageIndex].url,
                signatures,
                section: "",
                docs: "",
            };
            if (sectionIndex) {
                const section = this.sections[sectionIndex];
                if (section) directive.section = section.name;
            }
            if (docsIndex) {
                const docs = this.docs[docsIndex];
                if (docs) {
                    if (docs.str) directive.docs = docs.str;
                    if (docs.version) directive.since = docs.version;
                }
            }
            this.directives.push(directive);
            return;
        }

        if (isManifestItemForSpecifier(item)) {
            const [, specifier, meaning] = item;
            this.specifiers.push({ name: specifier, meaning });
            return;
        }
    }

    static fromFile(manifestFile: string) {
        let items: unknown[][] | undefined;
        try {
            items = JSON.parse(readFileSync(manifestFile, "utf-8"));
        } catch (error) {
            console.error(error.message);
        }
        return new HintDataChanges(items);
    }
    static getChanges(from: HintDataChanges, to: HintDataChanges, version?: number) {
        const logs1: string[] = [];
        const logs2: string[] = [];
        const resolvedTo: boolean[] = [];
        const removed: CustomSystemdDirective[] = [];
        if (from.directives.length === 0) return { logs: logs1, removed };

        const createLogs = (directive: Directive, type: string) => {
            let log = `${type}: ${directive.name}`;
            if (directive.section) log += ` [${directive.section}]`;
            log += ` ${directive.manPage}`;
            return log;
        };

        for (const dir of from.directives) {
            const index = to.directives.findIndex(
                (it) => dir.name === it.name && dir.manPage === it.manPage && dir.section === it.section
            );
            if (index < 0) {
                logs1.push(createLogs(dir, "REMOVED"));
                removed.push({
                    name: dir.name,
                    docs: dir.docs,
                    fixHelp: "TODO",
                    deprecated: version,
                    section: dir.section,
                    manPage: dir.manPage,
                });
                continue;
            }
            resolvedTo[index] = true;

            const dir2 = to.directives[index];
            if (dir.docs !== dir2.docs) {
                logs2.push(createLogs(dir, "CHANGED"));
                continue;
            }
            if (JSON.stringify(dir.signatures) !== JSON.stringify(dir2.signatures)) {
                logs2.push(createLogs(dir, "CHANGED(SIGNATURE)"));
                continue;
            }
        }

        for (let i = 0; i < to.directives.length; i++) {
            if (resolvedTo[i]) continue;
            logs1.push(createLogs(to.directives[i], "ADDED"));
        }
        return {
            logs: [...logs1, ...logs2],
            removed,
        };
    }
}
