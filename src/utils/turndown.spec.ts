import { enableHTMLSupportedInMarkdown, toMarkdown } from "./crawler-utils";

enableHTMLSupportedInMarkdown();
const html = `<dd><p>A short human readable title of the unit. This may be used by
        <span class="command"><strong>systemd</strong></span> (and other UIs) as a user-visible label for the unit, so this string
        should identify the unit rather than describe it, despite the name. This string also shouldn't just
        repeat the unit name. "<code class="literal">Apache2 Web Server</code>" is a good example. Bad examples are
        "<code class="literal">high-performance light-weight HTTP server</code>" (too generic) or
        "<code class="literal">Apache2</code>" (meaningless for people who do not know Apache, duplicates the unit
        name). <span class="command"><strong>systemd</strong></span> may use this string as a noun in status messages ("<code class="literal">Starting
        <em class="replaceable"><code>description</code></em>...</code>", "<code class="literal">Started
        <em class="replaceable"><code>description</code></em>.</code>", "<code class="literal">Reached target
        <em class="replaceable"><code>description</code></em>.</code>", "<code class="literal">Failed to start
        <em class="replaceable"><code>description</code></em>.</code>"), so it should be capitalized, and should not be a
        full sentence, or a phrase with a continuous verb. Bad examples include "<code class="literal">exiting the
        container</code>" or "<code class="literal">updating the database once per day.</code>".</p><p><a name="v201"></a>Added in version 201.</p></dd>
        `;
console.log(toMarkdown(html));
