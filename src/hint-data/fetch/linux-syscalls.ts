#!/usr/bin/env node

import { cacheDir, hintDataDir } from "../../config/fs";
import { getManPageURL } from "../manpage-url";
import {
    print,
    SimpleHttpCache,
    getHTMLDoc,
    matchElementsByText,
    assertLength,
    enableHTMLSupportedInMarkdown,
    getMarkdownHelpFromElement,
} from "../../utils/crawler-utils";
import { resolve } from "path";
import { writeFileSync } from "fs";
import syscallDocs from "./utils/syscall-docs";

main().catch((error) => {
    console.error(error.stack);
});
async function main() {
    SimpleHttpCache.init(cacheDir);
    enableHTMLSupportedInMarkdown();

    const $ = await getHTMLDoc("syscalls", getManPageURL("syscalls(2)"));
    print.start("extracting all syscalls");

    const $h2 = assertLength("body > h2", $("body > h2"), ">1");
    const matchedH2 = matchElementsByText($h2, ["DESCRIPTION"], {
        allowDuplicate: false,
        allowMissing: false,
        deleteSubstr: ["top"],
    })[0];
    const $pre = $(matchedH2).next("pre");
    // console.log($pre.html());

    // System call                 Kernel        Notes
    // ...
    // On many platforms, including x86-32, socket ...
    const regex = /(System call\s+Kernel\s+)Notes.+\n([\s\S]+)On many platforms/i;
    const matchedList = ($pre.html() || "").match(regex);
    if (!matchedList) throw new Error(`Failed to match capabilities from the html by ${regex}`);

    const widthOf2Cols = matchedList[1].length;
    const lines = matchedList[2].split(/\n/);
    // for (const line of lines) console.log(">>>", line);

    const localDocs = new Map<string, string>();
    syscallDocs.forEach((it) => {
        for (const name of it.names) localDocs.set(name, it.docs);
    });

    type Syscall = {
        //
        name: string;
        url: true | string | null;
        version?: string;
        docs: string | null;
        notes: string | null;
    };
    const syscalls: Syscall[] = [];
    let last: Syscall | undefined;
    for (let line of lines) {
        const forLast = line.startsWith("                                ");

        let url: true | string | null = null;
        line = line.trim();

        if (forLast) {
            if (last) last.notes += line;
            continue;
        }

        if (!line) continue;
        if (line.startsWith("──────────────────")) continue;

        const $line = $.load(line);
        if (line.startsWith("<a")) url = $line("a").attr("href") || null;

        const txt = $line.text();
        const first2cols = txt.slice(0, widthOf2Cols);
        const notes = txt.slice(widthOf2Cols);
        // console.log([first2cols, notes]);

        const regexp = /^(\w+)\(\d\)\s+((?:[\d\.]+;?\s?)+)?\s*$/;
        const match = first2cols.match(regexp);
        if (!match) throw new Error(`Invalid row: ${JSON.stringify(first2cols)}`);

        const name = match[1];
        const versions = match[2] || "";
        if (last) syscalls.push(last);
        if (url === `../man2/${name}.2.html`) url = true;

        let docs = localDocs.get(name) || "";

        //#region get docs from online site
        if (!docs && url) {
            let fetch: string;
            if (url === true) fetch = getManPageURL(`${name}(2)`);
            else fetch = url;

            const $syscall = await getHTMLDoc(`syscall "${name}"`, fetch);
            print.start(`getting help for syscall "${name}"`);

            const $h2 = $syscall("h2");
            const matchedH2 = matchElementsByText($h2, ["NAME"], {
                deleteSubstr: ["top"],
            })[0];
            if (!matchedH2) throw new Error(`no "NAME" section for the syscall "${name}"`);

            const info = $(matchedH2).next("pre").text();
            if (!info) throw new Error(`no text in "NAME" section for the syscall "${name}"`);

            const match = info.match(/\-\s*([\s\S]+)$/);
            if (!match) throw new Error(`Invalid text: ${JSON.stringify(info)} for the syscall "${name}"`);
            docs = match[1].replace(/\n\s*/g, " ").trim();
        }
        //#endregion

        last = {
            name,
            version: versions,
            url,
            notes: notes.trim(),
            docs,
        };
        continue;
    }
    if (last) syscalls.push(last);
    console.log("\nsyscalls=(" + syscalls.map((it) => JSON.stringify(it.name)).join(" ") + ");\n");
    print.info("copy this syscalls=(...) to analyzer/syscall-docs.sh for re-generating docs ");

    //#region predefined syscall sets
    {
        const $ = await getHTMLDoc("syscall-sets", getManPageURL("systemd.exec(5)", "systemd"));
        print.start("extracting all predefined syscall sets");

        const allTableHeadings = assertLength("table headings", $("body .table .title"), ">=10");
        const matchedHeadings = matchElementsByText(
            allTableHeadings,
            ["Table 4. Currently predefined system call sets"],
            {
                allowDuplicate: false,
                allowMissing: false,
                deleteSubstr: ["top"],
            }
        )[0];
        const $rows = $(matchedHeadings).next().find("table > tbody > tr");
        for (const row of $rows) {
            const $cols = $(row).find("td");
            const name = $cols.eq(0).text();
            const docs = getMarkdownHelpFromElement($cols.eq(1));
            syscalls.push({
                name,
                docs,
                url: true,
                notes: null,
            });
        }
    }
    //#endregion predefined syscall sets
    syscalls.sort((a, b) => a.name.localeCompare(b.name));

    const docs: Record<string, string> = {};
    const tips: Record<string, string> = {};
    for (const syscall of syscalls) {
        let docString = syscall.notes || "";
        if (syscall.docs) {
            if (docString) docString += "   \n";
            docString += syscall.docs;
        }
        docs[syscall.name] = docString;

        let tip = "";
        if (syscall.name.startsWith("@")) {
            // predefined syscall set
            const match = (syscall.docs || "").match(/^(.+?)[\(\[\:\.]/);
            if (match) tip = match[1].trim();
        }
        if (syscall.version && syscall.version !== "1.0") {
            if (tip) tip += " ";
            tip += "Kernal: " + syscall.version;
        }
        if (tip) tips[syscall.name] = tip;
    }
    const code = [
        'import { SystemdValueEnum } from "./types";',
        "",
        "export const systemCallFilter: SystemdValueEnum = {",
        '    manPage: "systemd.exec(5)",',
        '    directive: "SystemCallFilter",',
        '    prefixChars: "~",',
        '    sep: " ",',
        "    docs: " + JSON.stringify(docs, null, 4) + ",",
        "    tips: " + JSON.stringify(tips, null, 4) + ",",
        "};",
        "",
    ];
    const file = resolve(hintDataDir, "custom-value-enum", "common-syscalls.ts");
    writeFileSync(file, code.join("\n"));
}
