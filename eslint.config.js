//@ts-check
/// <reference types="node" />
/** @typedef {import('eslint').Linter.Config<any>} ESLintConfig */

const globals = require("globals");
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

/**
 * Default rules for TypeScript source code files
 * @type {ESLintConfig['rules']}
 */
const defaultRules = {
    "no-useless-escape": "off",
    "prefer-const": "warn",
    "@typescript-eslint/no-var-requires": "off",
    // https://github.com/typescript-eslint/typescript-eslint/issues/2621
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
    "class-methods-use-this": "warn",
    "@typescript-eslint/no-require-imports": "off",
};

/**
 * Default rules for unit test files.
 * Allow unused variables and `let` for more assignment in the future
 * @type {ESLintConfig['rules']}
 */
const specTestRules = {
    ...defaultRules,
    "prefer-const": "off",
    "@typescript-eslint/no-unused-vars": "off",
};

/** @type {ESLintConfig['languageOptions']} */
const defaultLanguageOptions = {
    globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
    },
};

module.exports = [
    ...tseslint.config({
        files: ["src/**/*.ts"],
        ignores: ["src/**/*.spec.ts"],
        rules: defaultRules,
        languageOptions: defaultLanguageOptions,
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    }),
    ...tseslint.config({
        files: ["src/**/*.spec.ts"],
        rules: specTestRules,
        languageOptions: defaultLanguageOptions,
        linterOptions: {
            reportUnusedDisableDirectives: "off",
        },
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    }),
];
