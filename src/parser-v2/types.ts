/**
 * A configuration location tuple that includes
 * [0]: the offset;
 * [1]: the zero-based line number;
 * [2]: the zero-based inline offset;
 */
export type LocationTuple = Readonly<[offset: number, line: number, character: number]>;

/**
 * A half-open interval, represented as `[from, to)`,
 * is used to denote a range in the configuration.
 */
export type RangeTuple = Readonly<[LocationTuple, LocationTuple]>;

export const enum TokenType {
    none = 0,
    comment = 1,
    section = 2,
    directiveKey = 3,
    directiveValue = 4,
    assignment = 5,
    unknown = 9,
}

export type Token = {
    type: TokenType;
    range: RangeTuple;
    text?: string;
};

export type CommonOptions = {
    /**
     * Enable `mkosi` syntax.
     * The syntax for multi-line values and comments in `mkosi` configurations differs
     * from that in `systemd` configurations.
     *
     * Please check out the function `parse_ini` in the following link for the details:
     * @see https://github.com/systemd/mkosi/blob/23b17713f4446ca5a9c78eb3e7c99e17afaff408/mkosi/config.py#L2114
     */
    mkosi?: boolean;
};

export type TokenizerState = {
    /** Indicates if the tokenizer has moved past the leading whitespace of a line */
    passedLeadingBlank?: boolean;

    /**
     * This state indicates that the type of next non-comment and non-whitespace character,
     * which is connected by the escape character `\`.
     *
     * This state is useful for resolving the type of multi-line values
     */
    escapedFor?: TokenType.none | TokenType.directiveValue | TokenType.directiveKey;

    /**
     * This state is designed for `mkosi` configuration.
     * Because the syntax for multi-line values in `mkosi` uses leading whitespaces on the lines
     * following the first line. The tokenizer cannot immediately determine if the value has ended
     * when it encounters the character `\n`.
     *
     * 0: the last value has ended;
     * 1: maybe end;
     * 2: the last value has not ended yet.
     */
    valueMayNotEnd: number;

    lastType?: TokenType;
    lastRange?: RangeTuple;

    /** The type of current(pending) token */
    type: TokenType;
    /** The beginning location of current token */
    from: LocationTuple;
};

export type TokenizerResult = {
    tokens: Token[];
    forecast: TokenType;
};

export type TokenizerOptions = CommonOptions & {
    /**
     * Provide previous tokenizer result to tokenize incrementally
     */
    prevTokens?: Array<Token>;

    /**
     * Keep only the last token, rather than all tokens
     */
    onlyLastToken?: boolean;
};

/**
 * A descriptor object for systemd directive.
 * It would be created from the token list by the function `getDirectivesFromTokens`
 */
export type SystemdDirective = {
    /** @example "[Unit]" */
    section?: string;

    /** @example "After" */
    key: string;
    keyRange: RangeTuple;

    /**
     * `undefined` indicates that this directive is not complete, and no `=`
     * @example "network.target"
     */
    value?: string;
    valueRanges: RangeTuple[];
};

/** This type is the subset of the `vscode.FoldingRangeKind` */
export type FoldingRangeKind = "Comment" | "Region";
export type FoldingRange = [fromLine: number, toLine: number, kind?: FoldingRangeKind];
