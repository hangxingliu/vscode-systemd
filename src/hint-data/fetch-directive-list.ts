import { manpageURLs } from "./manpage-url";
import {
    AssertLevel,
    assertLength,
    findElements,
    getHTMLDoc,
    matchElementsByText,
    print,
} from "../utils/crawler-utils";
import { MapList } from "../utils/data-types";

const directiveHeadings: string[] = [
    // Name
    "Unit directives",
    "Options on the kernel command line",
    // SMBIOS Type 11 Variables
    // Environment variables
    // System Credentials
    // EFI variables
    "Home Area/User Account directives",
    "UDEV directives",
    "Network directives",
    "Journal fields",
    "PAM configuration directives",
    "/etc/crypttab, /etc/veritytab and /etc/fstab options",
    "systemd.nspawn(5) directives",
    "Program configuration options",
    // Command line options
    // Constants
    // DNS resource record types
    "Miscellaneous options and directives",
    // Specifiers
    // Files and directories
    // D-Bus interfaces
    // D-Bus methods
    // D-Bus properties
    // D-Bus signals
    // Colophon
];

export type RawManPageInfo = {
    id: number;
    pageUri: string;
    pageName: string;
    directiveNames: string[];
};
export type RawDirectiveLink = {
    directiveName: string;
    pageId: number;
};

export async function fetchDirectivesList() {
    let total = 0;
    const manPages: RawManPageInfo[] = [];
    const directives = new MapList<RawDirectiveLink>();

    const $ = await getHTMLDoc("directives docs", manpageURLs.directives);
    print.start("extracting all directives");

    const allH2 = findElements($, "h2", ">=26");
    assertLength("all <h2>", allH2, 26, AssertLevel.WARNING);

    const directivesH2 = matchElementsByText(allH2, directiveHeadings, {});
    for (const h2 of directivesH2) {
        const $h2 = $(h2);
        const h2Name = $h2.text().trim();

        const dtArray = findElements($h2.parent(), "dl.variablelist > dt", ">1", `h2"${h2Name}"`).toArray();
        for (const dt of dtArray) {
            const $dt = $(dt);
            const elText = $dt.text();
            if (!dt.attribs.id) throw new Error(`The id attribute of dt "${elText}" is empty`);

            const baseName = `dt"${elText}"`;
            const $term = findElements($dt, "span.term", "==1", baseName);
            const termText = $term.text().trim();

            if (!termText.match(/^([\w\s\$\%\{\}\-\.\+"']+)=?$/)) throw new Error(`Invalid term text "${termText}"`);
            // it is not a directive
            if (termText.indexOf("=") < 0) continue;
            if (!termText.endsWith("=")) throw new Error(`Invalid term text "${termText}"`);

            const directiveName = termText.slice(0, -1);
            const $linkContainer = $dt.next("dd");
            assertLength(`${baseName}.next(dd)`, $linkContainer, "==1");

            const $links = findElements($linkContainer, "a", ">=1", `${baseName}.next(dd).a`).toArray();
            for (const it of $links) {
                const pageName = $(it).text();
                // ignore special pages
                // if (pageName === 'systemd.net-naming-scheme(7)') continue;

                let pageUri = it.attribs.href;
                if (!pageUri) throw new Error(`Invalid link element in ${baseName}`);

                let index = pageUri.indexOf("#");
                if (index >= 0) pageUri = pageUri.slice(0, index);

                index = pageUri.indexOf("?");
                if (index >= 0) pageUri = pageUri.slice(0, index);

                let manPage = manPages.find((it) => it.pageUri === pageUri);
                if (manPage) {
                    manPage.directiveNames.push(directiveName);
                } else {
                    manPage = { id: manPages.length + 1, pageUri, pageName, directiveNames: [directiveName] };
                    manPages.push(manPage);
                }
                directives.push(directiveName, { directiveName, pageId: manPage.id });
                total++;
            }
        }
    }

    return { total, directives, manPages };
}
