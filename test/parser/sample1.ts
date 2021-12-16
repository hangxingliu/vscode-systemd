import { readFileSync } from 'fs'
import { resolve as resolvePath } from 'path'
import { deepStrictEqual as eq } from 'assert'
import { CursorType } from "../../src/parser/types"
import { CursorInfo, getCursorInfoFromSystemdConf } from "../../src/parser"
import { getDirectiveKeys } from "../../src/parser/get-directive-keys"

type UnitTest = [position: string, context: Partial<CursorInfo>];

const sampleDir = resolvePath(__dirname, '../samples/systemd');
const sampleFile = resolvePath(sampleDir, 'autorelabel.service');
const sample = readFileSync(sampleFile, 'utf8');
eq(sample.length, 500);

console.log(getDirectiveKeys(sample));

const tests: UnitTest[] = [
    ["1,1", { type: CursorType.directiveKey }],
    ["1,2", { type: CursorType.comment }],
    ["1$", { type: CursorType.comment }],
    ["2$", { type: CursorType.none, section: '[Unit]' }],
    ["3,1", { type: CursorType.directiveKey, section: '[Unit]' }],
    ["3,8", { type: CursorType.directiveKey }],
    ["3,13", { type: CursorType.directiveValue }],
    ["3,15", { type: CursorType.directiveValue, directiveKey: 'Description' }],
];

// {
//     const pos = getPositionNumber(sample, '3,13');
//     const info = getCursorInfoFromSystemdConf(sample.slice(0, pos));
//     const pending = sample.slice(info.pendingLoc[0], info.cursorLoc[0]);
//     console.log(pending)
// };



let error = false;
for (let i = 0; i < tests.length; i++) {
    const [position, context] = tests[i];
    const pos = getPositionNumber(sample, position);
    const actual = getCursorInfoFromSystemdConf(sample.slice(0, pos));
    const keys = Object.keys(context);
    let matched = true;
    for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (Array.isArray(context[key])) matched = JSON.stringify(context[key]) === JSON.stringify(actual[key]);
        else matched = actual[key] === context[key];

        if (!matched) {
            console.error('=============================');
            console.error(`position ${position}(${pos}) test failed:`);
            console.error(`expected:`, context);
            console.error(`  actual:`, actual);
            console.error('=============================');
            error = true;
            break;
        }
    }
    if (matched)
        console.log(`  passed:`, position, JSON.stringify(actual));
}
if (error) process.exit(1);



function getPositionNumber(text: string, expression: string) {
    let lineNo = parseInt(expression.match(/^\d+/)[0], 10);
    let index = 0;
    while (--lineNo > 0) {
        const nextIndex = text.indexOf("\n", index);
        if (nextIndex < 0) break;
        index = nextIndex + 1;
    }
    if (expression.endsWith("$")) {
        let nextIndex = text.indexOf("\n", index);
        if (nextIndex < 0) nextIndex = text.length - 1;
        index = nextIndex;
    } else if (expression.endsWith("^")) {
        // noop
    } else {
        const incr = parseInt(expression.match(/[,;:](\d+)$/)[1], 10);
        index += incr - 1;
    }
    return index;
}
