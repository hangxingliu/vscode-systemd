import { names } from "./match-names";
import { knownSections } from './const'
import type { SyntaxPattern } from "./types";

export const includeRepo = {
    commnets: '#commnets',
    sections: '#sections',
    timeSpans: '#timeSpans',
    numbers: '#numbers',
    booleans: '#booleans',
    restartOptions: '#restartOptions',
    variables: '#variables',
}

/**
 * @see https://macromates.com/manual/en/language_grammars
 *
 * a dictionary (i.e. key/value pairs) of rules which can be included from other places in the grammar. The key is the name of the rule and the value is the actual rule. Further explanation (and example) follow with the description of the include rule key.
 */
export const syntaxRepository: {
    [x in keyof typeof includeRepo]: { patterns: SyntaxPattern[] }
} = {
    commnets: {
        patterns: [{
            match: /^\s*[#;].*\n/,
            name: names.comment,
        }],
    },
    sections: {
        patterns: [{
            match: "^\\s*\\[(" + knownSections.join('|') + ")\\]",
            name: names.entityName.section,
        }, {
            match: /\s*\[[\w-]+\]/,
            name: names.entityName.unknownSection,
        }],
    },
    /**
     * @see https://www.freedesktop.org/software/systemd/man/systemd.time.html
     */
    timeSpans: {
        patterns: [{
            match: /\b(?:\d+(?:us(?:ec)?|ms(?:ec)?|s(?:ec|econds?)?|m(?:in|inutes?)?|h(?:r|ours?)?|d(?:ays?)?|w(?:eeks)?|M|months?|y(?:ears?)?)){1,}\b/,
            name: names.numeric,
        }]
    },
    numbers: {
        patterns: [{
            match: /\b\d+\b/,
            name: names.numeric,
        }]
    },
    booleans: {
        patterns: [{
            match: /\b(?<![-\/\.])(true|false|on|off|yes|no)(?![-\/\.])\b/,
            name: names.boolean,
        }],
    },
    restartOptions: {
        patterns: [{
            match: /\b(?<![-\/\.])(no|always|on\-(?:success|failure|abnormal|abort|watchdog))(?![-\/\.])\b/,
            name: names.languageConstant,
        }],
    },
    variables: {
        patterns: [
            {
                match: /(\$)([A-Za-z0-9\_]+)\b/,
                captures: {
                    '1': names.$,
                    '2': names.variable,
                },
            },
            {
                match: /(\$\{)([A-Za-z0-9\_]+)(\})/,
                captures: {
                    '1': names.$,
                    '2': names.variable,
                    '3': names.$,
                },
            },
            {
                match: /%[aAbBCEfgGhHiIjJlLmMnNopPsStTuUvVwW%]\b/,
                name: names.specifier
            }
        ]
    },
}
