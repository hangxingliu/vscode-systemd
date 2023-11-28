import { TextDocument } from "vscode";
import { languageId } from "./syntax/const";
import { SystemdFileType, parseSystemdFilePath } from "./parser/file-info";

// type WorkspaceListener<Key extends keyof typeof workspace> = typeof workspace[Key] extends Event<infer EventArg>
//     ? Parameters<Event<EventArg>>[0]
//     : never;

export class SystemdDocumentManager {
    static instance: SystemdDocumentManager;
    static init() {
        this.instance = new SystemdDocumentManager();
        return this.instance;
    }

    readonly types = new Map<string, SystemdFileType>();
    private constructor() {}

    readonly onDidOpenTextDocument = (document: TextDocument): boolean => {
        if (document.languageId !== languageId) return false;
        if (!document.uri) return false;
        if (this.types.has(document.fileName)) return true;
        this.types.set(document.fileName, parseSystemdFilePath(document.fileName, true));
        return true;
    };
    readonly getType = (doc: Pick<TextDocument, "fileName">) => {
        let type = this.types.get(doc.fileName);
        if (typeof type !== 'number') {
            type = parseSystemdFilePath(doc.fileName, true);
            this.types.set(doc.fileName, type);
        }
        return type;
    }
    readonly setType = (doc: Pick<TextDocument, "fileName">, type: SystemdFileType) =>
        this.types.set(doc.fileName, type);
}
