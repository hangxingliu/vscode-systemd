import { TextDocument, EventEmitter, ExtensionContext, FileDeleteEvent } from "vscode";
import { languageId } from "./syntax/const-language-conf";
import { SystemdFileType, parseSystemdFilePath, podmanFileTypes } from "./parser/file-info";
import { ExtensionConfig } from "./config/vscode-config-loader";

// type WorkspaceListener<Key extends keyof typeof workspace> = typeof workspace[Key] extends Event<infer EventArg>
//     ? Parameters<Event<EventArg>>[0]
//     : never;

export type SetDocumentTypeEvent = { fileName: string } | { all: true };
type SavedUnitType = {
    file: SystemdFileType;
};

export class SystemdDocumentManager extends EventEmitter<SetDocumentTypeEvent> {
    static instance: SystemdDocumentManager;
    static init(context: ExtensionContext, config: ExtensionConfig) {
        this.instance = new SystemdDocumentManager(context, config);
        return this.instance;
    }

    private readonly types = new Map<string, SystemdFileType>();
    private readonly modified = new Set<string>();
    private podmanEnabled: boolean;
    private constructor(private readonly context: ExtensionContext, private readonly config: ExtensionConfig) {
        super();

        this.podmanEnabled = config.podmanCompletion;
        config.event(this.afterChangedConfig);
    }

    private readonly afterChangedConfig = () => {
        const prev = this.podmanEnabled;
        const enabled = this.config.podmanCompletion;
        this.podmanEnabled = enabled;

        if (prev !== enabled) {
            let count = 0;
            const entries = Array.from(this.types.entries());
            for (const [filePath, type] of entries) {
                let reset = false;
                if (!type) reset = true;
                else if (!this.modified.has(filePath))
                    reset = enabled ? type === SystemdFileType.network : podmanFileTypes.has(type);
                if (!reset) continue;

                this.types.set(filePath, parseSystemdFilePath(filePath, enabled));
                this.modified.delete(filePath);
                count++;
            }
            if (count > 0) this.fire({ all: true });
        }
    };

    private readonly getSavedType = (filePath: string) => {
        const type = this.context.workspaceState.get(`unit-type:${filePath}`);
        if (!type || typeof type !== "object") return;
        const fileType = (type as SavedUnitType).file;
        if (typeof fileType === "number") return fileType;
    };
    private readonly saveType = async (filePath: string, fileType: SystemdFileType) => {
        if (!filePath) return;
        const obj: SavedUnitType = { file: fileType };
        await this.context.workspaceState.update(`unit-type:${filePath}`, obj);
    };
    private readonly removeSavedType = async (files: string[]) => {
        const wss = this.context.workspaceState;
        const prefix = "unit-type:";
        const keys = wss.keys();

        const matches = new Set<string>();
        const prefixes: string[] = [];
        for (const file of files) {
            if (!file) continue;
            matches.add(`${prefix}${file}`);
            prefixes.push(`${prefix}${file.replace(/\/?$/, "/")}`);
        }
        for (const key of keys) {
            if (matches.has(key) || prefixes.find((it) => key.startsWith(it))) {
                await wss.update(key, undefined);
                console.log(`workspaceState.remove("${key}")`);
            }
        }
    };

    readonly onDidOpenTextDocument = (document: TextDocument): boolean => {
        if (document.languageId !== languageId) return false;
        if (!document.uri) return false;
        if (this.types.has(document.fileName)) return true;
        this.getType(document);
        return true;
    };
    readonly onDidDeleteFiles = (e: FileDeleteEvent) => {
        this.removeSavedType(e.files.map((it) => it.fsPath));
    };
    readonly getType = (doc: Pick<TextDocument, "fileName">) => {
        let type = this.types.get(doc.fileName);
        if (typeof type !== "number") {
            type = this.getSavedType(doc.fileName);
            if (type === undefined) type = parseSystemdFilePath(doc.fileName, this.podmanEnabled);
            else this.modified.add(doc.fileName);
            this.types.set(doc.fileName, type);
        }
        return type;
    };
    readonly setType = (doc: Pick<TextDocument, "fileName">, type: SystemdFileType) => {
        this.types.set(doc.fileName, type);
        this.saveType(doc.fileName, type);
        this.modified.add(doc.fileName);
        this.fire(doc);
    };
}
