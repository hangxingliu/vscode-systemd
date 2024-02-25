import { names } from "./const-names";
import { allSections } from "./const-sections";
import type { TextMateGrammarPattern, TextMateGrammarPatterns, TextMateGrammarRepository } from "./types";
import { capabilityNamesRegExp } from "./const-capabilities";
import { getOrderedSectionNames } from "./sections-utils";

export type RepositoryNames =
    | "commnets"
    | "sections"
    | "timeSpans"
    | "calendarShorthands"
    | "capabilities"
    | "numbers"
    | "sizes"
    | "booleans"
    | "restartOptions"
    | "typeOptions"
    | "variables"
    | "quotedString"
    | "embeddedJinja"
    | "executablePrefixes";

export function getQuotedStringPatterns(patterns?: TextMateGrammarPatterns<RepositoryNames>) {
    const subPatterns: TextMateGrammarPattern<RepositoryNames>[] = [
        {
            match: /\\(?:[abfnrtvs\\"'\n]|x[0-9A-Fa-f]{2}|[0-8]{3}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            name: names.string.escape,
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
    const result: TextMateGrammarPattern<RepositoryNames>[] = [
        {
            begin: /(?<=\G|\s)'/,
            end: /['\n]/,
            name: names.string.singleQuoted,
            patterns: subPatterns,
        },
        {
            begin: /(?<=\G|\s)"/,
            end: /["\n]/,
            name: names.string.doubleQuoted,
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
export const syntaxRepository: TextMateGrammarRepository<RepositoryNames> = {
    commnets: {
        patterns: [
            {
                match: /^\s*[#;].*\n/,
                name: names.comment,
            },
        ],
    },
    sections: {
        patterns: [
            {
                match: "^\\s*\\[(" + getOrderedSectionNames(allSections).join("|") + ")\\]",
                name: names.entityName.section,
            },
            {
                match: /\s*\[[\w-]+\]/,
                name: names.entityName.unknownSection,
            },
        ],
    },
    executablePrefixes: {
        patterns: [
            {
                // "@", "-", ":", and one of "+"/"!"/"!!" may be used together and they can appear in any order. However, only one of "+", "!", "!!" may be used at a time.
                match: "\\G([@\\-\\:]+(?:\\+|\\!\\!?)?|(?:\\+|\\!\\!?)[@\\-\\:]*)",
                name: names.prefixChar,
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
                name: names.numeric,
            },
        ],
    },
    calendarShorthands: {
        patterns: [
            {
                match: /\b(?:minute|hour|dai|month|week|quarter|semiannual)ly\b/,
                name: names.languageConstant,
            },
        ],
    },
    capabilities: {
        patterns: [
            {
                match: "\\b(?:" + capabilityNamesRegExp + ")\\b",
                name: names.otherConstant,
            },
        ],
    },
    numbers: {
        patterns: [
            {
                match: /(?<=\s|=)\d+(?:\.\d+)?(?=\s|$)/,
                name: names.numeric,
            },
        ],
    },
    sizes: {
        patterns: [
            {
                match: /(?<=\s|=)\d+(?:\.\d+)?[KMGT](?=\s|$)/,
                name: names.numeric,
            },
            {
                match: /(?<==)infinity(?=\s|$)/,
                name: names.numeric,
            },
        ],
    },
    quotedString: { patterns: getQuotedStringPatterns() },
    booleans: {
        patterns: [
            {
                match: /\b(?<![-\/\.])(true|false|on|off|yes|no)(?![-\/\.])\b/,
                name: names.boolean,
            },
        ],
    },
    restartOptions: {
        patterns: [
            {
                match: /\b(no|always|on\-(?:success|failure|abnormal|abort|watchdog))\b/,
                name: names.languageConstant,
            },
        ],
    },
    typeOptions: {
        patterns: [
            {
                match: /\b(?:simple|exec|forking|oneshot|dbus|notify(?:-reload)?|idle|unicast|local|broadcast|anycast|multicast|blackhole|unreachable|prohibit|throw|nat|xresolve|blackhole|unreachable|prohibit|ad-hoc|station|ap(?:-vlan)?|wds|monitor|mesh-point|p2p-(?:client|go|device)|ocb|nan)\b/,
                name: names.languageConstant,
            },
        ],
    },
    variables: {
        patterns: [
            {
                match: /(\$)([A-Za-z0-9\_]+)\b/,
                captures: {
                    "1": names.$,
                    "2": names.variable,
                },
            },
            {
                match: /(\$\{)([A-Za-z0-9\_]+)(\})/,
                captures: {
                    "1": names.$,
                    "2": names.variable,
                    "3": names.$,
                },
            },
            {
                match: /%%/,
                name: names.specifier,
            },
            {
                match: /%[aAbBCEfgGhHiIjJlLmMnNopPsStTuUvVwW]\b/,
                name: names.specifier,
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
                name: names.jinja.raw,
                patterns: [{ include: "source.systemd" }],
            },
            {
                // can't add group in the following regexp
                begin: /\{\{\-?/,
                end: /-?\}\}/,
                name: names.jinja.variable,
                patterns: [{ include: names.jinja.expression }],
            },
            {
                begin: /\{%\-?/,
                end: /-?%\}/,
                name: names.jinja.tag,
                patterns: [{ include: names.jinja.expression }],
            },
            { include: names.jinja.comments },
        ],
    },
};
