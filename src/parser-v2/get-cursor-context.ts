import { tokenizer } from "./tokenizer.js";
import { CommonOptions, LocationTuple, RangeTuple, Token, TokenType } from "./types.js";
import { ValueTokenCollector } from "./utils.js";

export type CursorContextInfo = {
    complete: TokenType;
    /**
     * If the token at the cursor is not one of the "comment", "unknown" or "assignment"
     * and not yet compelete, this field indicates the starting location of this token.
     */
    from?: LocationTuple;
    section?: {
        name: string;
        range: RangeTuple;
    };
    key?: {
        name: string;
        range: RangeTuple;
    };
    value?: {
        value: string;
        ranges: RangeTuple[];
    };
};

export class SystemdCursorContext {
    /** A shortcut to `new SystemdCursorContext(...).get(conf.length)`  */
    static get(conf: string, options?: CommonOptions) {
        return new SystemdCursorContext(conf, options || {}).getContext(conf.length);
    }

    constructor(private readonly conf: string, private readonly options: CommonOptions) {}

    // A possible optimization:
    // onDidChangeConf() {
    // }

    /**
     * An optimization for tokenizer (providing `prevTokens` for speeding up tokenizing)
     * @see {prevTokens}
     */
    private prevOffset = -1;
    /**
     * An optimization for tokenizer (providing `prevTokens` for speeding up tokenizing)
     * @see {prevOffset}
     */
    private readonly prevTokens: Token[] = [];

    /**
     * Get the context information at the cursor position
     */
    getContext(cursorOffset: number): CursorContextInfo {
        const fullConf = this.conf;
        const conf = fullConf.slice(0, cursorOffset);
        const confAfterCursor = fullConf.slice(cursorOffset);

        const { tokens, forecast } = tokenizer(conf, {
            ...this.options,
            prevTokens: this.prevTokens,
        });

        // Update the cache for optimizing the next tokenizing
        if (cursorOffset >= this.prevOffset) {
            this.prevOffset = cursorOffset;
            this.prevTokens.length = 0;
            this.prevTokens.push(...tokens);
        }

        let lookupSection = false;
        let lookupKey = false;
        const result: CursorContextInfo = { complete: forecast };
        switch (forecast) {
            case TokenType.unknown:
            case TokenType.comment:
                return result;

            case TokenType.section:
                result.complete = TokenType.section;
                break;

            case TokenType.none:
                if (confAfterCursor[0] === "[") {
                    result.complete = TokenType.unknown;
                    return result;
                }
            // eslint-disable-next-line no-fallthrough
            case TokenType.directiveKey:
                lookupSection = true;
                result.complete = TokenType.directiveKey;
                break;

            case TokenType.assignment:
            case TokenType.directiveValue:
                lookupSection = true;
                lookupKey = true;
                result.complete = forecast === TokenType.assignment ? TokenType.assignment : TokenType.directiveValue;
                break;
        }

        let tokenIndex = tokens.length - 1;
        const valueTokens: Token[] = [];

        // resolve the `from` field of the result
        if (tokenIndex >= 0) {
            const lastToken = tokens[tokenIndex];
            if (lastToken.type === forecast) result.from = lastToken.range[0];
        }

        // resolve the section info and the directive key info if needed
        for (; (lookupKey || lookupSection) && tokenIndex >= 0; tokenIndex--) {
            const token = tokens[tokenIndex];
            if (token.type === TokenType.section) {
                if (lookupSection) {
                    result.section = { name: token.text || "", range: token.range };
                    break;
                }
                continue;
            }
            if (token.type === TokenType.directiveKey) {
                if (lookupKey) {
                    result.key = { name: token.text || "", range: token.range };
                    lookupKey = false;
                    if (!lookupSection) break;
                }
                continue;
            }
            if (token.type === TokenType.directiveValue && lookupKey) valueTokens.unshift(token);
        }

        if (result.complete === TokenType.directiveValue) {
            const collector = new ValueTokenCollector(this.options.mkosi || false);
            for (const token of valueTokens) collector.addValueToken(token);
            result.value = {
                value: collector.value,
                ranges: collector.ranges,
            };
        }

        //
        return result;
    }
}
