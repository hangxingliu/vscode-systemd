import { inspect } from "util";
import { LocationTuple, RangeTuple, Token, TokenType } from "../types.js";
import { deepStrictEqual, ok } from "assert";
import { dumpToken, tokenTypeNames } from "../token-dump.js";

// terminal colors
const DIM = `\u001b[2m`;
const RESET = `\u001b[0m`;

/**
 * A location transformer for unit test uses:
 * * `offset` => `[line, char]`
 * * `[line, char]` => `offset`
 */
export class LocationTransformerForSpecTests {
    private lines: string[];
    private lineOffsets: number[];

    constructor(text: string) {
        // split lines and get the offset of each line
        const lines = text.split("\n");
        const offsets = new Array<number>(lines.length);
        let offset = 0;
        for (let i = 0; i < lines.length; i++) {
            offsets[i] = offset;
            offset += lines[i].length + 1;
        }
        this.lines = lines;
        this.lineOffsets = offsets;
    }

    getByOffset(targetOffset: number): LocationTuple {
        const { lineOffsets, lines } = this;
        let lineNo = 0;
        while (lineNo < lineOffsets.length && lineOffsets[lineNo] <= targetOffset) lineNo++;
        lineNo--;

        if (lineNo < 0 || lineNo >= lines.length) throw new Error(`the given offset ${targetOffset} is out of bounds`);

        const char = targetOffset - lineOffsets[lineNo];
        return [targetOffset, lineNo, char] as const;
    }

    getByLineAndChar(line: number, char: number): LocationTuple {
        const { lines, lineOffsets } = this;
        if (line >= lines.length) throw new Error(`the given line no ${line} must less than ${lines.length}`);

        const lineWidth = lines[line].length;
        if (char > lineWidth)
            throw new Error(`the given inline offset ${char} at line ${line} is greater than or equal to ${lineWidth}`);

        const offset = lineOffsets![line] + char;
        return [offset, line, char];
    }
}

/**
 * A simple chaining token list assertion util
 * @example new AssertTokens(tokenFrom('Key=Value')).key('Key').assignment().value();
 */
export class AssertTokens {
    private tokenIndex = 0;
    constructor(private readonly tokens: Token[]) {}

    /** Assert current token in the token list */
    private assert(this: AssertTokens, type: TokenType, text?: string) {
        const tokenIndex = this.tokenIndex++;
        const token = this.tokens[tokenIndex];

        const msg =
            `token[${tokenIndex}] should be a ${tokenTypeNames[type]} node "${text}",` + ` actual: ${dumpToken(token)}`;
        ok(token, msg);
        deepStrictEqual(token.type, type);
        if (typeof text !== "undefined") deepStrictEqual(token.text, text);
        return this;
    }
    /** Assert that current token should be the expected section */
    section(section: string) {
        return this.assert(TokenType.section, section);
    }
    /** Assert that current token should be a unknown node */
    unknown(text: string) {
        return this.assert(TokenType.unknown, text);
    }
    /** Assert that current token should be a directive key */
    key(key: string) {
        return this.assert(TokenType.directiveKey, key);
    }
    /** Assert that current token should be the `=` operator */
    assignment() {
        return this.assert(TokenType.assignment, "=");
    }
    /** Assert that current token should be a directive value */
    value(key: string) {
        return this.assert(TokenType.directiveValue, key);
    }
    /** Assert that current token should be a comment */
    comment(comment?: string) {
        return this.assert(TokenType.comment, comment);
    }
}

/**
 * Array assertion with detailed message
 */
export function assertItems<T>(actual: T[], expected: T[]) {
    for (let i = 0; i < expected.length; i++) {
        const errorMsg = [
            `actual[${i}] !== expected[${i}]`,
            `actual:   ${inspect(actual[i], true, 1, true)}`,
            `expected: ${inspect(expected[i], true, 1, true)}`,
        ];
        deepStrictEqual(actual[i], expected[i], errorMsg.join("\n"));
    }
}

/**
 * A test function like `it` function in mocha with extra test context
 * @param conf A systemd/mkosi/podman configuration text needs to be tested
 * @param fn A test function for the given text
 */
export type TestFn = (conf: string, fn: (ctx: TestFnContext) => void) => void;

/**
 * The test context for the test function
 */
export type TestFnContext = {
    /**
     * The input configuration text
     */
    conf: string;
    /**
     * The test function could add some diagnosis by this function.
     * Provided diagnosis would be printed when the test failed
     */
    diagnosis: <T>(data: T, reset?: boolean) => T;
    /**
     * Create a location tuple from the given line number and in-line offset
     */
    at: (line: number, char: number) => LocationTuple;
    /**
     * Create a location tuple from the given offset
     */
    loc: (offset: number) => LocationTuple;
    /**
     * Create a range tuple from the given offsets
     */
    range: (offset: number, offset2: number) => RangeTuple;
};

const skipFn: TestFn = (conf, fn) => {};
const testFn: TestFn = (conf, fn) => {
    const location = new LocationTransformerForSpecTests(conf);
    const diagnosisData: Array<{ stack: string; data: unknown }> = [];
    const diagnosis = <T>(data: T, reset?: boolean): T => {
        if (reset) diagnosisData.length = 0;
        // Error
        //    at trace (.../src/parser-v2/utils-test.ts:7:24)
        //    at <anonymous> (.../src/parser-v2/tokenizer-1.spec.ts:9:5)
        const stack = (new Error().stack || "").split("\n");
        diagnosisData.push({ stack: (stack[2] || "").trim(), data });
        return data;
    };

    const context: TestFnContext = {
        conf,
        diagnosis,
        loc: (offset) => location.getByOffset(offset),
        range: (offset, offset2) => [location.getByOffset(offset), location.getByOffset(offset2)],
        at: (line, char) => location.getByLineAndChar(line, char),
    };

    try {
        fn(context);
    } catch (error) {
        console.error("");
        console.error(`The test for the following configuration failed:${DIM}`);
        console.error(conf);
        console.error(RESET);
        for (const { stack, data } of diagnosisData) {
            const str = inspect(data, false, undefined, true);
            console.error(`Diagnosis ${stack}:`);
            str.split("\n").forEach((line) => console.error(`  ${line}`));
        }
        throw error;
    }
};

/**
 * A test function like `it` function in mocha with extra test context.
 * @see {TestFn}
 * @example it(...) or it.skip(...)
 */
export const test = Object.assign(testFn, { skip: skipFn });
