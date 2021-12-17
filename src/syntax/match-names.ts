/**
 * <https://macromates.com/manual/en/language_grammars#naming_conventions>
 * <https://www.sublimetext.com/docs/scope_naming.html>
 */
export const names = {
	entityName: {
		section: 'entity.name.section',
        unknownSection: 'entity.name.unknown-section',
        configKey: 'entity.name.tag',
        unknownConfigKey: 'entity.name.unknown-tag',
	},
    meta: {
        configEntry: `meta.config-entry`,
	},
	comment: 'comment.line.number-sign',

    languageConstant: 'constant.language',
    boolean: 'constant.language',
    numeric: 'constant.numeric',
    string: {
        singleQuoted: 'string.quoted.single',
        doubleQuoted: 'string.quoted.double',
        escape: 'constant.character.escape'
    },
    specifier: 'constant.other.placeholder',
    variable: 'variable.other',
    parameter: 'variable.parameter',

    operator: {
        assignment: 'keyword.operator.assignment',
    },
	/**
	 * Symbols that are part of the variable name,
	 * should additionally be applied the following scope.
	 * For example, the `$` in PHP and Shell.
	 */
	$: 'punctuation.definition.variable',
	invalid: 'invalid.illegal',
}
