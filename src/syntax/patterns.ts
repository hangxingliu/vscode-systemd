import { deprecatedDirectives } from "./const";
import { names } from "./match-names";
import { includeRepo } from "./repository";
import type { SyntaxPattern } from "./types";

/**
 * @see https://macromates.com/manual/en/language_grammars
 *
 * this is an array with the actual rules used to parse the document. In this example there are two rules (line 6-8 and 9-17). Rules will be explained in the next section.
 */
export const syntaxPatterns: Array<SyntaxPattern | SyntaxPattern[]> = [
    { include: includeRepo.commnets },
	{
        begin: '^\\s*(' + deprecatedDirectives.join('|') + ')\\s*(=)[ \\t]*',
        end: /(?<!\\)\n/,
        beginCaptures: {
            '1': 'invalid.deprecated',
        },
        patterns: [
            { include: includeRepo.commnets },
            { include: includeRepo.variables },
            { include: includeRepo.quotedString },
            { include: includeRepo.booleans },
            { include: includeRepo.restartOptions },
            { include: includeRepo.timeSpans },
            { include: includeRepo.numbers },
        ]
	},
    {
        name: names.meta.configEntry,
        begin: /^\s*(Environment)\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            '1': names.entityName.configKey,
            '2': names.operator.assignment,
        },
        patterns: [
            { include: includeRepo.commnets },
            {
                match: /(?<=\G|[\s"'])([A-Za-z0-9\_]+)(=)(?=[^\s"'])/,
                captures: {
                    '1': names.parameter,
                    '2': names.operator.assignment,
                },
            },
            { include: includeRepo.variables },
            { include: includeRepo.booleans },
            { include: includeRepo.restartOptions },
            { include: includeRepo.timeSpans },
            { include: includeRepo.numbers },
        ]
    },
    {
        name: names.meta.configEntry,
        begin: /^\s*([\w\-\.]+)\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            '1': names.entityName.configKey,
            '2': names.operator.assignment,
        },
        patterns: [
            { include: includeRepo.commnets },
            { include: includeRepo.variables },
            { include: includeRepo.quotedString },
            { include: includeRepo.booleans },
            { include: includeRepo.restartOptions },
            { include: includeRepo.timeSpans },
            { include: includeRepo.numbers },
        ]
    },
    { include: includeRepo.sections },
];
