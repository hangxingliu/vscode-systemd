import { inspect } from "util";
import { LocationTuple, RangeTuple, Token, TokenType } from "../types.js";
import { deepStrictEqual, ok } from "assert";

const DIM = `\u001b[2m`;
const RESET = `\u001b[0m`;

export const tokenTypeNames: { [x in TokenType]: string } = {
    [TokenType.none]: "none",
    [TokenType.comment]: "comment",
    [TokenType.section]: "section",
    [TokenType.directiveKey]: "key",
    [TokenType.directiveValue]: "value",
    [TokenType.assignment]: "assignment",
    [TokenType.unknown]: "unknown",
};

export function dumpToken(token?: Token) {
    if (!token) return `Undefined`;
    let log = `Token { ${tokenTypeNames[token.type]}; `.padEnd(20);
    const [from, to] = token.range;
    log += `L${from[1] + 1},${from[2] + 1} ~ L${to[1] + 1},${to[2] + 1}; `.padEnd(16);
    log += `text=${JSON.stringify(token.text)}; `;
    log += `}`;
    return log;
}

export class LocationUtils {
    constructor(private readonly text: string) {}
    private last?: LocationTuple;

    get(targetOffset: number): LocationTuple {
        let offset: number;
        let lineNo: number;
        let inlineOffset: number;
        if (this.last && this.last[0] <= targetOffset) {
            offset = this.last[0];
            lineNo = this.last[1];
            inlineOffset = this.last[2];
        } else {
            offset = 0;
            lineNo = 0;
            inlineOffset = 0;
        }

        for (; offset < targetOffset; offset++) {
            if (this.text[offset] === "\n") {
                lineNo++;
                inlineOffset = 0;
            } else {
                inlineOffset++;
            }
        }
        this.last = [targetOffset, lineNo, inlineOffset];
        return this.last;
    }
}

export class AssertTokens {
    private index = 0;
    constructor(private readonly tokens: Token[]) {}
    private validate(type: TokenType, text?: string) {
        const i = this.index++;
        const token = this.tokens[i];

        const msg = `token[${i}] should be a ${tokenTypeNames[type]} node "${text}", actual: ${dumpToken(token)}`;
        ok(token, msg);
        deepStrictEqual(token.type, type);
        if (typeof text !== "undefined") deepStrictEqual(token.text, text);
        return this;
    }
    section(section: string) {
        return this.validate(TokenType.section, section);
    }
    unknown(text: string) {
        return this.validate(TokenType.unknown, text);
    }
    key(key: string) {
        return this.validate(TokenType.directiveKey, key);
    }
    assignment() {
        return this.validate(TokenType.assignment, "=");
    }
    value(key: string) {
        return this.validate(TokenType.directiveValue, key);
    }
    comment(comment?: string) {
        return this.validate(TokenType.comment, comment);
    }
}

export type TestFn = (conf: string, fn: (ctx: TestFnContext) => void) => void;
export type TestFnContext = {
    conf: string;
    diagnosis: (data: unknown) => void;
    loc: (offset: number) => LocationTuple;
    range: (offset: number, offset2: number) => RangeTuple;
};

const skipFn: TestFn = (conf, fn) => {};
const testFn: TestFn = (conf, fn) => {
    const location = new LocationUtils(conf);
    const diagnosisData: Array<{ stack: string; data: unknown }> = [];
    const diagnosis = (data: unknown) => {
        // Error
        //    at trace (.../src/parser-v2/utils-test.ts:7:24)
        //    at <anonymous> (.../src/parser-v2/tokenizer-1.spec.ts:9:5)
        const stack = (new Error().stack || "").split("\n");
        diagnosisData.push({ stack: (stack[2] || "").trim(), data });
    };
    const context: TestFnContext = {
        conf,
        diagnosis,
        loc: (offset) => location.get(offset),
        range: (offset, offset2) => [location.get(offset), location.get(offset2)],
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
export const test = Object.assign(testFn, { skip: skipFn });
