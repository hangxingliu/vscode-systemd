import { LocationTuple, RangeTuple, Token } from "./types.js";

/**
 * A utility class for managing text cursor position for the tokenizer.
 * With this class, the tokenizer does not require much logic for computing offsets and line numbers.
 */
export class TextLocationUtils {
    offset: number;
    private line: number;
    private char: number;

    constructor(prev?: LocationTuple) {
        if (prev) {
            this.offset = prev[0];
            this.line = prev[1];
            this.char = prev[2];
        } else {
            this.offset = 0;
            this.line = 0;
            this.char = 0;
        }
    }

    /** Move in the same line */
    readonly move = (offset: number) => {
        this.char += offset;
        this.offset += offset;
    };

    /** Move in the same line */
    static move(tuple: Readonly<LocationTuple>, offset: number): LocationTuple {
        return [tuple[0] + offset, tuple[1], tuple[2] + offset];
    }

    /** Move to next character in the same line */
    readonly moveToNext = () => {
        this.char++;
        this.offset++;
    };

    /** Move the new line */
    readonly moveToNewLine = () => {
        this.line++;
        this.offset++;
        this.char = 0;
    };

    /**
     * Create a location tuple from current state
     */
    readonly get = (): LocationTuple => [this.offset, this.line, this.char] as const;
    readonly getWithOffset = (inlineOffset: number): LocationTuple => [
        this.offset + inlineOffset,
        this.line,
        this.char + inlineOffset,
    ];

    readonly inSameLine = (loc?: LocationTuple): boolean => {
        return loc ? this.line === loc[1] : false;
    };
}

/**
 * A value token collector for collecting directive value text from multiple lines according to
 * specified syntax rules.
 * For example:
 * The sample data `{ value: "Val1 Val2", ranges: [{...}, {...}]}` can be collected from
 * the following configuration:
 * ``` plaintext
 * Key=Val1\
 * # comment
 *  Val2
 * ```
 */
export class ValueTokenCollector {
    private started = false;
    readonly ranges: RangeTuple[] = [];
    value = "";

    constructor(readonly mkosi: boolean) {}
    addValueToken(token: Token) {
        const { started } = this;
        const { text, range } = token;
        this.ranges.push(range);

        if (this.mkosi) {
            this.value += (started ? "\n" : "") + (text || "").replace(/^\s+/, "");
        } else if (!started) {
            this.value = text || "";
        } else if (text && !/^\s*$/.test(text)) {
            this.value = this.value!.replace(/\\$/, "") + text;
        }
        this.started = true;
    }
}
