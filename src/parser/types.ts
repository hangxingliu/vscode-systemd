export const enum CursorType {
    none = 0,
    comment = 1,
    section = 2,
    directiveKey = 3,
    directiveValue = 4,
}

export type LocationInfo = [offset: number, line: number, character: number];

export class TextLocationUtils {
    offset = 0;
    line = 0;
    character = 0;
    newLine = () => { this.line++; this.character = 0; };
    get = () => [this.offset, this.line, this.character] as LocationInfo;
}

export type ParserOptions = {
    looseComment?: boolean;
}
