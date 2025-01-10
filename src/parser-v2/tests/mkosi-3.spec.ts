import { deepStrictEqual } from "assert";
import { tokenizer } from "../tokenizer.js";
import { AssertTokens, test } from "./utils.js";
import { TokenType } from "../types.js";

test("[Host] ", ({ conf, diagnosis, range }) => {
    const { tokens, forecast } = tokenizer(conf, { mkosi: true });
    diagnosis(tokens);
    deepStrictEqual(tokens, [
        { type: TokenType.section, range: range(0, 6), text: "[Host]" },
        { type: TokenType.unknown, range: range(6, 7), text: " " },
    ]);
    deepStrictEqual(forecast, TokenType.unknown);
});

test("[Host] #", ({ conf, diagnosis, range }) => {
    const { tokens, forecast } = tokenizer(conf, { mkosi: true });
    diagnosis(tokens);
    deepStrictEqual(tokens, [
        { type: TokenType.section, range: range(0, 6), text: "[Host]" },
        { type: TokenType.unknown, range: range(6, 7), text: " " },
        { type: TokenType.comment, range: range(7, 8), text: "#" },
    ]);
    deepStrictEqual(forecast, TokenType.comment);
});

test("[Host]\nPackages=\n  acl\n  # comment\n", ({ conf, diagnosis, range }) => {
    const { tokens, forecast } = tokenizer(conf, { mkosi: true });
    diagnosis(tokens);
    deepStrictEqual(forecast, TokenType.none);
});

test("[Host]\nPackages=\n  acl\n  # comment\n ", ({ conf, diagnosis, range }) => {
    const { tokens, forecast } = tokenizer(conf, { mkosi: true });
    diagnosis(tokens);
    deepStrictEqual(forecast, TokenType.directiveValue);
});

test("[Host]\nPackages=\n  acl\nNew", ({ conf, diagnosis, range }) => {
    const { tokens, forecast } = tokenizer(conf, { mkosi: true });
    diagnosis(tokens);
    deepStrictEqual(forecast, TokenType.directiveKey);
});


test("[Host]\nPackages=\n  acl\n  # comment\nNew", ({ conf, diagnosis, range }) => {
    const { tokens, forecast } = tokenizer(conf, { mkosi: true });
    diagnosis(tokens);
    deepStrictEqual(forecast, TokenType.directiveKey);
});
