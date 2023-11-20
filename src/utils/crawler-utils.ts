// author: hangxingliu
// version: 2023-11-20
import axios, { AxiosResponse } from "axios";
export { load as loadHtml } from "cheerio";

import { createHash } from "crypto";
import { Agent as HttpsAgent } from "https";
import { resolve as resolvePath } from "path";
import { deepStrictEqual } from "assert";
import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream, WriteStream, appendFileSync } from "fs";

//
//#region terminal style
export const hasEnv = typeof process !== "undefined" && process.env ? true : false;
export const bold = (str: unknown) => `\x1b[1m${str}\x1b[22m`;
export const dim = (str: unknown) => `\x1b[2m${str}\x1b[22m`;
export const blue = (str: unknown) => `\x1b[34m${str}\x1b[39m`;
export const cyan = (str: unknown) => `\x1b[36m${str}\x1b[39m`;
export const green = (str: unknown) => `\x1b[32m${str}\x1b[39m`;
export const yellow = (str: unknown) => `\x1b[33m${str}\x1b[39m`;
export const red = (str: unknown) => `\x1b[31m${str}\x1b[39m`;
//#endregion terminal style
//

//
//#region printer
const OK = " - " + green("OK");
const WARN = " - " + yellow("WARN");
const ERROR = " - " + red("ERROR");
const DONE = blue(bold("DONE"));
export const print = {
    warnings: 0,
    error: (reason = "") => {
        console.error(ERROR, reason);
        process.exit(1);
    },
    warning: (reason = "") => {
        print.warnings++;
        console.warn(WARN, reason);
    },
    ok: (msg = "") => {
        console.log(OK, msg);
    },
    debug: (msg = "") => {
        console.log(dim("debug: " + msg));
    },
    start: (name: string) => {
        console.log(`>  ${name} ...`);
    },
    done: () => console.log(DONE),
};
//#endregion printer
//

//
//#region assert functions
export const enum AssertLevel {
    WARNING = "warning",
    ERROR = "error",
}
export type AssertLengthCondition = number | `=${number}` | `>=${number}` | `>${number}` | `<${number}` | `<=${number}`;
export function assertLength<T extends { length: number }>(
    name: string,
    arrayOrString: T,
    cond: AssertLengthCondition,
    level = AssertLevel.ERROR
): T {
    const actualLen = arrayOrString?.length;
    let op: string;
    let expectedLen: number;
    let ok = false;
    if (typeof cond === "number") {
        op = "=";
        expectedLen = cond;
    } else {
        const mtx = cond.match(/(=|>=?|<=?)(\d+)/)!;
        op = mtx[1];
        expectedLen = parseInt(mtx[2], 10);
    }
    if (op === "=") ok = actualLen === expectedLen;
    else if (op === ">=") ok = actualLen >= expectedLen;
    else if (op === ">") ok = actualLen > expectedLen;
    else if (op === "<") ok = actualLen < expectedLen;
    else if (op === "<=") ok = actualLen <= expectedLen;
    if (!ok) {
        const errPrefix = `The length of ${bold(name)} is ${actualLen}, it does not match:`;
        print[level](`${errPrefix} ${cond}`);
    }
    return arrayOrString;
}
export function assert<T>(name: string, actual: unknown, expected: T): asserts actual is T {
    if (Array.isArray(expected) && Array.isArray(actual)) {
        assertLength(name, actual, `=${expected.length}`);
        for (let i = 0; i < expected.length; i++) assert(`${name}[${i}]`, actual[i], expected[i]);
        return;
    }
    try {
        deepStrictEqual(actual, expected);
    } catch (error) {
        let errMsg = `${bold(name)} should be equal to\n  ${JSON.stringify(expected)}\n`;
        errMsg += `But the actual value is\n  ${JSON.stringify(actual)}`;
        throw new Error(errMsg);
    }
}
export function assertAxiosTextResponse(name: string, res: AxiosResponse): string {
    if (res.status !== 200) return print.error(`status code of ${bold(name)} is ${res.status}, but not 200`);
    if (!res.data || typeof res.data !== "string") {
        if (Buffer.isBuffer(res.data)) return res.data.toString("utf8");
        return print.error(`response is not a valid string, headers=${JSON.stringify(res.headers)}`);
    }
    return res.data;
}
//#endregion assert functions
//

export class SimpleHttpCache {
    static instance?: SimpleHttpCache;
    static init(...args: ConstructorParameters<typeof SimpleHttpCache>) {
        SimpleHttpCache.instance = new SimpleHttpCache(...args);
        return SimpleHttpCache.instance!;
    }

