import { allDeadNames } from "../hint-data/custom-directives";
import { names } from "./const-names";
import { RepositoryNames } from "./repository";
import type { TextMateGrammarPatterns, TextMateGrammarPattern } from "./types";

const ENABLED_JINJA = false;
const jinjaPattern: TextMateGrammarPattern<RepositoryNames> | undefined = ENABLED_JINJA
    ? { include: "#embeddedJinja" }
    : undefined;

/**
 * @see https://macromates.com/manual/en/language_grammars
 *
 * this is an array with the actual rules used to parse the document. In this example there are two rules (line 6-8 and 9-17). Rules will be explained in the next section.
 */
export const syntaxPatterns: TextMateGrammarPatterns<RepositoryNames> = [
    { include: "#commnets" },
    jinjaPattern,
    {
        begin: "^\\s*(" + Array.from(allDeadNames).join("|") + ")\\s*(=)[ \\t]*",
        end: /(?<!\\)\n/,
        beginCaptures: {
            "1": names.deprecated,
            "2": names.operator.assignment,
        },
        patterns: [
            { include: "#commnets" },
            jinjaPattern,
            { include: "#variables" },
            { include: "#quotedString" },
            { include: "#booleans" },
            { include: "#timeSpans" },
            { include: "#sizes" },
            { include: "#numbers" },
        ],
    },
    {
        name: names.meta.configEntry,
        begin: /^\s*(Environment)\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            "1": names.entityName.configKey,
            "2": names.operator.assignment,
        },
        patterns: [
            { include: "#commnets" },
            jinjaPattern,
            {
                match: /(?<=\G|[\s"'])([A-Za-z0-9\_]+)(=)(?=[^\s"'])/,
                captures: {
                    "1": names.parameter,
                    "2": names.operator.assignment,
                },
            },
            { include: "#variables" },
            { include: "#booleans" },
            { include: "#numbers" },
        ],
    },
    {
        name: names.meta.configEntry,
        begin: /^\s*(OnCalendar)\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            "1": names.entityName.configKey,
            "2": names.operator.assignment,
        },
        patterns: [
            { include: "#commnets" },
            jinjaPattern,
            { include: "#variables" },
            { include: "#calendarShorthands" },
            { include: "#numbers" },
        ],
    },
    {
        name: names.meta.configEntry,
        begin: /^\s*(CapabilityBoundingSet|AmbientCapabilities|AddCapability|DropCapability)\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            "1": names.entityName.configKey,
            "2": names.operator.assignment,
        },
        patterns: [{ include: "#commnets" }, jinjaPattern, { include: "#capabilities" }],
    },
    {
        name: names.meta.configEntry,
        begin: /^\s*(Restart)\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            "1": names.entityName.configKey,
            "2": names.operator.assignment,
        },
        patterns: [{ include: "#commnets" }, jinjaPattern, { include: "#variables" }, { include: "#restartOptions" }],
    },
    {
        name: names.meta.configEntry,
        begin: /^\s*(Type)\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            "1": names.entityName.configKey,
            "2": names.operator.assignment,
        },
        patterns: [{ include: "#commnets" }, jinjaPattern, { include: "#variables" }, { include: "#typeOptions" }],
    },
    {
        name: names.meta.configEntry,
        begin: /^\s*(Exec(?:Start(?:Pre|Post)?|Reload|Stop(?:Post)?))\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            "1": names.entityName.configKey,
            "2": names.operator.assignment,
        },
        patterns: [
            { include: "#commnets" },
            jinjaPattern,
            { include: "#executablePrefixes" },
            { include: "#variables" },
            { include: "#quotedString" },
            { include: "#booleans" },
            { include: "#numbers" },
        ],
    },
    {
        name: names.meta.configEntry,
        begin: /^\s*([\w\-\.]+)\s*(=)[ \t]*/,
        end: /(?<!\\)\n/,
        beginCaptures: {
            "1": names.entityName.configKey,
            "2": names.operator.assignment,
        },
        patterns: [
            { include: "#commnets" },
            jinjaPattern,
            { include: "#variables" },
            { include: "#quotedString" },
            { include: "#booleans" },
            { include: "#timeSpans" },
            { include: "#sizes" },
            { include: "#numbers" },
        ],
    },
    { include: "#sections" },
];
