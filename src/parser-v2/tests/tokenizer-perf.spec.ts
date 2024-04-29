import * as glob from "glob";
import { resolve } from "path";
import { tokenizer } from "../tokenizer";
import { readFileSync } from "fs";
import { TokenizerOptions } from "../types";

let numOfFiles = 0;
let numOfTokens = 0;
let elapsed = 0;

const stdout = process.stdout;
const cwd = resolve(__dirname, "../../../test/samples");

const files: string[] = glob.sync("**/*.{service,socket,conf,network,target,path}", { cwd });
for (const file of files) {
    const opts: TokenizerOptions = {};
    if (file.startsWith("mkosi/")) opts.mkosi = true;

    stdout.write(file.padEnd(58));
    const filePath = resolve(cwd, file);
    const conf = readFileSync(filePath, "utf-8");

    const from = performance.now();

    const result = tokenizer(conf);

    const to = performance.now();
    elapsed += to - from;
    numOfFiles++;
    numOfTokens += result.tokens.length;

    stdout.write(` token.length = ${result.tokens.length}`.padEnd(20));
    if (opts.mkosi) stdout.write("[mkosi]");
    stdout.write("\n");
}

// + 14.49 ms for 164 files / 8690 tokens
// + 13.37 ms for 164 files / 8690 tokens
console.log(`+ ${elapsed.toFixed(2)} ms for ${numOfFiles} files / ${numOfTokens} tokens`);
