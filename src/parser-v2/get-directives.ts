import { CommonOptions, SystemdDirective, Token, TokenType } from "./types.js";
import { ValueTokenCollector } from "./utils.js";

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

        const collector = new ValueTokenCollector(mkosi);
        for (i++; i < tokens.length; i++) {
            const { type } = tokens[i];
            if (type === TokenType.comment) continue;
            if (type !== TokenType.directiveValue) break;
            collector.addValueToken(tokens[i]);
        }
        directive.value = collector.value;
        directive.valueRanges = collector.ranges;
        i--;
        continue;
    }
    return result;
}
