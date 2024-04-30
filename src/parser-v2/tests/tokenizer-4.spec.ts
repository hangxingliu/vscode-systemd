import { deepStrictEqual } from "assert";
import { tokenizer } from "../tokenizer.js";
import { TokenType } from "../types.js";
import { AssertTokens, test } from "./utils.js";

let exampleConf = [
    //
    "[A]", //          L1
    "===", //          L2
    "=", //            L3
    "LOL", //          L4
].join("\n");

test(exampleConf, ({ conf, diagnosis }) => {
    const result1 = tokenizer(conf);
    diagnosis(result1);

    new AssertTokens(result1.tokens).section("[A]").assignment().value("==").assignment().key("LOL");
    deepStrictEqual(result1.forecast, TokenType.directiveKey);
});

test("A=\\\n =C", ({ conf, diagnosis }) => {
    const result1 = tokenizer(conf);
    diagnosis(result1);

    new AssertTokens(result1.tokens).key("A").assignment().value("\\").value(" =C");
    deepStrictEqual(result1.forecast, TokenType.directiveValue);
});

test("A=A\n  =C", ({ conf, diagnosis }) => {
    const result1 = tokenizer(conf, { mkosi: true });
    diagnosis(result1);

    new AssertTokens(result1.tokens).key("A").assignment().value("A").value("=C");
    deepStrictEqual(result1.forecast, TokenType.directiveValue);

    const result2 = tokenizer(conf);
    diagnosis(result2);
    new AssertTokens(result2.tokens).key("A").assignment().value("A").assignment().value("C");
    deepStrictEqual(result2.forecast, TokenType.directiveValue);
});
