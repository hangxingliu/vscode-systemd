import { getForecast } from "./tokenizer-forecast.js";
import { RangeTuple, Token, TokenType, TokenizerOptions, TokenizerResult, TokenizerState } from "./types.js";
import { TextLocationUtils } from "./utils.js";

export const TOKENIZER_INIT_STATE: Readonly<TokenizerState> = {
    //
    passedLeadingBlank: false,
    escapedFor: TokenType.none,
    valueMayNotEnd: 0,
    //
    from: [0, 0, 0],
    type: TokenType.none,
};
function getStateForIncrement(
    prevTokens: ReadonlyArray<Token>,
    confLength: number,
    onlyLastToken: boolean,
    currentTokens: Token[]
): TokenizerState | undefined {
    for (let i = prevTokens.length - 1; i >= 1; i--) {
        const token = prevTokens[i];
        if (token.range[1][0] > confLength) continue;
        if (token.type !== TokenType.directiveKey) continue;

        currentTokens.length = 0;
        if (onlyLastToken) {
            const lastToken = prevTokens[i - 1];
            currentTokens.push(lastToken);
        } else {
            currentTokens.push(...prevTokens.slice(0, i));
        }
        return {
            //
            passedLeadingBlank: false,
            escapedFor: TokenType.none,
            valueMayNotEnd: 0,
            //
            from: token.range[0],
            type: token.type,
        };
    }
}

export function tokenizer(conf: string, _opts?: TokenizerOptions): TokenizerResult {
    let mkosi = false;
    let onlyLastToken = false;

    let tokenHandler: typeof _addToken | typeof _saveLastToken = _addToken;

    let state = { ...TOKENIZER_INIT_STATE };
    let tokens: Token[] = [];

    if (_opts) {
        if (typeof _opts.mkosi === "boolean") mkosi = _opts.mkosi;
        if (_opts.onlyLastToken === true) {
            onlyLastToken = true;
            tokenHandler = _saveLastToken;
        }
        const { prevTokens } = _opts;
        if (prevTokens) {
            const prevState = getStateForIncrement(prevTokens, conf.length, onlyLastToken, tokens);
            if (prevState) state = prevState;
        }
    }

    const location = new TextLocationUtils(state.from);
    while (location.offset < conf.length) {
        const ch = conf[location.offset];

        if (/^\s$/.test(ch)) {
            if (ch === "\n") handleNewLine();
            else handleWhiteSpace(ch);
            continue;
        }
        if (ch === ";" || ch === "#") {
            if (handleCommentSign()) continue;
        }

        state.passedLeadingBlank = true;
        if (state.type === TokenType.comment) {
            location.moveToNext();
            continue;
        }

        if (state.escapedFor) {
            enterToken(state.escapedFor);
            state.escapedFor = TokenType.none;
            location.moveToNext();
            continue;
        }

        if (state.type === TokenType.none) {
            if (ch === "=") {
                state.type = TokenType.assignment;
                enterToken(TokenType.none);
                location.moveToNext();
                continue;
            }
            if (state.valueMayNotEnd >= 2 || state.lastType === TokenType.assignment)
                enterToken(TokenType.directiveValue);
            else if (ch === "[") enterToken(TokenType.section);
            else enterToken(TokenType.directiveKey);
            checkEscapeChar(ch);
            location.moveToNext();

            state.valueMayNotEnd = 0;
            continue;
        }

        if (state.type === TokenType.section) {
            location.moveToNext();
            if (ch === "]") enterToken(TokenType.unknown);
            else checkEscapeChar(ch);
            continue;
        }

        if (state.type === TokenType.directiveKey) {
            if (ch === "=") {
                enterToken(TokenType.assignment);
                location.moveToNext();
                enterToken(TokenType.none);
            } else {
                checkEscapeChar(ch);
                location.moveToNext();
            }
            continue;
        }

        if (state.type === TokenType.directiveValue) {
            checkEscapeChar(ch);
            location.moveToNext();
            continue;
        }

        location.moveToNext();
    }
    enterToken(TokenType.none);
    return { tokens, forecast: getForecast(conf, state, location.get()) };

    function handleNewLine() {
        const currentType = state.type;
        moveToNewLine();
        if (state.escapedFor) return enterToken(state.escapedFor);
        if (mkosi && currentType === TokenType.directiveValue) state.valueMayNotEnd = 1;
    }

    function handleWhiteSpace(ch: string) {
        if (state.passedLeadingBlank) state.escapedFor = TokenType.none;
        else if (state.valueMayNotEnd > 0) state.valueMayNotEnd++;
        location.moveToNext();
    }

    function handleCommentSign() {
        if (state.type !== TokenType.comment) {
            if (!mkosi && state.passedLeadingBlank) {
                location.moveToNext();
                return false;
            }
            state.passedLeadingBlank = false;
        }
        // const typeBeforeComment = state.type;
        enterToken(TokenType.comment);

        const nextIndex = conf.indexOf("\n", location.offset + 1);
        location.move((nextIndex < 0 ? conf.length : nextIndex) - location.offset);
        enterToken(TokenType.none);
        // if (nextIndex >= 0) {
        //     location.moveToNewLine();
        //     enterToken(typeBeforeComment);
        // }
        return true;
    }

    function checkEscapeChar(ch: string) {
        if (ch === "\\") state.escapedFor = state.type;
        else state.escapedFor = TokenType.none;
    }

    function moveToNewLine() {
        enterToken(TokenType.none);
        location.moveToNewLine();
        state.passedLeadingBlank = false;
    }

    function enterToken(type: TokenType) {
        if (state.type === type) return;
        const currentLocation = location.get();
        if (state.type && state.from[0] !== currentLocation[0]) {
            state.lastType = state.type;
            state.lastRange = [state.from, currentLocation];
            tokenHandler(state.lastType, state.lastRange);
        }
        state.type = type;
        state.from = currentLocation;
    }
    function _addToken(type: TokenType, range: RangeTuple) {
        tokens.push({ type, range, text: conf.slice(range[0][0], range[1][0]) });
    }
    function _saveLastToken(type: TokenType, range: RangeTuple) {
        tokens[0] = { type, range, text: conf.slice(range[0][0], range[1][0]) };
    }
}
