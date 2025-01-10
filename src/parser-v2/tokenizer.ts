import { getForecast } from "./tokenizer-forecast.js";
import { initTokenizerStateIncrementally } from "./tokenizer-state.js";
import { RangeTuple, TokenType, TokenizerOptions, TokenizerResult } from "./types.js";
import { TextLocationUtils } from "./utils.js";

/**
 * Tokenizing systemd/mkosi config. (text => token[])
 * @param conf The text of the system/mkosi config
 */
export function tokenizer(conf: string, _opts?: TokenizerOptions): TokenizerResult {
    const confLength = conf.length;

    /**
     * mkosi configuration mode.
     * Check out {@link TokenizerOptions.mkosi} and the docs in this repo to know the differences
     */
    let mkosi = false;

    /**
     * Keep only the last token, rather than all tokens {@link TokenizerOptions.onlyLastToken}
     */
    let onlyLastToken = false;

    /**
     * The internal token handler for new determined tokens.
     */
    let tokenHandler: typeof _addToken | typeof _saveLastToken = _addToken;

    if (_opts) {
        if (typeof _opts.mkosi === "boolean") mkosi = _opts.mkosi;
        if (_opts.onlyLastToken === true) {
            onlyLastToken = true;
            tokenHandler = _saveLastToken;
        }
    }
    const { state, tokens } = initTokenizerStateIncrementally(_opts?.prevTokens, confLength, onlyLastToken);

    const location = new TextLocationUtils(state.from);
    while (location.offset < conf.length) {
        const ch = conf[location.offset];

        if (/^\s$/.test(ch)) {
            if (ch === "\n") handleNewLine();
            else handleWhiteSpace(ch);
            continue;
        }
        // mkosi only supports the comment started with "#"
        if (ch === "#" || (mkosi === false && ch === ";")) {
            if (handleCommentSign()) continue;
        }

        state.passedLeadingBlank = true;
        /** @todo the following statements maybe removable (adding more tests for a double check)  */
        if (state.type === TokenType.comment) {
            location.moveToNext();
            continue;
        }

        if (state.escapedFor) {
            enterToken(state.escapedFor);
            delete state.escapedFor;
            location.moveToNext();
            continue;
        }

        if (state.type === TokenType.none) {
            const inSameLine = location.inSameLine(state.prevRange?.[1]);
            const isValue = state.valueNotFinished >= 2 || (inSameLine && state.prevType === TokenType.assignment);

            if (isValue) {
                enterToken(TokenType.directiveValue);
                checkEscapeChar(ch, TokenType.directiveValue);
            } else if (ch === "=" && state.prevType !== TokenType.assignment) {
                handleAssignmentOperator();
                continue;
            } else if (ch === "[") {
                enterToken(TokenType.section);
            } else {
                enterToken(TokenType.directiveKey);
                checkEscapeChar(ch, TokenType.directiveKey);
            }

            location.moveToNext();
            state.valueNotFinished = 0;
            continue;
        }

        if (state.type === TokenType.section) {
            location.moveToNext();
            if (ch === "]") enterToken(TokenType.unknown);
            // else checkEscapeChar(ch);
            continue;
        }

        if (state.type === TokenType.directiveKey) {
            if (ch === "=") {
                enterToken(TokenType.assignment);
                handleAssignmentOperator();
                continue;
            }
            checkEscapeChar(ch, TokenType.directiveValue);
            location.moveToNext();
            continue;
        }

        if (state.type === TokenType.directiveValue) {
            checkEscapeChar(ch, TokenType.directiveValue);
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
        if (mkosi) {
            const valueNotFinished =
                (currentType === TokenType.none && state.prevType === TokenType.assignment) ||
                currentType === TokenType.directiveValue;
            if (valueNotFinished) {
                state.valueNotFinished = 1;
            } else if (state.valueNotFinished > 1) {
                // reset the `valueNotFinished` to the correct state. the reason in its jsDoc
                state.valueNotFinished = 1;
            }
        }
    }

    function handleWhiteSpace(ch: string) {
        if (state.passedLeadingBlank) delete state.escapedFor;
        else if (state.valueNotFinished > 0) state.valueNotFinished++;
        location.moveToNext();
    }

    function handleCommentSign() {
        /** @todo the following `if` cond maybe removable (adding more tests for a double check)  */
        if (state.type !== TokenType.comment) {
            if (!mkosi && state.passedLeadingBlank) return false;
            state.passedLeadingBlank = false;
        }
        enterToken(TokenType.comment);

        const nextIndex = conf.indexOf("\n", location.offset + 1);
        location.move((nextIndex < 0 ? conf.length : nextIndex) - location.offset);
        enterToken(TokenType.none);
        return true;
    }

    function checkEscapeChar(ch: string, escapedFor: typeof state.escapedFor) {
        if (mkosi) return;
        if (ch === "\\") state.escapedFor = escapedFor;
        else delete state.escapedFor;
    }

    function moveToNewLine() {
        enterToken(TokenType.none);
        location.moveToNewLine();
        state.passedLeadingBlank = false;
    }

    function handleAssignmentOperator() {
        state.type = TokenType.assignment;
        state.from = location.get();
        location.moveToNext();
        enterToken(TokenType.none);
    }

    function enterToken(type: TokenType) {
        if (state.type === type) return;
        const currentLocation = location.get();
        if (state.type && state.from[0] !== currentLocation[0]) {
            state.prevType = state.type;
            state.prevRange = [state.from, currentLocation];
            tokenHandler(state.prevType, state.prevRange);
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
