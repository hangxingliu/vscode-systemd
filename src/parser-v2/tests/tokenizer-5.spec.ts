import { deepStrictEqual } from "assert";
import { tokenizer } from "../tokenizer.js";
import { TokenType } from "../types.js";
import { AssertTokens, test } from "./utils.js";

test('K=\\\n[V]', ({ conf, diagnosis }) => {
    const result1 = tokenizer(conf);
    diagnosis(result1);

    new AssertTokens(result1.tokens).key("K").assignment().value("\\").value("[V]");
    deepStrictEqual(result1.forecast, TokenType.directiveValue);


    const result2 = tokenizer(conf, { mkosi: true });
    diagnosis(result2);

    new AssertTokens(result2.tokens).key("K").assignment().value("\\").section("[V]");
    deepStrictEqual(result2.forecast, TokenType.unknown);
});
