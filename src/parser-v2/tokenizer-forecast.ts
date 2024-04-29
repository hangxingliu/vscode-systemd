import { LocationTuple, TokenType, TokenizerState } from "./types.js";

export function getForecast(
    conf: string,
    state: TokenizerState,
    currentLocation: LocationTuple,
): TokenType {
    if (state.escapedFor) return state.escapedFor;
    if (state.valueMayNotEnd >= 2) return TokenType.directiveValue;

    // in the same line
    if (state.lastRange && currentLocation[1] === state.lastRange[1][1]) {
        const forecast = state.lastType;
        if (forecast === TokenType.assignment) return TokenType.directiveValue;
        if (forecast === TokenType.section) {
            const lastOffset = state.lastRange[1][0] - 1;
            if (conf[lastOffset] === "]") return TokenType.unknown;
        } else if (forecast === TokenType.directiveKey) {
            const lastOffset = state.lastRange[1][0] - 1;
            if (/^\s$/.test(conf[lastOffset])) return TokenType.assignment;
        }
        return forecast || TokenType.none;
    }
    return TokenType.none;
}
