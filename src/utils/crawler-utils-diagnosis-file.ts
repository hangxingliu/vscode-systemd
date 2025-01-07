import { isAbsolute, relative, resolve } from "path";
import { createWriteStream, existsSync, mkdirSync, WriteStream } from "fs";
import { execSync } from "child_process";

export class CrawlerDiagnosisFile {
    static readonly HORIZONTAL_RULE = "".padEnd(32, "=");

    private static instance: CrawlerDiagnosisFile;
    static initOrGet(logsDir: string, prefix: string) {
        if (!this.instance) this.instance = new CrawlerDiagnosisFile(logsDir, prefix);
        return this.instance;
    }
    static get(required: true): CrawlerDiagnosisFile;
    static get(required: false): CrawlerDiagnosisFile | undefined;
    static get(required: boolean) {
        if (!this.instance && required) throw new Error(`Please call CrawlerDiagnosisCollector.initOrGet first`);
        return this.instance;
    }
    static close() {
        if (!this.instance) return;
        this.instance.close();
    }

    readonly fileName: string;
    readonly filePath: string;
    stream: WriteStream | undefined;

    private constructor(private readonly logsDir: string, prefix: string) {
        if (!existsSync(logsDir)) mkdirSync(logsDir);

        this.fileName = prefix + `-${formatDate()}.log`;
        this.filePath = resolve(logsDir, this.fileName);
        this.stream = createWriteStream(this.filePath, { flags: "a", autoClose: true });

        let gitHEAD = "";
        try {
            gitHEAD = execSync("git rev-parse HEAD", { encoding: "utf-8" });
        } catch {
            // noop
        }
        this.stream.write(
            [
                CrawlerDiagnosisFile.HORIZONTAL_RULE,
                `[start] ${new Date().toLocaleString()}`,
                `[git] ${gitHEAD}`,
                CrawlerDiagnosisFile.HORIZONTAL_RULE,
                "",
            ].join("\n")
        );
    }

    writeHeader(header: string) {
        if (!this.stream) return;
        this.stream.write(
            [
                "",
                CrawlerDiagnosisFile.HORIZONTAL_RULE,
                `[header] ${header}`,
                CrawlerDiagnosisFile.HORIZONTAL_RULE,
                "",
            ].join("\n")
        );
    }
    write(category: string, chunk: string | Buffer) {
        if (!this.stream) return;
        this.stream.write(`[${category}] `);
        this.stream.write(chunk);
        this.stream.write("\n");
    }
    count(name: string, countable: { length: number } | { size: number } | number) {
        if (!this.stream) return;
        if (typeof countable === 'number')
            this.stream.write(`[count] ${name} = ${countable}\n`);
        else if ("length" in countable && typeof countable.length === "number")
            this.stream.write(`[count] ${name}.length = ${countable.length}\n`);
        else if ("size" in countable && typeof countable.size === "number")
            this.stream.write(`[count] ${name}.size = ${countable.size}\n`);
    }
    /** Anchor the code line */
    anchor() {
        if (!this.stream) return;
        this.stream.write(`[anchor] ${getCallerLineInfo(this.logsDir, 2)}\n`);
    }

    close() {
        if (!this.stream) return;
        this.stream.close();
        delete this.stream;
    }
}

function formatDate(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const prefix = [year, month, day].map((it) => `${it}`.padStart(2, "0")).join("");
    const suffix = [hour, min].map((it) => `${it}`.padStart(2, "0")).join("");
    return prefix + "-" + suffix;
}

/**
 * ``` javascript
 * main();
 * function main() {
 *   console.log(getCallerLineInfo()); // <-- return the info of this line
 *   console.log(getCallerLineInfo(2)); // <-- return the info of the line with the content `main()`
 * }
 * ```
 * @returns A string like `/path/to/file:20:1`
 */
function getCallerLineInfo(baseDir: string, depth = 1) {
    const e = new Error();
    const regex = /\((.*):(\d+):(\d+)\)$/;
    const match = regex.exec(e.stack!.split("\n")[1 + depth]);
    if (!match) return '';

    let filePath = match[1];
    if (isAbsolute(filePath)) filePath = relative(baseDir, filePath);
    const lineInfo = `${filePath}:${match[2]}:${match[3]}`;
    return lineInfo;
}
