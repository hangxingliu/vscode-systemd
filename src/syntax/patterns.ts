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
        name: names.meta.configEntry,
        begin: /^\s*([\w\-\.]+)\s*(?==)/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            '1': names.entityName.configKey,
        },
        patterns: [
            { include: includeRepo.commnets },
            { include: includeRepo.variables },
            { include: includeRepo.booleans },
            { include: includeRepo.restartOptions },
            { include: includeRepo.timeSpans },
            { include: includeRepo.numbers },
        ]
    },
    { include: includeRepo.sections },
];
