import { LocationTuple, TokenType, TokenizerState } from "./types.js";

/**
 * A internal function for the `tokenizer` to predict the token type at the given location
 * @returns The expected token type at the given location. {@link TokenType.none} represents any type of token
 */
export function getForecast(conf: string, state: TokenizerState, currentLocation: LocationTuple): TokenType {
    const [, currentLine] = currentLocation;
    // in the same line
    if (state.lastRange && currentLine === state.lastRange[1][1]) {
        const { lastType } = state;
        if (lastType === TokenType.comment) return TokenType.comment;
        if (lastType === TokenType.assignment || lastType === TokenType.directiveValue) return TokenType.directiveValue;

        if (lastType === TokenType.section) {
            const lastOffset = state.lastRange[1][0] - 1;
            if (conf[lastOffset] === "]") return TokenType.unknown;
            return TokenType.section;
        }
        if (lastType === TokenType.directiveKey) {
            const lastOffset = state.lastRange[1][0] - 1;
            if (/^\s$/.test(conf[lastOffset])) return TokenType.assignment;
            return TokenType.directiveKey;
        }

        return TokenType.unknown;
    }

    if (state.escapedFor) return state.escapedFor;
    if (state.valueMayNotEnd >= 2) return TokenType.directiveValue;
    return TokenType.none;
}
