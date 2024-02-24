import { CompletionItem, CompletionItemKind, MarkdownString, Uri } from "vscode";
import { manpageURLs } from "../manpage-url";
import { isManifestItemForCapability } from "../types-manifest";

export type SystemdCapabilityItem = {
    name: string;
    docs: MarkdownString;
};

/** https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html */
const directiveKeysLC = new Set(["capabilityboundingset", "ambientcapabilities"]);

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
        for (const item of items) this.addItem(item);
        this.baseUri = Uri.parse(manpageURLs.capabilities);
    }

    addItem(item: unknown[]) {
        if (isManifestItemForCapability(item)) {
            const docs = new MarkdownString(item[2]);
            docs.baseUri = this.baseUri;
            const cap: SystemdCapabilityItem = { name: item[1], docs };
            this.byName.set(cap.name, cap);
            return;
        }
    }

    testDirectiveKey(directive?: string) {
        return typeof directive === "string" ? directiveKeysLC.has(directive.toLowerCase()) : false;
    }

    getByName(capName: string) {
        return this.byName.get(capName);
    }

    getCompletionItems(directiveKey: string) {
        if (!directiveKey) return;
        const lc = directiveKey.toLocaleLowerCase();
        if (!directiveKeysLC.has(lc)) return;

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
