import { FoldingRange, FoldingRangeKind, Token, TokenType } from "./types.js";

export function toOneBasedRanges(zeroBasedRanges: FoldingRange[]) {
    return zeroBasedRanges.map((it) => [it[0] + 1, it[1] + 1, it[2]] as FoldingRange);
}

export function getFoldingRanges(tokens: Token[]): FoldingRange[] {
    if (tokens.length <= 1) return [];
    const lastLine = tokens[tokens.length - 1].range[1][1];

    const result: FoldingRange[] = [];
    const regionStacks: number[] = [];
    let lastValueLine = -1;
    for (let i = 0; i < tokens.length; i++) {
        const { type, range } = tokens[i];
        const startLine = range[0][1];

        if (type === TokenType.comment) {
            const nextIndex = onComment(i, startLine);
            if (nextIndex > i) i = nextIndex - 1;
        } else if (type === TokenType.section) {
            onSection(i, startLine);
        } else if (startLine > lastValueLine && type === TokenType.directiveValue) {
            const rangeIndex = onValue(i, startLine);
            if (rangeIndex >= 0) lastValueLine = result[rangeIndex][1];
        }
    }
    for (let i = 0; i < result.length; i++) {
        const range = result[i];
        if (range[1] >= 0) continue;
        result.splice(i--, 1);
    }
    return result;

    function onComment(index: number, startLine: number) {
        let nextToken: Token | undefined;
        for (; index < tokens.length; index++) {
            if (tokens[index].type !== TokenType.comment) break;

            nextToken = tokens[index];
            const text = nextToken.text || "";
            if (hasRegionKeyword(text)) {
                const rangeIndex = newRange(startLine, -1, "Region");
                if (rangeIndex >= 0) regionStacks.push(rangeIndex);
                startLine = nextToken.range[1][1] + 1;
                continue;
            }
            if (hasEndRegionKeyword(text)) {
                const rangeIndex = regionStacks.pop();
                resolveEnd(rangeIndex, nextToken);
                startLine = nextToken.range[1][1] + 1;
                continue;
            }
        }
        if (nextToken) newRange(startLine, nextToken, "Comment");
        return index;
    }

    function onValue(index: number, startLine: number) {
        let j = index + 1;
        for (; j < tokens.length; j++) {
            const token = tokens[j];
            if (token.type === TokenType.comment) continue;
            if (token.type !== TokenType.directiveValue) break;
        }

        let endToken = tokens[--j];
        while (endToken.type === TokenType.comment) {
            // this comment has leading indents
            if (endToken.range[0][2] > 0) break;
            if (j <= index) break;
            endToken = tokens[--j];
        }

        while (j >= 0) {
            const { type, range } = tokens[j--];
            if (type !== TokenType.assignment) continue;
            startLine = range[0][1];
            break;
        }
        return newRange(startLine, endToken);
    }

    function onSection(index: number, startLine: number) {
        let j = index + 1;
        for (; j < tokens.length; j++) if (tokens[j].type === TokenType.section) break;

        // EOF
        if (j >= tokens.length) return newRange(startLine, lastLine);

        let endToken = tokens[--j];
        while (j > index && endToken.type === TokenType.comment) endToken = tokens[--j];
        return newRange(startLine, endToken);
    }

    function newRange(fromLine: number, toLine: number | Token, kind?: FoldingRangeKind): number {
        if (typeof toLine !== "number") toLine = toLine.range[1][1];
        // -1 indicates that the end line of this range has not resolved yet
        if (toLine !== -1 && toLine <= fromLine) return -1;

        result.push([fromLine, toLine, kind]);
        return result.length - 1;
    }

    function resolveEnd(regionIndex: number | undefined, toLine: number | Token) {
        if (typeof regionIndex !== "number") return;
        const range = result[regionIndex];
        if (!range) return;
        if (typeof toLine !== "number") toLine = toLine.range[1][1];
        range[1] = toLine;
    }

    function hasRegionKeyword(comment?: string) {
        if (!comment) return;
        return /^(?:#\s*|;\s*#)region\b/.test(comment);
    }

    function hasEndRegionKeyword(comment?: string) {
        if (!comment) return;
        return /^(?:#\s*|;\s*#)end[rR]egion\b/.test(comment);
    }
}
