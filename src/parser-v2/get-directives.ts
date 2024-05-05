import { CommonOptions, SystemdDirective, Token, TokenType } from "./types.js";

export function getDirectivesFromTokens(tokens: Token[], options?: CommonOptions) {
    const mkosi = options && options.mkosi ? true : false;
    const result: SystemdDirective[] = [];

    let section: string | undefined;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === TokenType.section) {
            section = token.text;
            continue;
        }
        if (token.type !== TokenType.directiveKey) continue;

        const key = (token.text || "").trim();
        const directive: SystemdDirective = {
            section,
            key,
            keyRange: token.range,
            valueRanges: [],
        };
        result.push(directive);

        if (++i >= tokens.length) break;
        if (tokens[i].type !== TokenType.assignment) continue;
        directive.value = "";

        let started = false;
        for (i++; i < tokens.length; i++) {
            const { type, text, range } = tokens[i];
            if (type === TokenType.comment) continue;
            if (type !== TokenType.directiveValue) break;
            directive.valueRanges.push(range);
            if (mkosi) {
                directive.value += (started ? "\n" : "") + (text || "").replace(/^\s+/, "");
            } else if (!started) {
                directive.value = text || "";
            } else if (text && !/^\s*$/.test(text)) {
                directive.value = directive.value!.replace(/\\$/, "") + text;
            }
            started = true;
        }
        i--;
        continue;
    }
    return result;
}
