import {
    TextDocument,
    CancellationToken,
    FoldingRangeProvider,
    FoldingContext,
    FoldingRange,
    EventEmitter,
    FoldingRangeKind,
} from "vscode";
import { tokenizer } from "./parser-v2/tokenizer";
import { getFoldingRanges } from "./parser-v2/get-folding-ranges";
import { SystemdDocumentManager } from "./vscode-documents";
import { isMkosiFile, systemdFileTypeNames } from "./parser/file-info.js";

export class SystemdFoldingRange implements FoldingRangeProvider {
    private _onDidChangeFoldingRanges = new EventEmitter<void>();
    readonly onDidChangeFoldingRanges = this._onDidChangeFoldingRanges.event;

    provideFoldingRanges(document: TextDocument, context: FoldingContext, token: CancellationToken) {
        const fileType = SystemdDocumentManager.instance.getType(document);
        const typeName = systemdFileTypeNames[fileType];
        console.log(`provideFoldingRanges("${document.uri.toString()}", "${typeName}")`);

        const { tokens } = tokenizer(document.getText(), { mkosi: isMkosiFile(fileType) });
        const ranges = getFoldingRanges(tokens);
        return ranges.map((it) => new FoldingRange(it[0], it[1], it[2] ? FoldingRangeKind[it[2]] : undefined));
    }
}
