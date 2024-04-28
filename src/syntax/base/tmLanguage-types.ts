//#region main
// template: vscode-syntax-types.ts
// author:   hangxingliu
// license:  MIT
// version:  2024-02-24
type ScopeNameRoot =
    | "text"
    | "source"
    | "entity"
    | "meta"
    | "comment"
    | "constant"
    | "string"
    | "variable"
    | "keyword"
    | "punctuation"
    | "invalid"
    | "markup"
    | "support"
    | "storage";
type ScopeName = `${ScopeNameRoot}.${string}`;
type OnigurumaRegExp = RegExp | string;

export type TextMateGrammarPatterns = Array<TextMateGrammarPattern | undefined>;
export type IncludeName = `#${string}` | "$self" | ScopeName | `${ScopeName}#${string}`;

/**
 * @see https://macromates.com/manual/en/language_grammars
 */
export type TextMateGrammarConfig = {
    name: string;
    scopeName: ScopeName;
    patterns: TextMateGrammarPatterns;
    repository: Record<string, TextMateGrammarPattern>;

    version?: string;
    uuid?: string;
    fileTypes?: string[];
    firstLineMatch?: OnigurumaRegExp;
    foldingStartMarker?: OnigurumaRegExp;
    foldingStopMarker?: OnigurumaRegExp;
};

export type TextMateGrammarCaptures = Record<
    string,
    | ScopeName
    | {
          name: ScopeName;
          patterns?: TextMateGrammarPattern;
      }
>;

export type TextMateGrammarPattern = {
    /**
     * the name which gets assigned to the portion matched.
     * This is used for styling and scope-specific settings and actions,
     * which means it should generally be derived from one of the standard names
     */
    name?: ScopeName;
    /**
     * this key is similar to the name key but only assigns the name to the text between
     * what is matched by the begin/end patterns.
     */
    contentName?: ScopeName;
    comment?: string;

    beginCaptures?: TextMateGrammarCaptures;
    captures?: TextMateGrammarCaptures;
    endCaptures?: TextMateGrammarCaptures;

    begin?: OnigurumaRegExp;
    match?: OnigurumaRegExp;
    end?: OnigurumaRegExp;

    patterns?: TextMateGrammarPatterns;

    include?: IncludeName;
};
//#endregion main
