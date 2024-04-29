import { tokenizer } from "../tokenizer.js";
import { TokenType } from "../types.js";
import { test } from "./utils.js";
import { deepStrictEqual } from "assert";

test("", ({ conf, diagnosis }) => {
    const result = tokenizer(conf);
    diagnosis(result);
    deepStrictEqual(result.tokens, []);
});

test("[A", ({ conf, diagnosis, range, loc }) => {
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 2),
            text: "[A",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.section);
});

test("[A]", ({ conf, diagnosis, range, loc }) => {
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.unknown);
});

test("[A]U", ({ conf, diagnosis, range, loc }) => {
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
        {
            type: TokenType.unknown,
            range: range(3, 4),
            text: "U",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.unknown);
});

test("[A]U\n", ({ conf, diagnosis, range, loc }) => {
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
        {
            type: TokenType.unknown,
            range: range(3, 4),
            text: "U",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.none);
});

test("[A]U\nK", ({ conf, diagnosis, range, loc }) => {
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
        {
            type: TokenType.unknown,
            range: range(3, 4),
            text: "U",
        },
        {
            type: TokenType.directiveKey,
            range: range(5, 6),
            text: "K",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.directiveKey);
});

test("[A]U\nK ", ({ conf, diagnosis, range, loc }) => {
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
        {
            type: TokenType.unknown,
            range: range(3, 4),
            text: "U",
        },
        {
            type: TokenType.directiveKey,
            range: range(5, 7),
            text: "K ",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.assignment);
});

test("[A]U\nK \n", ({ conf, diagnosis, range, loc }) => {
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
        {
            type: TokenType.unknown,
            range: range(3, 4),
            text: "U",
        },
        {
            type: TokenType.directiveKey,
            range: range(5, 7),
            text: "K ",
        },
    ]);

    deepStrictEqual(result.forecast, TokenType.none);
});

test("[A]U\nK=\\\n", ({ conf, diagnosis, range, loc }) => {
    process.env.debug_it = "1";
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
        {
            type: TokenType.unknown,
            range: range(3, 4),
            text: "U",
        },
        {
            type: TokenType.directiveKey,
            range: range(5, 6),
            text: "K",
        },
        {
            type: TokenType.assignment,
            range: range(6, 7),
            text: "=",
        },
        {
            type: TokenType.directiveValue,
            range: range(7, 8),
            text: "\\",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.directiveValue);
});

test("[A]U\nK=\\\n #", ({ conf, diagnosis, range, loc }) => {
    const result = tokenizer(conf);
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
        {
            type: TokenType.unknown,
            range: range(3, 4),
            text: "U",
        },
        {
            type: TokenType.directiveKey,
            range: range(5, 6),
            text: "K",
        },
        {
            type: TokenType.assignment,
            range: range(6, 7),
            text: "=",
        },
        {
            type: TokenType.directiveValue,
            range: range(7, 8),
            text: "\\",
        },
        {
            type: TokenType.directiveValue,
            range: range(9, 10),
            text: " ",
        },
        {
            type: TokenType.comment,
            range: range(10, 11),
            text: "#",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.comment);
});

test("[A]U\nK=a\n ", ({ conf, diagnosis, range, loc }) => {
    process.env.debug_it = "1";
    const result = tokenizer(conf, { mkosi: true });
    diagnosis(result.tokens);
    deepStrictEqual(result.tokens, [
        {
            type: TokenType.section,
            range: range(0, 3),
            text: "[A]",
        },
        {
            type: TokenType.unknown,
            range: range(3, 4),
            text: "U",
        },
        {
            type: TokenType.directiveKey,
            range: range(5, 6),
            text: "K",
        },
        {
            type: TokenType.assignment,
            range: range(6, 7),
            text: "=",
        },
        {
            type: TokenType.directiveValue,
            range: range(7, 8),
            text: "a",
        },
    ]);
    deepStrictEqual(result.forecast, TokenType.directiveValue);
});
