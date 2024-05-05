import { TextDocument, EventEmitter, ExtensionContext, FileDeleteEvent } from "vscode";
import { allLanguageIds, languageId } from "./syntax/const-language-conf";
import { SystemdFileType, parseSystemdFilePath, podmanFileTypes } from "./parser/file-info";
import { ExtensionConfig } from "./config/vscode-config-loader";

// type WorkspaceListener<Key extends keyof typeof workspace> = typeof workspace[Key] extends Event<infer EventArg>
//     ? Parameters<Event<EventArg>>[0]
//     : never;

export type SetDocumentTypeEvent = { fileName: string } | { all: true };
type SavedUnitType = {
    file: SystemdFileType;
};

type Doc = Pick<TextDocument, "languageId" | "fileName">;
export class SystemdDocumentManager extends EventEmitter<SetDocumentTypeEvent> {
    static instance: SystemdDocumentManager;
    static init(context: ExtensionContext, config: ExtensionConfig) {
        this.instance = new SystemdDocumentManager(context, config);
        return this.instance;
    }

    static getDefaultType(doc: Doc, podmanEnabled: boolean) {
        if (doc.languageId === languageId.mkosi) return SystemdFileType.mkosi;
        return parseSystemdFilePath(doc.fileName, podmanEnabled);
    }

    private readonly types = new Map<string, [languageId: string, SystemdFileType]>();
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
            for (const [fileName, [languageId, type]] of entries) {
                let reset = false;
                if (!type) reset = true;
                else if (!this.modified.has(fileName))
                    reset = enabled ? type === SystemdFileType.network : podmanFileTypes.has(type);
                if (!reset) continue;

                const doc = { fileName, languageId } as const;
                const newType = SystemdDocumentManager.getDefaultType(doc, enabled);
                this.types.set(fileName, [languageId, newType]);
                this.modified.delete(fileName);
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
        if (!allLanguageIds.has(document.languageId)) return false;
        if (this.types.has(document.fileName)) return true;
        this.getType(document);
        return true;
    };
    readonly onDidDeleteFiles = (e: FileDeleteEvent) => {
        this.removeSavedType(e.files.map((it) => it.fsPath));
    };
    readonly getType = (doc: Doc) => {
        const result = this.types.get(doc.fileName);
        if (!result) {
            let type = this.getSavedType(doc.fileName);
            if (type === undefined) type = SystemdDocumentManager.getDefaultType(doc, this.podmanEnabled);
            else this.modified.add(doc.fileName);
            this.types.set(doc.fileName, [doc.languageId, type]);
            return type;
        }
        return result[1];
    };
    readonly setType = (doc: Doc, type: SystemdFileType) => {
        this.types.set(doc.fileName, [doc.languageId, type]);
        this.saveType(doc.fileName, type);
        this.modified.add(doc.fileName);
        this.fire(doc);
    };
    readonly setAutoType = (doc: Doc) => {
        const type = SystemdDocumentManager.getDefaultType(doc, this.podmanEnabled);
        this.types.set(doc.fileName, [doc.languageId, type]);
        this.modified.delete(doc.fileName);
        this.removeSavedType([doc.fileName]);
        this.fire(doc);
    };
}
