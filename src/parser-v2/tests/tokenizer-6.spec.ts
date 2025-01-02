import { deepStrictEqual } from "assert";
import { tokenizer } from "../tokenizer.js";
import { TokenType } from "../types.js";
import { AssertTokens, test } from "./utils.js";

test(["Test=123 \\", "# comment", "value"].join("\n"), ({ conf, diagnosis }) => {
    const result1 = tokenizer(conf);
    diagnosis(result1);

    new AssertTokens(result1.tokens).key("Test").assignment().value("123 \\").comment().value("value");
    deepStrictEqual(result1.forecast, TokenType.directiveValue);
});
