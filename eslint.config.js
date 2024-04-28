//@ts-check
/// <reference types="node" />
const globals = require("globals");
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
    // ignores: [".tsc", "artifacts", "out", "node_modules", "eslint.config.js"],
    rules: {
        "no-useless-escape": "off",
        "prefer-const": "warn",
        "@typescript-eslint/no-var-requires": "off",
        // https://github.com/typescript-eslint/typescript-eslint/issues/2621
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
    },
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.commonjs,
        },
    },
});
