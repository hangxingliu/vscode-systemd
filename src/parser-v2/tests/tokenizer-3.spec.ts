import { deepStrictEqual } from "assert";
import { tokenizer } from "../tokenizer.js";
import { TokenType } from "../types.js";

let exampleConf = [
    //
    "[A", //       L1
    "", //         L2
].join("\n");

const result1 = tokenizer(exampleConf);
deepStrictEqual(result1.forecast, TokenType.none);

exampleConf = [
    //
    "[A\\", //     L1
    "", //         L2
].join("\n");
const result2 = tokenizer(exampleConf);
deepStrictEqual(result2.forecast, TokenType.none);
