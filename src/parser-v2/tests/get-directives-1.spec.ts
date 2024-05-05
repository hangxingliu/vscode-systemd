import { deepStrictEqual } from "assert";
import { getDirectivesFromTokens } from "../get-directives.js";
import { AssertTokens, test } from "./utils.js";
import { tokenizer } from "../tokenizer.js";

deepStrictEqual(getDirectivesFromTokens([]), []);

test("Key", ({ conf, diagnosis }) => {
    const { tokens } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(tokens.length, 1);

    const directives = getDirectivesFromTokens(tokens);
    diagnosis(directives);

    deepStrictEqual(directives.length, 1);
    deepStrictEqual(directives[0].section, undefined);
    deepStrictEqual(directives[0].key, "Key");
    deepStrictEqual(directives[0].value, undefined);
});

test("Key=", ({ conf, diagnosis }) => {
    const { tokens } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(tokens.length, 2);

    const directives = getDirectivesFromTokens(tokens);
    diagnosis(directives);

    deepStrictEqual(directives.length, 1);
    deepStrictEqual(directives[0].section, undefined);
    deepStrictEqual(directives[0].key, "Key");
    deepStrictEqual(directives[0].value, "");
});

test("[S]\nKey=", ({ conf, diagnosis }) => {
    const { tokens } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(tokens.length, 3);

    const directives = getDirectivesFromTokens(tokens);
    diagnosis(directives);

    deepStrictEqual(directives.length, 1);
    deepStrictEqual(directives[0].section, "[S]");
    deepStrictEqual(directives[0].key, "Key");
    deepStrictEqual(directives[0].value, "");
});

test("[S]\nKey=Value", ({ conf, diagnosis }) => {
    const { tokens } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(tokens.length, 4);

    const directives = getDirectivesFromTokens(tokens);
    diagnosis(directives);

    deepStrictEqual(directives.length, 1);
    deepStrictEqual(directives[0].section, "[S]");
    deepStrictEqual(directives[0].key, "Key");
    deepStrictEqual(directives[0].value, "Value");
});

test("[S]\nKey=Value\\", ({ conf, diagnosis }) => {
    const { tokens } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(tokens.length, 4);

    const directives = getDirectivesFromTokens(tokens);
    diagnosis(directives);

    deepStrictEqual(directives.length, 1);
    deepStrictEqual(directives[0].section, "[S]");
    deepStrictEqual(directives[0].key, "Key");
    deepStrictEqual(directives[0].value, "Value\\");
});

test("[S]\nKey=Val\\\nue", ({ conf, diagnosis }) => {
    const { tokens } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(tokens.length, 5);

    const directives = getDirectivesFromTokens(tokens);
    diagnosis(directives);

    deepStrictEqual(directives.length, 1);
    deepStrictEqual(directives[0].section, "[S]");
    deepStrictEqual(directives[0].key, "Key");
    deepStrictEqual(directives[0].value, "Value");
});

test("[S]\nKey=Val\\\n  # comments\nue", ({ conf, diagnosis }) => {
    const { tokens } = tokenizer(conf);
    diagnosis(tokens);
    deepStrictEqual(tokens.length, 7);
    new AssertTokens(tokens).section("[S]").key("Key").assignment().value("Val\\").value("  ").comment().value("ue");

    const directives = getDirectivesFromTokens(tokens);
    diagnosis(directives);

    deepStrictEqual(directives.length, 1);
    deepStrictEqual(directives[0].section, '[S]');
    deepStrictEqual(directives[0].key, 'Key');
    deepStrictEqual(directives[0].value, 'Value');
});

test("[S]\nKey=A\n  # comments\n  B", ({ conf, diagnosis }) => {
    const { tokens } = tokenizer(conf, { mkosi: true });
    diagnosis(tokens);
    deepStrictEqual(tokens.length, 6);

    const directives = getDirectivesFromTokens(tokens, { mkosi: true });
    diagnosis(directives);

    deepStrictEqual(directives.length, 1);
    deepStrictEqual(directives[0].section, '[S]');
    deepStrictEqual(directives[0].key, 'Key');
    deepStrictEqual(directives[0].value, 'A\nB');
});
