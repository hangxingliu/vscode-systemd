// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Token, TokenizerState, TokenType, TokenizerOptions } from "./types.js";

/**
 * The initial state of the tokenizer
 */
const TOKENIZER_INIT_STATE: Readonly<TokenizerState> = {
    //
    passedLeadingBlank: false,
    escapedFor: TokenType.none,
    valueMayNotEnd: 0,
    //
    from: [0, 0, 0],
    type: TokenType.none,
};

/**
 * Initialize state of the tokenizer.
 * Providing the tokens from the previous tokenizing can incrementally initialize the state (can speed up the tokenizing).
 *
 * @param prevTokens Tokens from the previous tokenizing
 * @param confLengh The length of the config that the tokenizer will work on
 * @param onlyLastToken Keep only the last token rather than all tokens. {@link TokenizerOptions.onlyLastToken}
 */
export function initTokenizerStateIncrementally(
    prevTokens: ReadonlyArray<Token> | undefined,
    confLength: number,
    onlyLastToken: boolean
): { tokens: Token[]; state: TokenizerState } {
    if (!prevTokens) return { tokens: [], state: { ...TOKENIZER_INIT_STATE } };

    /**
     * First token index that can be treated as the begining for the tokenizer.
     * Currently, only the directive key is the safe begining point for tokenizing incrementally
     */
    let firstTokenIndex = prevTokens.length - 1;
    for (; firstTokenIndex >= 1; firstTokenIndex--) {
        const token = prevTokens[firstTokenIndex];
        if (token.range[1][0] > confLength) continue;
        if (token.type !== TokenType.directiveKey) continue;
        break;
    }
    if (firstTokenIndex < 1) return { tokens: [], state: { ...TOKENIZER_INIT_STATE } };

    const token = prevTokens[firstTokenIndex];
    const newTokens: Token[] = [];
    if (onlyLastToken) {
        const lastToken = prevTokens[firstTokenIndex - 1];
        newTokens.push(lastToken);
    } else {
        newTokens.push(...prevTokens.slice(0, firstTokenIndex));
    }

    const newState: TokenizerState = {
        passedLeadingBlank: false,
        escapedFor: TokenType.none,
        valueMayNotEnd: 0,
        //
        from: token.range[0],
        type: token.type,
    };
    return {
        tokens: newTokens,
        state: newState,
    };
}
