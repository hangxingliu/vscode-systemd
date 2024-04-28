import { scopes } from "../common/tmLanguage-scopes";
import { RepositoryManager } from "../common/tmLanguage-repo";
import type { TextMateGrammarPatterns, TextMateGrammarPattern } from "../base/tmLanguage-types";

/**
 * @see https://macromates.com/manual/en/language_grammars
 */
export function getMkosiPatterns(_repo: RepositoryManager): TextMateGrammarPatterns {
    const { include, repo } = _repo;

    const ENABLED_JINJA = false;
    const jinjaPattern: TextMateGrammarPattern | undefined = ENABLED_JINJA ? include(repo.embeddedJinja) : undefined;

    return [
        include(repo.comments),
        jinjaPattern,
        include(repo.mkosiSections),
        {
            name: scopes.meta.configEntry,
            begin: /^\s*(@)?([\w\-\.]+)\s*(=)[ \t]*/,
            end: /^(?![ \t]+)/,
            beginCaptures: {
                "1": scopes.prefixChar,
                "2": scopes.entityName.configKey,
                "3": scopes.operator.assignment,
            },
            patterns: [
                include(repo.comments),
                jinjaPattern,
                include(repo.variables),
                include(repo.quotedString),
                include(repo.booleans),
                include(repo.timeSpans),
                include(repo.sizes),
                include(repo.numbers),
            ],
        },
    ];
}