    readonly enabled: boolean;
    /** Map<input, sha1sum>, where input is the `JSON.stringify([url, context])`  */
    readonly cachedKeys = new Map<string, string>();
    readonly manifestFile: string;
    constructor(readonly cacheDir: string) {
        if (hasEnv && process.env.NO_CACHE) {
            this.enabled = false;
            console.log(yellow(bold("HTTP persistent cache is disabled!")));
        }
        if (!existsSync(cacheDir)) {
            console.log(`Creating directory: ${cacheDir} for HTTP perisstent cache...`);
            mkdirSync(cacheDir);
            print.ok();
        }
        this.manifestFile = resolvePath(cacheDir, "manifest.txt");
    }
    getKey(url: string, context?: string) {
        const input = JSON.stringify([url, context]);
        let sha1 = this.cachedKeys.get(input);
        if (!sha1) {
            sha1 = createHash("sha1").update(input).digest("hex");
            this.cachedKeys.set(input, sha1);
        }
        return sha1;
    }
    get(url: string, context?: string): Buffer | undefined {
        if (!this.enabled) return;
        const key = this.getKey(url, context);
        const cacheFile = resolvePath(this.cacheDir, key);
        if (!existsSync(cacheFile)) return;
        console.log(`Matched http cache "${key}"`);
        return readFileSync(cacheFile);
    }
    set(resp: string | Buffer, url: string, context?: string) {
        const key = this.getKey(url, context);
        const cacheFile = resolvePath(this.cacheDir, key);
        writeFileSync(cacheFile, resp);
        const manifest = {
            url,
            context,
            cache: cacheFile,
            createdAt: new Date(),
        };
        appendFileSync(this.manifestFile, JSON.stringify(manifest, null, "\t") + "\n");
    }
}

function getHttpsAgent(): HttpsAgent {
    const envNames = [`HTTPS_PROXY`, `https_proxy`, `HTTP_PROXY`, `http_proxy`, `ALL_PROXY`, `all_proxy`];
    if (hasEnv) {
        for (let i = 0; i < envNames.length; i++) {
            const envName = envNames[i];
            const env = process.env[envName];
            if (typeof env === "string" && env && /^https?:\/\//i.test(env)) {
                console.log(`Use proxy "${env}" for https request`);
                const { HttpsProxyAgent } = require("https-proxy-agent");
                return new HttpsProxyAgent(env);
            }
        }
    }
    return new HttpsAgent({ keepAlive: true });
}

let httpsAgent: HttpsAgent;
export async function getText(name: string, url: string, context?: string): Promise<string> {
    if (!httpsAgent) httpsAgent = getHttpsAgent();

    console.log(`Getting http resource ${bold(name)} from ${url} ...`);
    const cache = SimpleHttpCache.instance?.get(url, context);
    if (cache) return cache.toString("utf-8");

    let response: AxiosResponse;
    try {
        response = await axios(url, { proxy: false, httpsAgent });
    } catch (error) {
        console.error(error);
        return print.error(`Failed to get response: ${error.message}`);
    }

    const text = assertAxiosTextResponse(name, response);
    SimpleHttpCache.instance?.set(text, url, context);
    return text;
}

export function minifierHTML(html: string): string {
    const minifier = require("html-minifier");
    return minifier.minify(html, {
        removeComments: true,
        collapseWhitespace: true,
    });
}

export function resolveURL(from: string, to: string) {
    const resolvedUrl = new URL(to, new URL(from, "resolve://"));
    if (resolvedUrl.protocol === "resolve:") {
        // `from` is a relative URL.
        const { pathname, search, hash } = resolvedUrl;
        return pathname + search + hash;
    }
    return resolvedUrl.toString();
}

//
//#region html to markdown
let turndownService: { turndown(html: string): string };
export function toMarkdown(html: string): string {
    if (!turndownService) {
        const Turndown = require("turndown");
        turndownService = new Turndown({ headingStyle: "atx", hr: "***" });
    }
    return turndownService.turndown(html);
}
//#endregion html to markdown
//

export function writeJSON(filePath: string, object: unknown) {
    writeFileSync(filePath, JSON.stringify(object, null, "\t") + "\n");
}
export class JsonFileWriter {
    stream: WriteStream;
    isFirst = true;

    constructor(filePath: string) {
        this.stream = createWriteStream(filePath);
        this.stream.write("[");
    }
    writeItem(item: unknown) {
        this.stream.write((this.isFirst ? "\n" : ",\n") + JSON.stringify(item));
        this.isFirst = false;
    }
    close() {
        this.stream.write("\n]");
        this.stream.close();
    }
}
