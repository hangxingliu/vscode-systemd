import { LocationInfo, TextLocationUtils } from "./types";

export type SystemdDirectiveWithLocation = {
    section: string;
    directiveKey: string;
    loc1: LocationInfo;
    loc2: LocationInfo;
};

export function getDirectiveKeys(conf: string) {
    const loc = new TextLocationUtils();
    let currentSection: string;

    const results: SystemdDirectiveWithLocation[] = [];
    for (loc.offset = 0; loc.offset < conf.length; loc.offset++) {
        const ch = conf[loc.offset];
        switch (ch) {
            case '#':
            case ';': {
                const nextIndex = conf.indexOf('\n', loc.offset + 1);
                if (nextIndex < 0)
                    return results;
                loc.offset = nextIndex;
                loc.newLine();
                break;
            }
            case '[': {
                const loc1 = loc.get();
                loc.character++;
                for (loc.offset++; loc.offset < conf.length; loc.offset++) {
                    const ch2 = conf[loc.offset];
                    if (ch2 === ']') {
                        currentSection = conf.slice(loc1[0], loc.offset + 1);
                        break;
                    }
                    if (ch2 === '\n') {
                        loc.newLine();
                        break;
                    }
                    loc.character++;
                }
                if (loc.offset >= conf.length)
                    return results;
                break;
            }
            case '\n': {
                loc.newLine();
                break;
            }
            case ' ':
            case '\t':
            case '\r':
            case '\v': {
                loc.character++;
                break;
            }
            default: {
                let loc1 = loc.get();
                let consumingValue = false;
                loc.character++;
                for (loc.offset++; loc.offset < conf.length; loc.offset++) {
                    const ch2 = conf[loc.offset];
                    if (ch2 === '=') {
                        results.push({
                            section: currentSection,
                            directiveKey: conf.slice(loc1[0], loc.offset),
                            loc1,
                            loc2: loc.get(),
                        })
                        consumingValue = true;
                        break;
                    }
                    if (ch2 === '\n') {
                        loc.newLine();
                        break;
                    }
                    loc.character++;
                }
                if (loc.offset >= conf.length)
                    return results;

                if (consumingValue) {
                    // skip '='
                    loc.offset++;
                    loc.character++;
                    loc1 = loc.get();
                    let isNotEnd = false;
                    for (; loc.offset < conf.length; loc.offset++) {
                        const ch2 = conf[loc.offset];
                        if (ch2 === '\\') {
                            isNotEnd = true;
                            loc.character++;
                            continue;
                        }
                        if (ch2 === '\n') {
                            loc.newLine();
                            if (isNotEnd) {
                                continue
                            } else {
                                break;
                            }
                        }
                        if (ch2 !== '\r')
                            isNotEnd = false;
                        loc.character++;
                    }
                    if (loc.offset >= conf.length)
                        return results;
                } // end of if
                break;
            }
        }
    }
    return results;
}
