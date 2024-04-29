import { tokenizer } from "../tokenizer.js";
import { TokenType } from "../types.js";
import { test } from "./utils.js";
import { deepStrictEqual } from "assert";

test("K=\\\n", ({ conf, diagnosis, range }) => {
    const result = tokenizer(conf);
    diagnosis(result);
    deepStrictEqual(result.forecast, TokenType.directiveValue);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.directiveKey,
            text: "K",
            range: range(0, 1),
        },
        {
            type: TokenType.assignment,
            text: "=",
            range: range(1, 2),
        },
        {
            type: TokenType.directiveValue,
            text: "\\",
            range: range(2, 3),
        },
    ]);
});

test("K=\\\\\n", ({ conf, diagnosis, range }) => {
    const result = tokenizer(conf);
    diagnosis(result);
    deepStrictEqual(result.forecast, TokenType.none);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.directiveKey,
            text: "K",
            range: range(0, 1),
        },
        {
            type: TokenType.assignment,
            text: "=",
            range: range(1, 2),
        },
        {
            type: TokenType.directiveValue,
            text: "\\\\",
            range: range(2, 4),
        },
    ]);
});

