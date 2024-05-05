import { readFileSync } from "fs";
import { resolve } from "path";
import { tokenizer } from "../tokenizer.js";
import { test } from "./utils.js";
import { getDirectivesFromTokens } from "../get-directives.js";
import { deepStrictEqual } from "assert";

const filePath = resolve(__dirname, "../../../test/samples/mkosi/mkosi/mkosi.conf");
const fileContent = readFileSync(filePath, "utf-8");

test(fileContent, ({ conf, diagnosis }) => {
    const result = tokenizer(conf, { mkosi: true });
    const directives = getDirectivesFromTokens(result.tokens, { mkosi: true });
    diagnosis(directives);
    deepStrictEqual(directives.length, 13);

    deepStrictEqual(directives[8].section, "[Content]");
    deepStrictEqual(directives[8].key, "Packages");
    deepStrictEqual(
        directives[8].value,
        ["attr", "ca-certificates", "gdb", "jq", "less", "nano", "strace", "tmux"].join("\n")
    );

    deepStrictEqual(directives[9].section, "[Content]");
    deepStrictEqual(directives[9].key, "InitrdPackages");
    deepStrictEqual(directives[9].value, "less");

    deepStrictEqual(directives[10].section, "[Content]");
    deepStrictEqual(directives[10].key, "RemoveFiles");
    deepStrictEqual(directives[10].value, "/usr/lib/kernel/install.d/20-grub.install\n/usr/lib/kernel/install.d/50-dracut.install");
});
