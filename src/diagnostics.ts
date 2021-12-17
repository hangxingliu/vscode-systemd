import { Diagnostic, DiagnosticCollection, languages, Uri } from "vscode";

export const enum SystemdDiagnosticType {
    unknownDirective = 1,
    deprecatedDirective = 2,
}

export class SystemdDiagnosticManager {
    private _collection: DiagnosticCollection;
    private static readonly collectionName = 'Systemd';

    private getCollection() {
        if (!this._collection)
            this._collection = languages.createDiagnosticCollection(SystemdDiagnosticManager.collectionName);
        return this._collection;
    }

    set(uri: Uri, diagnostics: Diagnostic[]) {
        this.getCollection().set(uri, diagnostics);
    }
    delete(uri: Uri) {
        if (!this._collection) return;
        this._collection.delete(uri);
    }
    clear() {
        if (!this._collection) return;
        this._collection.clear();
    }

    private static _instance: SystemdDiagnosticManager;
    static get() {
        if (!SystemdDiagnosticManager._instance) SystemdDiagnosticManager._instance = new SystemdDiagnosticManager();
        return SystemdDiagnosticManager._instance;
    }
}
