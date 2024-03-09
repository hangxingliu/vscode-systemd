import { deepStrictEqual } from "assert";
import { parseSystemdVersion, ParsedSystemdVersion } from "./systemd-version";

// Define a helper function for testing
function testParseSystemdVersion(input: string | number | undefined, expected: ParsedSystemdVersion | undefined) {
    const result = parseSystemdVersion(input);
    deepStrictEqual(
        result,
        expected,
        `Failed test: input = ${input}, expected = ${JSON.stringify(expected)}, got = ${JSON.stringify(result)}`
    );
}

// Test cases
testParseSystemdVersion(undefined, undefined);
testParseSystemdVersion("latest", undefined);
testParseSystemdVersion("v255", { major: 255 });
testParseSystemdVersion("252.22-1~deb12u1", { major: 252, minor: 22 });
testParseSystemdVersion("255.4-1", { major: 255, minor: 4 });
testParseSystemdVersion("255.4-1ubuntu4", { major: 255, minor: 4 });
testParseSystemdVersion("systemd 249", { major: 249 });
testParseSystemdVersion(255, { major: 255 });
testParseSystemdVersion(255.4, { major: 255, minor: 4 });
testParseSystemdVersion(0, undefined);
testParseSystemdVersion(NaN, undefined);

// console.log("All tests passed!");
