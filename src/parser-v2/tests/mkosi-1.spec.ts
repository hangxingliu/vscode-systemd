import { deepStrictEqual } from "assert";
import { tokenizer } from "../tokenizer.js";
import { TokenType } from "../types.js";

let exampleConf = [
    //
    //23456
    "[Host]", //                                         L1
    "@Incremental=yes", //                               L2
    "KernelCommandLineExtra=systemd.crash_shell=yes", // L3
    "                      systemd.log_level=debug", //  L4
].join("\n");

const repeat = (type: TokenType, times: number) => new Array<TokenType>(times).fill(type);
const tokenTypes = [
    // L1
    TokenType.none,
    ...repeat(TokenType.section, "[Host]".length - 1),
    TokenType.unknown,
    // L2
    TokenType.none,
    ...repeat(TokenType.directiveKey, "@Incremental".length),
    ...repeat(TokenType.directiveValue, "yes".length),
    TokenType.directiveValue,
    // L3
    TokenType.none,
    ...repeat(TokenType.directiveKey, "KernelCommandLineExtra".length),
    ...repeat(TokenType.directiveValue, "systemd.crash_shell=yes".length),
    TokenType.directiveValue,
    // L4
    TokenType.none,
    ...repeat(TokenType.directiveValue, "                      systemd.log_level=debug".length),
];

for (let i = 0; i < tokenTypes.length; i++) {
    const tokenType = tokenTypes[i];
    const conf = exampleConf.slice(0, i);
    const result = tokenizer(conf, { mkosi: true });
    deepStrictEqual(
        result.forecast,
        tokenType,
        `exampleConf[${i}].tokenType == ${tokenType} (conf: ${JSON.stringify(conf)})`
    );

    // const result2 = tokenizer(exampleConf, { cursor: i, mkosi: true });
    // deepStrictEqual(result, result2, `exampleConf[${i}]`);
}

const prev = tokenizer(exampleConf, { mkosi: true });
exampleConf += "\n";
{
    const result = tokenizer(exampleConf, { mkosi: true });
    const result2 = tokenizer(exampleConf, { prevTokens: prev.tokens, mkosi: true });
    deepStrictEqual(result.forecast, TokenType.none);
    deepStrictEqual(result, result2);
}

exampleConf += " ";
{
    console.log(JSON.stringify(exampleConf));
    const result = tokenizer(exampleConf, { mkosi: true });
    const result2 = tokenizer(exampleConf, { prevTokens: prev.tokens, mkosi: true });
    deepStrictEqual(result.forecast, TokenType.directiveValue);
    deepStrictEqual(result, result2);
}
