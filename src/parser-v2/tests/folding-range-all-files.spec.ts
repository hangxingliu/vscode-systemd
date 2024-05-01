import * as glob from "glob";
import { readFileSync } from "fs";
import { resolve } from "path";
import { tokenizer } from "../tokenizer";
import { assertItems, test } from "./utils";
import { getFoldingRanges, toOneBasedRanges } from "../get-folding-ranges";
import { TokenizerOptions } from "../types";

const cwd = resolve(__dirname, "../../../test/samples");

const files: string[] = glob.sync("**/*.{service,socket,conf,network,target,path}", { cwd });
for (const file of files) {
    const opts: TokenizerOptions = {};
    if (file.startsWith("mkosi/")) opts.mkosi = true;

    const filePath = resolve(cwd, file);
    const conf = readFileSync(filePath, "utf-8");
    const { tokens } = tokenizer(conf, opts);
    const ranges = getFoldingRanges(tokens);

    test(filePath, ({ diagnosis }) => {
        diagnosis(tokens);
        diagnosis(ranges);
        ranges.sort((a, b) => a[0] - b[0]);

        for (let i = 0; i < ranges.length; i++) {
            const [from, to] = ranges[i];
            if (to <= from) throw new Error(`Invalid range ${ranges[i]}`);

            for (let j = i + 1; j < ranges.length; j++) {
                const range2 = ranges[j];
                if (to < range2[0]) break;
                if (to >= range2[1]) continue;
                throw new Error(`Intersected ranges ${ranges[i]} and ${ranges[j]}`);
            }
        }
    });
}
