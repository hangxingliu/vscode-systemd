import { LocationTuple, Token, TokenType } from "./types.js";

export class TextLocationUtils {
    offset: number;
    private line: number;
    private char: number;

    constructor(prev?: LocationTuple) {
        if (prev) {
            this.offset = prev[0];
            this.line = prev[1];
            this.char = prev[2];
        } else {
            this.offset = 0;
            this.line = 0;
            this.char = 0;
        }
    }

    /** Move in the same line */
    readonly move = (offset: number) => {
        this.char += offset;
        this.offset += offset;
    };

    /** Move in the same line */
    static move(tuple: Readonly<LocationTuple>, offset: number): LocationTuple {
        return [tuple[0] + offset, tuple[1], tuple[2] + offset];
    }

    /** Move to next character in the same line */
    readonly moveToNext = () => {
        this.char++;
        this.offset++;
    };

    /** Move the new line */
    readonly moveToNewLine = () => {
        this.line++;
        this.offset++;
        this.char = 0;
    };

    /**
     * Create a location tuple from current state
     */
    readonly get = (): LocationTuple => [this.offset, this.line, this.char] as const;
    readonly getWithOffset = (inlineOffset: number): LocationTuple => [
        this.offset + inlineOffset,
        this.line,
        this.char + inlineOffset,
    ];
}

export const tokenTypeNames: { [x in TokenType]: string } = {
    [TokenType.none]: "none",
    [TokenType.comment]: "comment",
    [TokenType.section]: "section",
    [TokenType.directiveKey]: "key",
    [TokenType.directiveValue]: "value",
    [TokenType.assignment]: "assignment",
    [TokenType.unknown]: "unknown",
};

export function dumpToken(token: Token) {
    let log = `Token { ${tokenTypeNames[token.type]}; `.padEnd(20);
    const [from, to] = token.range;
    log += `L${from[1] + 1},${from[2] + 1} ~ L${to[1] + 1},${to[2] + 1}; `.padEnd(16);
    log += `text=${JSON.stringify(token.text)}; `;
    log += `}`;
    return log;
}
