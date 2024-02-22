import {
    Range,
    Diagnostic,
    DiagnosticCollection,
    languages,
    Uri,
    Selection,
    DiagnosticSeverity,
    DiagnosticTag,
} from "vscode";

export const enum SystemdDiagnosticType {
    unknownDirective = 1,
    deprecatedDirective = 2,
    deprecatedValue = 3,
}
export type SystemdDiagnostic = Diagnostic & {
    type?: SystemdDiagnosticType;
    directive?: string;
};

export function getDiagnosticForDeprecated(range: Range, directiveName: string): SystemdDiagnostic {
    const d: SystemdDiagnostic = new Diagnostic(range, `Deprecated directive "${directiveName}"`);
    d.severity = DiagnosticSeverity.Warning;
    d.tags = [DiagnosticTag.Deprecated];
    d.type = SystemdDiagnosticType.deprecatedDirective;
    d.directive = directiveName;
    return d;
}

export function getDiagnosticForUnknown(range: Range, directiveName: string): SystemdDiagnostic {
    const d: SystemdDiagnostic = new Diagnostic(range, `Unknown directive "${directiveName}"`);
    d.severity = DiagnosticSeverity.Information;
    d.type = SystemdDiagnosticType.unknownDirective;
    d.directive = directiveName;
    return d;
}

export function getDiagnosticForValue(range: Range, directiveName: string, help: string): SystemdDiagnostic {
    const d: SystemdDiagnostic = new Diagnostic(range, help);
    d.severity = DiagnosticSeverity.Warning;
    d.type = SystemdDiagnosticType.deprecatedValue;
    d.directive = directiveName;
    return d;
}

export class SystemdDiagnosticManager {
    private _collection: DiagnosticCollection;
    private static readonly collectionName = "Systemd";

    private getCollection() {
        if (!this._collection)
            this._collection = languages.createDiagnosticCollection(SystemdDiagnosticManager.collectionName);
        return this._collection;
    }

    set(uri: Uri, diagnostics: SystemdDiagnostic[]) {
        this.getCollection().set(uri, diagnostics);
    }
    get(uri: Uri, range: Range | Selection): readonly SystemdDiagnostic[] {
        if (!uri || !this._collection) return [];
        const ds: readonly Diagnostic[] | undefined = this._collection.get(uri);
        if (!ds) return [];
        return ds.filter((it) => it.range.contains(range) || range.contains(it.range));
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
