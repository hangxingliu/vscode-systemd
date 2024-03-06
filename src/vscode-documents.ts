import { TextDocument, EventEmitter, ExtensionContext, FileDeleteEvent } from "vscode";
import { languageId } from "./syntax/const-language-conf";
import { SystemdFileType, parseSystemdFilePath } from "./parser/file-info";

// type WorkspaceListener<Key extends keyof typeof workspace> = typeof workspace[Key] extends Event<infer EventArg>
//     ? Parameters<Event<EventArg>>[0]
//     : never;

export type SetDocumentTypeEvent = {
    fileName: string;
};
type SavedUnitType = {
    file: SystemdFileType;
};

export class SystemdDocumentManager extends EventEmitter<SetDocumentTypeEvent> {
    static instance: SystemdDocumentManager;
    static init(context: ExtensionContext) {
        this.instance = new SystemdDocumentManager(context);
        return this.instance;
    }

    readonly types = new Map<string, SystemdFileType>();
    private constructor(private readonly context: ExtensionContext) {
        super();
    }

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
    readonly removeSavedType = async (files: string[]) => {
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

        let type = this.getSavedType(document.fileName);
        if (type === undefined) type = parseSystemdFilePath(document.fileName, true);
        this.types.set(document.fileName, type);
        return true;
    };
    readonly onDidDeleteFiles = (e: FileDeleteEvent) => {
        this.removeSavedType(e.files.map((it) => it.fsPath));
    };
    readonly getType = (doc: Pick<TextDocument, "fileName">) => {
        let type = this.types.get(doc.fileName);
        if (typeof type !== "number") {
            type = this.getSavedType(doc.fileName);
            if (type === undefined) type = parseSystemdFilePath(doc.fileName, true);
            this.types.set(doc.fileName, type);
        }
        return type;
    };
    readonly setType = (doc: Pick<TextDocument, "fileName">, type: SystemdFileType) => {
        this.types.set(doc.fileName, type);
        this.saveType(doc.fileName, type);
        this.fire(doc);
    };
}
