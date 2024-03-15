import { CompletionContext, CompletionItem, CompletionItemKind, MarkdownString, Position, Uri, Range, SnippetString } from "vscode";
import { manpageURLs } from "../manpage-url";
import { isManifestItemForSpecialUnit } from "../types-manifest";
import { createCompletionTriggerCharFilter, createMarkdown } from "../../utils/vscode";
import { MapList, getArray } from "../../utils/data-types";
import { SpecialUnitCompletionItem } from "../types-runtime";

export type SystemdUnitItem = {
    name: string;
    docs?: MarkdownString;
    /** Since version */
    since?: number;
    /** The local path to this unit file */
    file?: string;
};

const boundary = /^\s$/;
const triggerFilter = createCompletionTriggerCharFilter(" \t=");
const directiveKeys = new Set([
    "Before",
    "After",
    "Requires",
    "RequiredBy",
    "Wants",
    "WantedBy",
    "Upholds",
    "UpheldBy",
    "PartOf",
    "ConsistsOf",
    "BindsTo",
    "BoundBy",
    "Requisite",
    "RequisiteOf",
    "Conflicts",
    "ConflictedBy",
    "Triggers",
    "TriggeredBy",
    "PropagatesReloadTo",
    "ReloadPropagatedFrom",
    "StopPropagatedFrom",
    "PropagatesStopTo",
    "Following",
]);

export class SystemdUnitsManager {
    static instance: SystemdUnitsManager;
    static init() {
        this.instance = new SystemdUnitsManager();
        return this.instance;
    }

    private readonly builtInItems: SystemdUnitItem[] = [];
    private readonly byName = new MapList<SystemdUnitItem>();
    private readonly baseUri: Uri;
    private cached: SpecialUnitCompletionItem[];

    constructor() {
        const items = require("../manifests/special-units.json");
        this.baseUri = Uri.parse(manpageURLs.base);
        for (const item of items) this.addItem(item);
    }

    addItem(item: unknown[]) {
        if (isManifestItemForSpecialUnit(item)) {
            const docs = createMarkdown(item[2], this.baseUri);
            for (const name of getArray(item[1])) {
                const unitItem: SystemdUnitItem = { name, docs, since: item[3] };
                this.byName.push(unitItem.name, unitItem);
                this.builtInItems.push(unitItem);
            }
            return;
        }
    }

    has(directive?: string) {
        return typeof directive === "string" ? directiveKeys.has(directive) : false;
    }
    getCompletionItems(directiveKey: string, pendingText: string, position: Position, context: CompletionContext) {
        if (!this.has(directiveKey)) return;
        if (!triggerFilter(context)) return [];

        let pending = 0;
        for (let i = pendingText.length - 1; i >= 0; i--) {
            if (boundary.test(pendingText[i])) break;
            pending++;
        }

        if (!this.cached) {
            this.cached = this.builtInItems.map((it) => {
                const completion: SpecialUnitCompletionItem = new CompletionItem(it.name, CompletionItemKind.File);
                //#region patch
                if (it.name === "blockdev@.target") {
                    completion.label = {label: it.name, detail: ' escaped-block-dev-node-path'};
                    completion.filterText = it.name;
                    completion.insertText = new SnippetString('blockdev@\${0:escaped_block_dev_node_path}.target');
                }
                //#endregion patch
                if (it.docs) completion.documentation = it.docs;
                if (it.since) completion.since = it.since;
                completion.commitCharacters = [' '];
                return completion;
            });
        }

        const range = new Range(pending > 0 ? position.translate(0, -pending) : position, position);
        for (const it of this.cached) it.range = range;
        return this.cached;
    }
}
