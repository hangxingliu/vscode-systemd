#!/usr/bin/env node
//@ts-check
/// <reference types="node" />

//#region main
// template:    run-cjs.js
// author:      hangxingliu
// license:     MIT
// version:     2023-11-23
const { platform } = require("os");
const { existsSync } = require("fs");
const { resolve, basename, dirname } = require("path");
const { spawn, spawnSync } = require("child_process");
const runFromPackageScript = !!process.env.npm_execpath;
const runFromYarn = /yarn\/bin/.test(process.env.npm_execpath || "");
const isWin32 = platform() === 'win32';

/** @see https://stackoverflow.com/questions/14031763 */
const cleanupCallbacks = [];
/** @param {number} [exitCode] */
function cleanup(exitCode) {
    while (cleanupCallbacks.length > 0) cleanupCallbacks.pop()();
    if (typeof exitCode === "number") process.exit(exitCode);
}
/** @param {() => void} callback */
function addCleanupCallback(callback) {
    if (cleanupCallbacks.length === 0) {
        process.on("exit", cleanup.bind(null));
        process.on("SIGINT", cleanup.bind(null, 0));
        process.on("SIGUSR1", cleanup.bind(null, 1));
        process.on("SIGUSR2", cleanup.bind(null, 1));
        process.on("uncaughtException", cleanup.bind(null, 1));
    }
    cleanupCallbacks.push(callback);
}
/**
 * @param {string} bin
 * @param {number|null} code
 * @param {string|null} [signal]
 */
function printExitStatus(bin, code, signal) {
    let msg = `${bin} exit with`;
    if (typeof code === "number") msg += ` code ${code}`;
    if (typeof signal === "string") msg += ` signal ${signal}`;
    console.error(msg);
}

/** @typedef {typeof process.env} SystemEnv */
/** @typedef {{ env?: SystemEnv; cwd?: string; shortName?: boolean }} ExecSyncOptions */
/** @typedef {ExecSyncOptions & { silent?: boolean }} ExecOptions */

/**
 * @param {string[]} command
 * @param {ExecSyncOptions} [opts]
 */
function execSync(command, opts) {
    const [bin, ...args] = command;
    let binName = bin;

    let cwd = process.cwd();
    const env = { ...process.env };
    if (opts) {
        if (opts.env) Object.assign(env, opts.env);
        if (opts.cwd) cwd = opts.cwd;
        if (opts.shortName) binName = basename(bin);
    }
    if (!runFromPackageScript) {
        env.PATH = prependNodeModulesBinIntoPath(__dirname, env.PATH);
        env.PATH = prependNodeModulesBinIntoPath(process.cwd(), env.PATH);
    }

    console.error(`+ (sync) ${binName} ${args.join(" ")}`);
    const ret = spawnSync(bin, args, { cwd, env, stdio: ["inherit", "inherit", "inherit"] });
    if (ret.status !== 0) {
        printExitStatus(bin, ret.status, ret.signal);
        process.exit(ret.status || 1);
    }
}

/**
 * @param {string[]} command
 * @param {ExecOptions} [opts]
 */
function exec(command, opts) {
    const [bin, ...args] = command;
    let binName = bin;

    /** @type {'inherit'|'ignore'} */
    let stdout = "inherit";
    let cwd = process.cwd();
    const env = { ...process.env };
    if (opts) {
        if (opts.silent) stdout = "ignore";
        if (opts.env) Object.assign(env, opts.env);
        if (opts.shortName) binName = basename(bin);
        if (opts.cwd) cwd = opts.cwd;
    }
    if (!runFromPackageScript) {
        env.PATH = prependNodeModulesBinIntoPath(__dirname, env.PATH);
        env.PATH = prependNodeModulesBinIntoPath(process.cwd(), env.PATH);
    }

    console.error(`+ ${binName} ${args.join(" ")}`);
    const child = spawn(bin, args, { cwd, env, stdio: [stdout, "inherit", "inherit"] });

    /** @type {Promise<number|null>} */
    const promise = new Promise((resolve, reject) => {
        child.on("error", reject);
        child.on("exit", (code, signal) => {
            printExitStatus(bin, code, signal);
            return resolve(code);
        });
    });
    const kill = () => {
        console.error(`killing ${bin} ...`);
        try {
            child.kill();
        } catch (error) {
            console.error(error);
        }
    };

    addCleanupCallback(kill);
    return { child, promise, kill };
}

/**
 * @param {string} baseDir
 * @param {string} [envPATH]
 * @return {string} new PATH
 */
function prependNodeModulesBinIntoPath(baseDir, envPATH) {
    /** @type {string[]} */
    const prepend = [];
    let maxDepth = 8;
    while (maxDepth-- > 0) {
        const modulesBinDir = resolve(baseDir, "node_modules/.bin");
        const hasBinDir = existsSync(modulesBinDir);
        if (hasBinDir) prepend.push(modulesBinDir);
        const nextDir = dirname(baseDir);
        if (nextDir === "." || nextDir === baseDir) break;
        baseDir = nextDir;
    }
    const pathParts = envPATH ? envPATH.split(":") : [];
    for (const path of prepend) {
        if (pathParts.includes(path)) continue;
        pathParts.unshift(path);
    }
    return pathParts.join(":");
}
/** @param {string} [str] */
function isTrue(str) {
    return typeof str === "string" && /^(1|on|yes|true)$/i.test(str);
}

/**
 * @param {string[]} args
 */
async function run(args) {
    // eslint-disable-next-line
    const [nodejs, thisFile, action, ...restArgs] = args;
    if (!action) return;
    if (action === "scripts") {
        let parallel = false;
        if (!runFromPackageScript) throw `Action "scripts" is required to be run by npm/yarn`;
        const scripts = [];
        for (let i = 0; i < restArgs.length; i++) {
            const arg = restArgs[i];
            if (arg === "--parallel") {
                parallel = true;
                continue;
            }
            if (arg === "--") {
                scripts.push(...restArgs.slice(i + 1));
                break;
            }
            scripts.push(arg);
        }
        const base = [runFromYarn ? "yarn" : "npm", "run", "--silent"];
        if (runFromYarn) base.splice(1, 0, "--ignore-engines");
        if (parallel) return Promise.all(scripts.map((script) => exec([...base, script]).promise));
        for (const script of scripts) execSync([...base, script]);
        return;
    }
    if (action === "env") {
        const envKeys = Object.keys(process.env).sort();
        for (const key of envKeys) console.log(`${key}=${process.env[key]}`);
        return;
    }
    throw `Unknown action: "${action}"`;
}

exports.isWin32 = isWin32;
exports.exec = exec;
exports.execSync = execSync;
exports.isTrue = isTrue;
exports.run = run;
if (typeof require !== "undefined" && require.main === module) {
    run(process.argv).catch((error) => {
        console.error(typeof error === "string" ? `Error: ${error}` : error);
        process.exit(1);
    });
}
//#endregion main
