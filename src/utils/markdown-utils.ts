//#region main
// template: markdown-utils.ts
// author:   hangxingliu
// license:  MIT
// version:  2024-04-13
//
import { load } from "cheerio";
import { decode as decodeHTMLEntities } from "html-entities";

import * as marked from "marked";
import type { Tokens, TokensList } from "marked";
export type { TokensList } from "marked";

export type TokenType = (
    | Tokens.Space
    | Tokens.Code
    | Tokens.Heading
    | Tokens.Table
    | Tokens.Hr
    | Tokens.Blockquote
    | Tokens.List
    | Tokens.ListItem
    | Tokens.Paragraph
    | Tokens.HTML
    | Tokens.Text
    | Tokens.Def
    | Tokens.Escape
    | Tokens.Tag
    | Tokens.Image
    | Tokens.Link
    | Tokens.Strong
    | Tokens.Em
    | Tokens.Codespan
    | Tokens.Br
    | Tokens.Del
)["type"];

const baseOptions: Readonly<marked.MarkedOptions> = {
    pedantic: false,
    gfm: true,
};

export function markdownLexer(markdown: string, options?: marked.MarkedOptions) {
    return marked.lexer(markdown, {
        ...baseOptions,
        ...(options || {}),
    });
}

export type FindTokenFilter = {
    type?: TokenType;
    heading?: number;
    text?: string;

    after?: number | FindTokenResult<marked.Token>;
    /** The matching token is not located after any heading tokens */
    notInNewSection?: boolean;
};
export type FindTokenResult<Token extends marked.Token> = {
    token: Token;
    index: number;
};

type FindFirstArgs = [tokens: TokensList | null | undefined, filter: FindTokenFilter];
export function findFirst<Token extends marked.Token>(
    ...args: [...FindFirstArgs, required: "REQUIRED"]
): FindTokenResult<Token>;
export function findFirst<Token extends marked.Token>(...args: FindFirstArgs): FindTokenResult<Token> | undefined;

