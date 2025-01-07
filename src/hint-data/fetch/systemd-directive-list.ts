import { manpageURLs } from "../manpage-url";
import {
    AssertLevel,
    assertLength,
    diagnosisElements,
    findElements,
    getHTMLDoc,
    matchElementsByText,
    print,
} from "../../utils/crawler-utils";
import { MapList } from "../../utils/data-types";
import { CrawlerDiagnosisFile } from "../../utils/crawler-utils-diagnosis-file.js";

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
    const diagnosis = CrawlerDiagnosisFile.get(true);

    const $ = await getHTMLDoc("directives docs", manpageURLs.directives);
    print.start("extracting all directives");

    const allH2 = findElements($, "h2", ">=24");
    assertLength("all <h2>", allH2, 26, AssertLevel.WARNING);
    diagnosisElements(allH2);

    const directivesH2 = matchElementsByText(allH2, directiveHeadings, {});
    for (const h2 of directivesH2) {
        const $h2 = $(h2);
        const h2Name = $h2.text().trim();
        // console.log('>>>', h2Name)

        const dtArray = findElements($h2.parent(), "dl.variablelist > dt", ">1", `h2"${h2Name}"`).toArray();
        for (const dt of dtArray) {
            const $dt = $(dt);
            const elText = $dt.text();
            if (!dt.attribs.id) throw new Error(`The id attribute of dt "${elText}" is empty`);

            const baseName = `dt"${elText}"`;
            const $term = findElements($dt, "span.term", "==1", baseName);
            const termText = $term.text().trim();

            // Examples:
            // Encrypt=
            // ID_NET_NAME_ALLOW_sysfsattr=BOOL   (Actually the sys)
            // udev.conf.*
            if (!termText.match(/^([\w\s\$\%\{\}\-\.\+"']+)=?(?:BOOL)?$/) && !termText.match(/^([\w\.\*]+)/))
                throw new Error(`Invalid term text "${termText}"`);
            // it is not a directive
            if (termText.indexOf("=") < 0) continue;

            const termReplaceable = $term.find(".replaceable");
            if (termReplaceable.length > 0) print.warn(`"${termText}" has ".replaceable" text`);

            const directiveName = termText.slice(0, termText.indexOf("="));
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
                    manPage = { id: 0, pageUri, pageName, directiveNames: [directiveName] };
                    manPages.push(manPage);
                }
                directives.push(directiveName, { directiveName, pageId: manPage.id });
                total++;
            }
        }
    }
    manPages.sort((a, b) => a.pageName.localeCompare(b.pageName));
    manPages.forEach((it, index) => it.id = index + 1);

    diagnosis.count("directives", directives);
    diagnosis.count("manPages", manPages);
    for (const manPage of manPages) {
        diagnosis.write(
            "man-page",
            JSON.stringify({
                name: manPage.pageName,
                uri: manPage.pageUri,
                directives: manPage.directiveNames.length,
            })
        );
    }
    return { total, directives, manPages };
}
