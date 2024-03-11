import { CompletionItem, CompletionItemKind, MarkdownString, Uri } from "vscode";
import { manpageURLs } from "../manpage-url";
import { isManifestItemForCapability } from "../types-manifest";
import { createMarkdown } from "../../utils/vscode";

export type SystemdCapabilityItem = {
    name: string;
    docs: MarkdownString;
};

const directiveKeys = new Set([
    /** https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html */
    "CapabilityBoundingSet",
    "AmbientCapabilities",
    "ConditionCapability",
    "AssertCapability",
    /** https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html#addcapability */
    "AddCapability",
    "DropCapability",
]);

export class SystemdCapabilities {
    static instance: SystemdCapabilities;
    static init() {
        this.instance = new SystemdCapabilities();
        return this.instance;
    }

    private readonly byName = new Map<string, SystemdCapabilityItem>();
    private readonly baseUri: Uri;
    private cached: CompletionItem[];

    constructor() {
        const items = require("../manifests/capabilities.json");
        this.baseUri = Uri.parse(manpageURLs.capabilitiesBase);
        for (const item of items) this.addItem(item);
    }

    addItem(item: unknown[]) {
        if (isManifestItemForCapability(item)) {
            const docs = createMarkdown(item[2], this.baseUri);
            const cap: SystemdCapabilityItem = { name: item[1], docs };
            this.byName.set(cap.name, cap);
            return;
        }
    }

    testDirectiveKey(directive?: string) {
        return typeof directive === "string" ? directiveKeys.has(directive) : false;
    }

    getByName(capName: string) {
        return this.byName.get(capName);
    }

    getCompletionItems(directiveKey: string) {
        if (!directiveKey) return;
        if (!directiveKeys.has(directiveKey)) return;

        if (!this.cached) {
            const allItems = Array.from(this.byName.values());
            this.cached = allItems.map((it) => {
                const completion = new CompletionItem(it.name, CompletionItemKind.Constant);
                completion.documentation = it.docs;
                return completion;
            });
        }
        return this.cached;
    }
}
