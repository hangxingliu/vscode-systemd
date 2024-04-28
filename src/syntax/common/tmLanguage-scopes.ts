/**
 * <https://macromates.com/manual/en/language_grammars#naming_conventions>
 * <https://www.sublimetext.com/docs/scope_naming.html>
 */
export const scopes = {
    entityName: {
        section: "entity.name.section",
        unknownSection: "entity.name.unknown-section",
        configKey: "entity.name.tag",
        unknownConfigKey: "entity.name.unknown-tag",
    },
    meta: {
        configEntry: `meta.config-entry.systemd`,
    },
    comment: "comment.line.number-sign",

    languageConstant: "constant.language",
    otherConstant: "constant.other.systemd",
    boolean: "constant.language",
    numeric: "constant.numeric",
    string: {
        singleQuoted: "string.quoted.single",
        doubleQuoted: "string.quoted.double",
        escape: "constant.character.escape",
    },
    specifier: "constant.other.placeholder",
    variable: "variable.other",
    parameter: "variable.parameter",

    operator: {
        assignment: "keyword.operator.assignment",
    },
    /**
     * Symbols that are part of the variable name,
     * should additionally be applied the following scope.
     * For example, the `$` in PHP and Shell.
     */
    $: "punctuation.definition.variable.systemd",
    prefixChar: "keyword.operator.prefix.systemd",
    invalid: "invalid.illegal",
    deprecated: "invalid.deprecated",

    //#region jinja
    // https://github.com/samuelcolvin/jinjahtml-vscode/blob/main/syntaxes/jinja.tmLanguage.json
    // https://github.com/wholroyd/vscode-jinja/blob/master/syntaxes/jinja.json
    jinja: {
        source: "source.jinja",
        expression: "source.jinja#expression",
        comments: "source.jinja#comments",
        variable: "variable.meta.scope.jinja",
        tag: "meta.scope.jinja.tag",
        raw: "meta.scope.jinja.raw",
    },
    //#endregion jinja
} as const;
