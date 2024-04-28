import { allDeadNames } from "../../hint-data/custom-directives";
import { scopes } from "../common/tmLanguage-scopes";
import { RepositoryManager } from "../common/tmLanguage-repo";
import type { TextMateGrammarPatterns, TextMateGrammarPattern } from "../base/tmLanguage-types";

/**
 * @see https://macromates.com/manual/en/language_grammars
 */
export function getSystemdPatterns(_repo: RepositoryManager): TextMateGrammarPatterns {
    const { include, repo } = _repo;

    const ENABLED_JINJA = false;
    const jinjaPattern: TextMateGrammarPattern | undefined = ENABLED_JINJA ? include(repo.embeddedJinja) : undefined;

    return [
        include(repo.comments),
        jinjaPattern,
        {
            begin: "^\\s*(" + Array.from(allDeadNames).join("|") + ")\\s*(=)[ \\t]*",
            end: /(?<!\\)\n/,
            beginCaptures: {
                "1": scopes.deprecated,
                "2": scopes.operator.assignment,
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
        {
            name: scopes.meta.configEntry,
            begin: /^\s*(Environment)\s*(=)[ \t]*/,
            end: /(?<!\\)\n/,
            beginCaptures: {
                "1": scopes.entityName.configKey,
                "2": scopes.operator.assignment,
            },
            patterns: [
                include(repo.comments),
                jinjaPattern,
                {
                    match: /(?<=\G|[\s"'])([A-Za-z0-9\_]+)(=)(?=[^\s"'])/,
                    captures: {
                        "1": scopes.parameter,
                        "2": scopes.operator.assignment,
                    },
                },
                include(repo.variables),
                include(repo.booleans),
                include(repo.numbers),
            ],
        },
        {
            name: scopes.meta.configEntry,
            begin: /^\s*(OnCalendar)\s*(=)[ \t]*/,
            end: /(?<!\\)\n/,
            beginCaptures: {
                "1": scopes.entityName.configKey,
                "2": scopes.operator.assignment,
            },
            patterns: [
                include(repo.comments),
                jinjaPattern,
                include(repo.variables),
                include(repo.calendarShorthands),
                include(repo.numbers),
            ],
        },
        {
            name: scopes.meta.configEntry,
            begin: /^\s*(CapabilityBoundingSet|AmbientCapabilities|AddCapability|DropCapability)\s*(=)[ \t]*/,
            end: /(?<!\\)\n/,
            beginCaptures: {
                "1": scopes.entityName.configKey,
                "2": scopes.operator.assignment,
            },
            patterns: [include(repo.comments), jinjaPattern, include(repo.capabilities)],
        },
        {
            name: scopes.meta.configEntry,
            begin: /^\s*(Restart)\s*(=)[ \t]*/,
            end: /(?<!\\)\n/,
            beginCaptures: {
                "1": scopes.entityName.configKey,
                "2": scopes.operator.assignment,
            },
            patterns: [include(repo.comments), jinjaPattern, include(repo.variables), include(repo.restartOptions)],
        },
        {
            name: scopes.meta.configEntry,
            begin: /^\s*(Type)\s*(=)[ \t]*/,
            end: /(?<!\\)\n/,
            beginCaptures: {
                "1": scopes.entityName.configKey,
                "2": scopes.operator.assignment,
            },
            patterns: [include(repo.comments), jinjaPattern, include(repo.variables), include(repo.typeOptions)],
        },
        {
            name: scopes.meta.configEntry,
            begin: /^\s*(Exec(?:Start(?:Pre|Post)?|Reload|Stop(?:Post)?))\s*(=)[ \t]*/,
            end: /(?<!\\)\n/,
            beginCaptures: {
                "1": scopes.entityName.configKey,
                "2": scopes.operator.assignment,
            },
            patterns: [
                include(repo.comments),
                jinjaPattern,
                include(repo.executablePrefixes),
                include(repo.variables),
                include(repo.quotedString),
                include(repo.booleans),
                include(repo.numbers),
            ],
        },
        {
            name: scopes.meta.configEntry,
            begin: /^\s*([\w\-\.]+)\s*(=)[ \t]*/,
            end: /(?<!\\)\n/,
            beginCaptures: {
                "1": scopes.entityName.configKey,
                "2": scopes.operator.assignment,
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
        include(repo.sections),
    ];
}
