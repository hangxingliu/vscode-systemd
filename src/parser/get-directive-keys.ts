import { LocationInfo, TextLocationUtils } from "./types";

export type SystemdDirectiveWithLocation = {
    section: string;
    directiveKey: string;
    value: string;
    loc1: LocationInfo;
    loc2: LocationInfo;
};

export function getDirectiveKeys(conf: string) {
    const loc = new TextLocationUtils();
    let currentSection: string | undefined;

    const results: SystemdDirectiveWithLocation[] = [];
    for (loc.offset = 0; loc.offset < conf.length; loc.offset++) {
        const ch = conf[loc.offset];
        switch (ch) {
            case "#":
            case ";": {
                const nextIndex = conf.indexOf("\n", loc.offset + 1);
                if (nextIndex < 0) return results;
                loc.offset = nextIndex;
                loc.newLine();
                break;
            }
            case "[": {
                const loc1 = loc.get();
                loc.character++;
                for (loc.offset++; loc.offset < conf.length; loc.offset++) {
                    const ch2 = conf[loc.offset];
                    if (ch2 === "]") {
                        currentSection = conf.slice(loc1[0], loc.offset + 1);
                        break;
                    }
                    if (ch2 === "\n") {
                        loc.newLine();
                        break;
                    }
                    loc.character++;
                }
                if (loc.offset >= conf.length) return results;
                break;
            }
            case "\n": {
                loc.newLine();
                break;
            }
            case " ":
            case "\t":
            case "\r":
            case "\v": {
                loc.character++;
                break;
            }
            default: {
                let loc1 = loc.get();
                let item: SystemdDirectiveWithLocation | undefined;
                loc.character++;
                for (loc.offset++; loc.offset < conf.length; loc.offset++) {
                    const ch2 = conf[loc.offset];
                    if (ch2 === "=") {
                        item = {
                            section: currentSection!,
                            directiveKey: conf.slice(loc1[0], loc.offset),
                            loc1,
                            loc2: loc.get(),
                            value: "",
                        };
                        results.push(item);
                        break;
                    }
                    if (ch2 === "\n") {
                        loc.newLine();
                        break;
                    }
                    loc.character++;
                }
                if (loc.offset >= conf.length) return results;

                if (item) {
                    // skip '='
                    loc.offset++;
                    loc.character++;
                    loc1 = loc.get();
                    let isNotEnd = false,
                        canBeComment = false;
                    for (; loc.offset < conf.length; loc.offset++) {
                        const ch2 = conf[loc.offset];
                        if (ch2 === "\\") {
                            isNotEnd = true;
                            loc.character++;
                            item.value += ch2;
                            continue;
                        }
                        if (ch2 === "\n") {
                            loc.newLine();
                            if (isNotEnd) {
                                isNotEnd = false;
                                canBeComment = true;
                                item.value += ch2;
                                continue;
                            } else {
                                break;
                            }
                        }
                        if (ch2 !== "\r") isNotEnd = false;
                        if (canBeComment && (ch2 === "#" || ch2 === ";")) {
                            const nextIndex = conf.indexOf("\n", loc.offset + 1);
                            if (nextIndex < 0) {
                                loc.character += conf.length - loc.offset;
                                loc.offset = conf.length;
                                return results;
                            }
                            loc.offset = nextIndex;
                            loc.newLine();
                            item.value += ch2;
                            continue;
                        }
                        if (ch2 !== " " && ch2 !== "\t") canBeComment = false;
                        item.value += ch2;
                        loc.character++;
                    }
                    if (loc.offset >= conf.length) return results;
                } // end of if
                break;
            }
        }
    }
    return results;
}
