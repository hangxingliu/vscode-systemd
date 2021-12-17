import { getCursorInfoFromSystemdConf } from "../../src/parser"

const conf = [
    'Test=123 \\',
    '# comment',
    'value'
].join('\n');

let c = getCursorInfoFromSystemdConf(conf.slice(0, 21))
console.log(c)
