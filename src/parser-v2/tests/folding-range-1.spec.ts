import { readFileSync } from "fs";
import { resolve } from "path";
import { tokenizer } from "../tokenizer";
import { assertItems, test } from "./utils";
import { getFoldingRanges, toOneBasedRanges } from "../get-folding-ranges";

const filePath = resolve(__dirname, "../../../test/samples/mkosi/mkosi/mkosi.conf");
const fileContent = readFileSync(filePath, "utf-8");
const result = tokenizer(fileContent, { mkosi: true });

test(fileContent, ({ diagnosis }) => {
    const range = toOneBasedRanges(getFoldingRanges(result.tokens));
    diagnosis(range);
    assertItems(range, [
        [3, 8, undefined], // [Output]
        [4, 5, "Comment"],
        [10, 37, undefined], // [Content]
        [17, 25, undefined], // value
        [27, 28, undefined], // value
        [30, 34, undefined], // value
        [39, 40, undefined], // [Host]
    ]);
});