export function findFirst<Token extends marked.Token>(
    tokens: FindFirstArgs[0],
    _filter: FindFirstArgs[1],
    required?: "REQUIRED"
): FindTokenResult<Token> | undefined {
    const filter: FindTokenFilter = { ..._filter };
    if (filter.heading) filter.type = "heading";

    const { type, heading } = filter;
    const text = (filter.text || "").trim().replace(/\s+/g, " ");

    let notInNewSection = filter.notInNewSection ? 999 : 0;
    let startIndex = 0;
    if (typeof filter.after === "number") {
        startIndex = filter.after + 1;
    } else if (filter.after) {
        startIndex = filter.after.index + 1;
        const token = filter.after.token;
        if (token.type === "heading") notInNewSection = token.depth;
    }

    if (startIndex < 0) startIndex = 0;
    for (let i = startIndex; tokens && i < tokens.length; i++) {
        const token = tokens[i];
        let ok = true;
        if (type && token.type !== type) ok = false;
        if (ok && heading && (token as Tokens.Heading).depth !== heading) ok = false;
        if (ok && text) {
            const tokenText = ((token as Tokens.Paragraph).text || "").trim().replace(/\s+/g, " ");
            if (tokenText !== text) ok = false;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (ok) return { token: token as any, index: i };
        if (notInNewSection && token.type === "heading" && token.depth <= notInNewSection) break;
    }
    if (!required) return;

    const msg = [`Failed to find token from the markdown with following filters:`];
    if (filter.heading) msg.push(`type="h${filter.heading}`);
    else if (filter.type) msg.push(`type="${filter.type}"`);
    if (filter.text) msg.push(`text=${JSON.stringify(filter.text)}`);
    if (filter.after && typeof filter.after === "object") {
        const token = filter.after.token;
        msg.push(`after=${"text" in token ? JSON.stringify(token.text) : token.type}`);
    }
    if (startIndex > 0) {
        msg.push(`startIndex=${startIndex}`);
    }
    if (notInNewSection) msg.push(`notInNewSection`);
    throw new Error(msg.join(" "));
}

export function getTokensInSection(markdownTokens: TokensList, headingIndex: number) {
    const token = markdownTokens[headingIndex];
    if (!token || token.type !== "heading") throw new Error(`tokens[${headingIndex}] is not a heading`);
    const depth = token.depth;
    const tokens: marked.Token[] = [];
    for (let i = headingIndex + 1; i < markdownTokens.length; i++) {
        const t = markdownTokens[i];
        if (t.type === "heading" && t.depth <= depth) break;
        tokens.push(t);
    }
    return tokens;
}

function htmlToPlainText(html: string) {
    const text = load(html, { decodeEntities: false }).text();
    if (text.match(/^\s*$/)) return "";
    return text.replace(/(^\n+|\n+$)/g, "");
}
function markdownTextToPlainText(text: string) {
    return decodeHTMLEntities(text).replace(/\n/g, " ");
}
function buildMarkdownForRefs(refs?: string | marked.Links) {
    if (typeof refs === "object" && refs) {
        const entries = Object.entries(refs);
        let result = "\n\n";
        for (const [name, link] of entries) result += `[${name}]: ${link.href}\n`;
        return result;
    }
    return typeof refs === "string" ? refs : "";
}

export function toHTML(tokens: TokensList | marked.Token[], refs?: string | marked.Links) {
    if (!refs && "links" in tokens) refs = buildMarkdownForRefs(tokens.links);
    else refs = buildMarkdownForRefs(refs);
    const markdown: string[] = [];
    for (const token of tokens) markdown.push(token.raw);
    if (refs) markdown.push(refs);
    return marked.marked(markdown.join(""), baseOptions);
}

export function toPlainText(tokens: TokensList | marked.Token[], refs?: string | marked.Links) {
    if (!refs && "links" in tokens) refs = buildMarkdownForRefs(tokens.links);
    else refs = buildMarkdownForRefs(refs);

    let result = "";
    for (const token of tokens) {
        switch (token.type) {
            case "hr":
            case "br":
            case "space": // raw: '\n\n'
                result += "\n";
                break;
            case "text":
            case "image":
                result += markdownTextToPlainText(token.text);
                break;
            case "codespan":
            case "escape":
                result += token.text;
                break;
            case "code":
                result += token.text.replace(/(^\n|\n$)/g, "");
                break;
            case "link":
            case "strong":
            case "del":
            case "em": {
                if (token.tokens) result += toPlainText(token.tokens, refs);
                else result += token.text;
                break;
            }
            case "blockquote":
            case "heading": {
                if (token.tokens) result += toPlainText(token.tokens, refs) + "\n";
                else result += token.text + "\n";
                break;
            }
            case "list_item": {
                // a small patch for list_item
                if (token.tokens) {
                    for (const t of token.tokens) result += toPlainText(markdownLexer(t.raw + refs), refs);
                } else {
                    result += token.text + " ";
                }
                break;
            }
            case "paragraph": {
                if (token.tokens) result += toPlainText(token.tokens, refs) + " ";
                else result += token.text + " ";
                break;
            }
            case "list": {
                if (Array.isArray(token.items))
                    result += token.items.map((it) => toPlainText([it], refs)).join("\n") + "\n";
                break;
            }
            case "html": {
                result += htmlToPlainText(token.text);
                break;
            }
            case "table": {
                const rows: { tokens: marked.Token[] }[][] = [];
                if (token.header?.length > 0) rows.push(token.header);
                if (token.rows?.length > 0) rows.push(...token.rows);
                for (const row of rows) result += row.map((it) => toPlainText(it.tokens, refs)).join("\t") + "\n";
                break;
            }
            default:
                console.warn(`Unknown token.type: ${token.type}`);
                result += "text" in token ? token.text : "";
        }
    }

    return result.trim();
}
//#endregion main
