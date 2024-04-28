//@ts-check
/// <reference types="node" />
const fs = require("fs");
const path = require("path");
const vsctm = require("vscode-textmate");
const oniguruma = require("vscode-oniguruma");

const dim = (str) => `\x1b[2m${str}\x1b[22m`;
const cyan = (str) => `\x1b[36m${str}\x1b[39m`;

const grammar = {
    scopeName: "source.mkosi",
    file: path.resolve(__dirname, "../../src/syntax/mkosi.tmLanguage"),
    // testFile: path.resolve(__dirname, "../../test/samples/mkosi/mkosi-tools/mkosi.conf"),
    testInput: [
        '[Host]',
        '@Incremental=yes',
        'KernelCommandLineExtra=systemd.crash_shell=yes',
        '                      systemd.log_level=debug'
    ].join('\n'),
};

const wasmBin = fs.readFileSync(path.join(__dirname, "./node_modules/vscode-oniguruma/release/onig.wasm")).buffer;
const vscodeOnigurumaLib = oniguruma.loadWASM(wasmBin).then(() => {
    return {
        createOnigScanner(patterns) {
            return new oniguruma.OnigScanner(patterns);
        },
        createOnigString(s) {
            return new oniguruma.OnigString(s);
        },
    };
});

// Create a registry that can create a grammar from a scope name.
const registry = new vsctm.Registry({
    onigLib: vscodeOnigurumaLib,
    loadGrammar: async (scopeName) => {
        if (scopeName === grammar.scopeName) {
            // https://github.com/textmate/javascript.tmbundle/blob/master/Syntaxes/JavaScript.plist
            const grammarXML = fs.readFileSync(grammar.file, "utf-8");
            return vsctm.parseRawGrammar(grammarXML);
        }
        console.log(`Unknown scope name: ${scopeName}`);
        return null;
    },
});

// Load the JavaScript grammar and any other grammars included by it async.
registry.loadGrammar(grammar.scopeName).then((g) => {
    if (!g) return;

    const text = grammar.testFile ? fs.readFileSync(grammar.testFile, "utf-8") : grammar.testInput;
    const lines = text.split(/\r?\n/);

    let ruleStack = vsctm.INITIAL;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineTokens = g.tokenizeLine(line, ruleStack);
        console.log(`\nline             "${dim(line)}"`);

        for (let j = 0; j < lineTokens.tokens.length; j++) {
            const token = lineTokens.tokens[j];
            const scopes = token.scopes.filter((it) => it !== grammar.scopeName);

            const range = `[${token.startIndex}, ${token.endIndex})`.padEnd(8, " ");
            let log = ` - token${range} "${dim(line.substring(token.startIndex, token.endIndex))}" `;
            if (scopes.length > 0) log += `scopes: ${scopes.map(cyan).join(", ")}`;
            console.log(log);
        }
        ruleStack = lineTokens.ruleStack;
    }
});
