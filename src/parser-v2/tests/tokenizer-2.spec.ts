import { deepStrictEqual } from "assert";
import { tokenizer } from "../tokenizer.js";
import { AssertTokens, test } from "./utils.js";
import { TokenType } from "../types.js";

test('Key  =   Value ', ({ conf, diagnosis }) => {
    const prev = tokenizer(conf.slice(0, 6));

    const { tokens, forecast } = tokenizer(conf, { prevTokens: prev.tokens });
    diagnosis(tokens);

    deepStrictEqual(forecast, TokenType.directiveValue);
    new AssertTokens(tokens).key('Key  ').assignment().value('Value ');
});
