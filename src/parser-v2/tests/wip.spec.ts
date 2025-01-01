/* eslint-disable prefer-const */
import { tokenizer } from "../tokenizer.js";
import { dumpToken, tokenTypeNames } from "../token-dump.js";
import type { Token } from "../types.js";

let conf = [
    //
    "[A]", //       L1
    "B=C\\", //     L2
    " # c", //      L3
].join("\n");
const conf2 = conf + "\nCCC";

let prevTokens: Token[];

{
    console.log('=====')
    const { tokens, forecast } = tokenizer(conf);
    tokens.forEach((token) => console.log(dumpToken(token)));
    console.log(tokenTypeNames[forecast]);
    prevTokens = tokens;
}

{
    console.log("=====");
    const { tokens, forecast } = tokenizer(conf2, { prevTokens });
    tokens.forEach((token) => console.log(dumpToken(token)));
    console.log(tokenTypeNames[forecast]);
    prevTokens = tokens;
}

{
    console.log("=====");
    const { tokens, forecast } = tokenizer(conf2 + "D", { prevTokens });
    tokens.forEach((token) => console.log(dumpToken(token)));
    console.log(tokenTypeNames[forecast]);
    prevTokens = tokens;
}
