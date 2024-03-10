import { cacheDir } from "../config/fs";
import { SimpleHttpCache, enableHTMLSupportedInMarkdown, getHTMLDoc, matchElementsByText, toMarkdown } from "../utils/crawler-utils";


main().catch((error) => {
    console.error(error.stack);
    process.exit(1);
});

async function main() {
    SimpleHttpCache.init(cacheDir);
    enableHTMLSupportedInMarkdown();

    const url = 'https://www.freedesktop.org/software/systemd/man/latest/systemd.netdev.html';

    const $ = await getHTMLDoc("systemd.netdev.html", url);
    const all$h2 = $('h2');
    const [h2] = matchElementsByText(all$h2, ['Supported netdev kinds'], {
        allowMissing: false,
        allowDuplicate: false,
    });
    const $h2 = $(h2);
    const $td = $h2.parent().find('table tbody tr td');
    console.log($td.length);

    const result: Record<string, string> = {};
    for (let i = 0; i < $td.length; i += 2) {
        const key = $td.eq(i).text();
        const desc = $td.eq(i + 1).html();
        const descMarkdown = toMarkdown(desc || '');
        result[key] = descMarkdown;
    }
    console.log(result)
}
