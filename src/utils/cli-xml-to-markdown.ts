//
// This is a command line tool for converting xslt xml to markdown
// https://linux.die.net/man/1/xsltproc
//


// <literal>name</literal> => `name`
// <option>name</option> => `name`
// <varname>MemoryAccounting=</varname> => `MemoryAccounting=`
// <filename>user@.service</filename> => `user@.service`
// <constant>AF_INET</constant> => `AF_INET`
//
// <ulink url="https://test.com">Test<ulink> => [Test](https://test.com)
// <citerefentry><refentrytitle>systemd.unit</refentrytitle><manvolnum>5</manvolnum></citerefentry> =>
//    [systemd.unit(5)](..../systemd.unit.html)
//
// <emphasis>enable</emphasis> => *enable*
// <replaceable>nnn</replaceable> => *nnn*
//
// <command>systemd</command> => **systemd**
//
// <itemizedlist><listitem>...</listitem></itemizedlist> => - ...
// <orderedlist><listitem>...</listitem></orderedlist> => 1. ...
// <programlisting>...</programlisting> =>
//     ``` ... ```


import * as fs from "fs";
import * as escapeHTML from "escape-html";
import { load } from "cheerio";
import { ChildNode, NodeWithChildren } from "domhandler";
import { resolveURL, toMarkdown } from "./crawler-utils";
import { manpageURLs } from "../hint-data/manpage-url";

type State = {
    uriBase: string;
    list: Array<"ol" | "ul">;
    html: string;
};
const state: State = {
    uriBase: manpageURLs.base,
    list: [],
    html: "",
};

const stdin = fs.readFileSync(0, "utf-8");
const $ = load(stdin, { xmlMode: true });
handle($._root, state);
const html = state.html; // minifierHTML(state.html);
const markdown = toMarkdown(html);

// console.error("\n\n");
// console.log(html);
// console.error(markdown);
// console.error("\n\n");
console.log(JSON.stringify(markdown));

function handle(node: ChildNode, state: State) {
    if (node.type === "text") {
        const html = $.html(node);
        state.html += html;
        return;
    }

    if (node.type === "root") return enterChildren(node);
    if (node.type === "tag") {
        switch (node.tagName) {
            case "listitem": {
                if (state.list.length > 0) useTag(node, "li");
                else enterChildren(node);
                return;
            }
            case "itemizedlist": {
                state.list.push("ul");
                useTag(node, "ul");
                return;
            }
            case "orderedlist": {
                state.list.push("ol");
                useTag(node, "ol");
                return;
            }
            case "para":
                return useTag(node, "p");
            case "literal":
                state.html += '"';
                useTag(node, "code", `class="${node.tagName}"`);
                state.html += '"';
                return;
            case "varname":
            case "filename":
            case "option":
            case "constant":
                return useTag(node, "code", `class="${node.tagName}"`);
            case "programlisting":
                state.html += "<pre>";
                useTag(node, "code");
                state.html += "</pre>";
                return;
            case "emphasis":
            case "replaceable":
                return useTag(node, "em");
            case "command":
                return useTag(node, "strong");
            case "ulink":
                return useTag(node, "a", `href="${escapeHTML(node.attribs.url || "#")}"`);
            case "citerefentry": {
                const titleBase = $(node).children("refentrytitle").text();
                const titleNum = $(node).children("manvolnum").text();
                const link = resolveURL(state.uriBase, `${titleBase}.html`);
                const title = `${titleBase}(${titleNum})`;
                state.html += `<a href="${escapeHTML(link)}">${escapeHTML(title)}</a>`;
                return;
            }
        }
        console.error(node.tagName, $(node).html());
        return;
    }
    console.error(node.type);

    function enterChildren(node: NodeWithChildren) {
        node.childNodes.forEach((node) => handle(node, state));
    }
    function useTag(node: NodeWithChildren, tagName: string, attrs?: string) {
        state.html += `<${tagName}${attrs ? ` ${attrs}` : ""}>`;
        node.childNodes.forEach((node) => handle(node, state));
        state.html += `</${tagName}>`;
    }
}
