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

export type TextMateGrammarPatterns<RepoNames> = Array<TextMateGrammarPattern<RepoNames> | undefined>;
export type IncludeName<RepoNames> = RepoNames extends string
    ? `#${RepoNames}` | "$self" | ScopeName | `${ScopeName}#${string}`
    : never;

/**
 * @see https://macromates.com/manual/en/language_grammars
 */
export type TextMateGrammarConfig<RepoNames extends string> = {
    name: string;
    scopeName: ScopeName;
    patterns: TextMateGrammarPatterns<RepoNames>;
    repository: TextMateGrammarRepository<RepoNames>;

    version?: string;
    uuid?: string;
    fileTypes?: string[];
    firstLineMatch?: OnigurumaRegExp;
    foldingStartMarker?: OnigurumaRegExp;
    foldingStopMarker?: OnigurumaRegExp;
};

export type TextMateGrammarRepository<RepoNames extends string> = {
    [repoNames in RepoNames]: TextMateGrammarPattern<RepoNames>;
};

export type TextMateGrammarCaptures<RepoNames> = Record<
    string,
    | ScopeName
    | {
          name: ScopeName;
          patterns?: TextMateGrammarPattern<RepoNames>;
      }
>;

export type TextMateGrammarPattern<RepoNames> = {
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

    beginCaptures?: TextMateGrammarCaptures<RepoNames>;
    captures?: TextMateGrammarCaptures<RepoNames>;
    endCaptures?: TextMateGrammarCaptures<RepoNames>;

    begin?: OnigurumaRegExp;
    match?: OnigurumaRegExp;
    end?: OnigurumaRegExp;

    patterns?: TextMateGrammarPatterns<RepoNames>;

    include?: IncludeName<RepoNames>;
};
//#endregion main
