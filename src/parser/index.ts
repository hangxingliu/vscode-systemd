import { CursorType, LocationInfo, ParserOptions, TextLocationUtils } from "./types";

export class CursorInfo {
    type: CursorType;
    cursorLoc: LocationInfo;

    pendingLoc: LocationInfo;
    resetPending = (newType: CursorType) => {
        this.type = newType;
        delete this.pendingLoc;
    }

    section: string;
    sectionLoc1: LocationInfo;
    sectionLoc2: LocationInfo;

    directiveKey: string;
    directiveKeyLoc1: LocationInfo;
    directiveKeyLoc2: LocationInfo;
}

export function getCursorInfoFromSystemdConf(conf: string, opts?: ParserOptions) {
    let looseComment = false;
    if (opts) {
        if (opts.looseComment) looseComment = true;
    }

    const cursor = new CursorInfo();
    cursor.type = CursorType.directiveKey;

    const loc = new TextLocationUtils();
    for (loc.offset = 0; loc.offset < conf.length; loc.offset++) {
        const ch = conf[loc.offset];
        switch (ch) {
            case '#':
            case ';': {
                const nextIndex = conf.indexOf('\n', loc.offset + 1);
                if (nextIndex < 0) {
                    cursor.pendingLoc = loc.get();
                    cursor.type = CursorType.comment;

                    loc.character += conf.length - loc.offset;
                    loc.offset = conf.length;
                    cursor.cursorLoc = loc.get();
                    return cursor;
                }
                loc.offset = nextIndex;
                loc.newLine();
                cursor.resetPending(CursorType.directiveKey);
                break;
            }
            case '[': {
                const loc1 = loc.get();
                loc.character++;
                for (loc.offset++; loc.offset < conf.length; loc.offset++) {
                    const ch2 = conf[loc.offset];
                    if (ch2 === ']') {
                        cursor.section = conf.slice(loc1[0], loc.offset + 1);
                        cursor.sectionLoc1 = loc1;
                        cursor.sectionLoc2 = loc.get();
                        cursor.resetPending(CursorType.none);
                        break;
                    }
                    if (ch2 === '\n') {
                        loc.newLine();
                        cursor.resetPending(CursorType.directiveKey);
                        break;
                    }
                    loc.character++;
                }
                if (loc.offset >= conf.length) {
                    cursor.pendingLoc = loc1;
                    cursor.type = CursorType.section;
                    delete cursor.section;
                    cursor.cursorLoc = loc.get();
                    return cursor;
                }
                break;
            }
            case '\n': {
                loc.newLine();
                cursor.resetPending(CursorType.directiveKey);
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
                loc.character++;
                for (loc.offset++; loc.offset < conf.length; loc.offset++) {
                    const ch2 = conf[loc.offset];
                    if (ch2 === '=') {
                        cursor.directiveKey = conf.slice(loc1[0], loc.offset);
                        cursor.directiveKeyLoc1 = loc1;
                        cursor.directiveKeyLoc2 = loc.get();
                        cursor.resetPending(CursorType.directiveValue);
                        break;
                    }
                    if (ch2 === '\n') {
                        loc.newLine();
                        cursor.resetPending(CursorType.directiveKey);
                        break;
                    }
                    loc.character++;
                }
                if (loc.offset >= conf.length) {
                    cursor.pendingLoc = loc1;
                    cursor.type = CursorType.directiveKey;
                    delete cursor.directiveKey;
                    cursor.cursorLoc = loc.get();
                    return cursor;
                }
                if ((cursor.type as CursorType) === CursorType.directiveValue) {
                    // skip '='
                    loc.offset++;
                    loc.character++;
                    loc1 = loc.get();
                    let isNotEnd = false, canBeComment = false;
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
                                isNotEnd = false;
                                canBeComment = true;
                                continue
                            } else {
                                cursor.resetPending(CursorType.directiveKey);
                                break;
                            }
                        }
                        if (ch2 !== '\r')
                            isNotEnd = false;
                        if (canBeComment && (ch2 === '#' || ch2 === ';')) {
                            const nextIndex = conf.indexOf('\n', loc.offset + 1);
                            if (nextIndex < 0) {
                                cursor.pendingLoc = loc.get();
                                cursor.type = CursorType.comment;
                                loc.character += conf.length - loc.offset;
                                loc.offset = conf.length;
                                return cursor;
                            }
                            loc.offset = nextIndex;
                            loc.newLine();
                            continue;
                        }
                        if (ch2 !== ' ' && ch2 !== '\t')
                            canBeComment = false;
                        loc.character++;
                    }
                    if (loc.offset >= conf.length) {
                        cursor.pendingLoc = loc1;
                        cursor.type = CursorType.directiveValue;
                        cursor.cursorLoc = loc.get();
                        return cursor;
                    }
                } // end of if
                break;
            }
        }
    }
    cursor.cursorLoc = loc.get();
    return cursor;
}
