import { Token, TokenType } from "./types.js";

/**
 * A map that maps token types to type names
 */
export const tokenTypeNames: Readonly<Record<TokenType, string>> = {
    [TokenType.none]: "none",
    [TokenType.comment]: "comment",
    [TokenType.section]: "section",
    [TokenType.directiveKey]: "key",
    [TokenType.directiveValue]: "value",
    [TokenType.assignment]: "assignment",
    [TokenType.unknown]: "unknown",
};

/**
 * Dump a given token to the string for debug purpose
 */
export function dumpToken(token?: Token): string {
    if (!token) return `Undefined`;
    let log = `Token { ${tokenTypeNames[token.type]}; `.padEnd(20);
    const [from, to] = token.range;
    log += `L${from[1] + 1},${from[2] + 1} ~ L${to[1] + 1},${to[2] + 1}; `.padEnd(16);
    log += `text=${JSON.stringify(token.text)}; `;
    log += `}`;
    return log;
}
