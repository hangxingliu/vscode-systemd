import { Diagnostic, DiagnosticCollection, languages, Uri } from "vscode";

export class SystemdDiagnostic {
    private _collection: DiagnosticCollection;
    private static readonly collectionName = 'Systemd';

    private getCollection() {
        if (!this._collection)
            this._collection = languages.createDiagnosticCollection(SystemdDiagnostic.collectionName);
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

    private static _instance: SystemdDiagnostic;
    static get() {
        if (!SystemdDiagnostic._instance) SystemdDiagnostic._instance = new SystemdDiagnostic();
        return SystemdDiagnostic._instance;
    }
}
