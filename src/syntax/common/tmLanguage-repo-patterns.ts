import { scopes } from "./tmLanguage-scopes";
import { allMkosiSections, allSections } from "./section-names";
import type { TextMateGrammarPattern, TextMateGrammarPatterns } from "../base/tmLanguage-types";
import { capabilityNamesRegExp } from "./capabilities";
import { getOrderedSectionNames } from "../base/utils-sections";

export function getQuotedStringPatterns(patterns?: TextMateGrammarPatterns) {
    const subPatterns: TextMateGrammarPattern[] = [
        {
            match: /\\(?:[abfnrtvs\\"'\n]|x[0-9A-Fa-f]{2}|[0-8]{3}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            name: scopes.string.escape,
        },
    ];
    if (patterns && patterns.length > 0) {
        for (const pattern of patterns) if (pattern) subPatterns.push(pattern);
    }
    /**
     * the following general rules apply: double quotes ("…") and single quotes ('…') may be used to wrap a whole item
     * 1. the opening quote may appear only at the beginning or after whitespace that is not quoted
     * 2. and the closing quote must be followed by whitespace or the end of line
     */
    const result: TextMateGrammarPattern[] = [
        {
            begin: /(?<=\G|\s)'/,
            end: /['\n]/,
            name: scopes.string.singleQuoted,
            patterns: subPatterns,
        },
        {
            begin: /(?<=\G|\s)"/,
            end: /["\n]/,
            name: scopes.string.doubleQuoted,
            patterns: subPatterns,
        },
    ];
    return result;
}

/**
 * @see https://macromates.com/manual/en/language_grammars
 *
 * a dictionary (i.e. key/value pairs) of rules which can be included from other places in the grammar. The key is the name of the rule and the value is the actual rule. Further explanation (and example) follow with the description of the include rule key.
 */
export const allRepositories = {
    comments: {
        patterns: [
            {
                match: /^\s*[#;].*\n/,
                name: scopes.comment,
            },
        ],
    },
    mkosiComments: {
        patterns: [
            {
                match: /#.*\n/,
                name: scopes.comment,
            },
        ],
    },
    sections: {
        patterns: [
            {
                match: "^\\s*\\[(" + getOrderedSectionNames(allSections).join("|") + ")\\]",
                name: scopes.entityName.section,
            },
            {
                match: /\s*\[[\w-]+\]/,
                name: scopes.entityName.unknownSection,
            },
        ],
    },
    mkosiSections: {
        patterns: [
            {
                match: "^\\s*\\[(" + getOrderedSectionNames(allMkosiSections).join("|") + ")\\]",
                name: scopes.entityName.section,
            },
            {
                match: /\s*\[[\w-]+\]/,
                name: scopes.entityName.unknownSection,
            },
        ],
    },
    executablePrefixes: {
        patterns: [
            {
                // "@", "-", ":", and one of "+"/"!"/"!!" may be used together and they can appear in any order. However, only one of "+", "!", "!!" may be used at a time.
                match: "\\G([@\\-\\:]+(?:\\+|\\!\\!?)?|(?:\\+|\\!\\!?)[@\\-\\:]*)",
                name: scopes.prefixChar,
            },
        ],
    },
    /**
     * @see https://www.freedesktop.org/software/systemd/man/systemd.time.html
     */
    timeSpans: {
        patterns: [
            {
                match: /\b(?:\d+(?:[uμ]s(?:ec)?|ms(?:ec)?|s(?:ec|econds?)?|m(?:in|inutes?)?|h(?:r|ours?)?|d(?:ays?)?|w(?:eeks)?|M|months?|y(?:ears?)?)){1,}\b/,
                name: scopes.numeric,
            },
        ],
    },
    calendarShorthands: {
        patterns: [
            {
                match: /\b(?:minute|hour|dai|month|week|quarter|semiannual)ly\b/,
                name: scopes.languageConstant,
            },
        ],
    },
    capabilities: {
        patterns: [
            {
                match: "\\b(?:" + capabilityNamesRegExp + ")\\b",
                name: scopes.otherConstant,
            },
        ],
    },
    numbers: {
        patterns: [
            {
                match: /(?<=\s|=)\d+(?:\.\d+)?(?=[\s:]|$)/,
                name: scopes.numeric,
            },
        ],
    },
    sizes: {
        patterns: [
            {
                match: /(?<=\s|=)\d+(?:\.\d+)?[KMGT](?=[\s:]|$)/,
                name: scopes.numeric,
            },
            {
                match: /(?<==)infinity(?=[\s:]|$)/,
                name: scopes.numeric,
            },
        ],
    },
    quotedString: { patterns: getQuotedStringPatterns() },
    booleans: {
        patterns: [
            {
                match: /\b(?<![-\/\.])(true|false|on|off|yes|no)(?![-\/\.])\b/,
                name: scopes.boolean,
            },
        ],
    },
    restartOptions: {
        patterns: [
            {
                match: /\b(no|always|on\-(?:success|failure|abnormal|abort|watchdog))\b/,
                name: scopes.languageConstant,
            },
        ],
    },
    typeOptions: {
        patterns: [
            {
                match: /\b(?:simple|exec|forking|oneshot|dbus|notify(?:-reload)?|idle|unicast|local|broadcast|anycast|multicast|blackhole|unreachable|prohibit|throw|nat|xresolve|blackhole|unreachable|prohibit|ad-hoc|station|ap(?:-vlan)?|wds|monitor|mesh-point|p2p-(?:client|go|device)|ocb|nan)\b/,
                name: scopes.languageConstant,
            },
        ],
    },
    variables: {
        patterns: [
            {
                match: /(\$)([A-Za-z0-9\_]+)\b/,
                captures: {
                    "1": scopes.$,
                    "2": scopes.variable,
                },
            },
            {
                match: /(\$\{)([A-Za-z0-9\_]+)(\})/,
                captures: {
                    "1": scopes.$,
                    "2": scopes.variable,
                    "3": scopes.$,
                },
            },
            {
                match: /%%/,
                name: scopes.specifier,
            },
            {
                match: /%[aAbBCEfgGhHiIjJlLmMnNopPsStTuUvVwW]\b/,
                name: scopes.specifier,
            },
        ],
    },
    embeddedJinja: {
        patterns: [
            {
                begin: /({\%)\s*(raw)\s*(%\})/,
                captures: {
                    "1": {
                        name: "entity.other.jinja.delimiter.tag",
                    },
                    "2": {
                        name: "keyword.control.jinja",
                    },
                    "3": {
                        name: "entity.other.jinja.delimiter.tag",
                    },
                },
                end: /(\{%)\s*(endraw)\s*(%\})/,
                name: scopes.jinja.raw,
                patterns: [{ include: "source.systemd" }],
            },
            {
                // can't add group in the following regexp
                begin: /\{\{\-?/,
                end: /-?\}\}/,
                name: scopes.jinja.variable,
                patterns: [{ include: scopes.jinja.expression }],
            },
            {
                begin: /\{%\-?/,
                end: /-?%\}/,
                name: scopes.jinja.tag,
                patterns: [{ include: scopes.jinja.expression }],
            },
            { include: scopes.jinja.comments },
        ],
    },
} satisfies Record<string, TextMateGrammarPattern>;
