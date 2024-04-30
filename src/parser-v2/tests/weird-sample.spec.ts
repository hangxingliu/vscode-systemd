import { deepStrictEqual } from "assert";
import { tokenizer } from "../tokenizer";
import { AssertTokens, test } from "./utils";
import { Token, TokenType, TokenizerResult } from "../types";

const confLines = [
    //
    `# Test \\`,
    `[TestSection]`,
    `Test=#123 \\`,
    `# 1234`,
    `  ; test 2`,
    `456 \\`,
    `abc`,
];
const conf = confLines.join("\n");

test(confLines[0], ({ conf, diagnosis }) => {
    const { tokens, forecast } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(forecast, TokenType.comment);
});

let finalResult: TokenizerResult;
test(conf, ({ conf, diagnosis }) => {
    const { tokens, forecast } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(forecast, TokenType.directiveValue);

    const assert = new AssertTokens(tokens);
    assert
        .comment("# Test \\")
        .section("[TestSection]")
        .key("Test")
        .assignment()
        .value("#123 \\")
        .comment("# 1234")
        .value("  ")
        .comment("; test 2")
        .value("456 \\")
        .value("abc");

    finalResult = { tokens, forecast };
});

let prevTokens: Token[] = [];
for (let i = 0; i <= conf.length; i++) {
    const partialConf = conf.slice(0, i);

    test(partialConf, ({ diagnosis }) => {
        const result = tokenizer(partialConf);
        const resultIncr = tokenizer(partialConf, { prevTokens });
        diagnosis(result);

        prevTokens = resultIncr.tokens;
        deepStrictEqual(result, resultIncr);

        // is last
        if (i === conf.length) deepStrictEqual(resultIncr, finalResult!);
    });
}
