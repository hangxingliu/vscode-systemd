const _PODMAN_BOOLEAN_DIRECTIVES = new Set([
    "[Container]EnvironmentHost",
    "[Container]NoNewPrivileges",
    "[Container]Notify",
    "[Container]ReadOnly",
    "[Container]ReadOnlyTmpfs",
    "[Container]RunInit",
    "[Container]StartWithPod",

    "[Kube]KubeDownForce",

    "[Network]DisableDNS",
    "[Network]Internal",
    "[Network]IPv6",

    "[Volume]Copy",

    "[Build]ForceRM",
    "[Build]TLSVerify",

    "[Image]AllTags",
    "[Image]TLSVerify",
]);
export function doesPodmanDirectiveAcceptsBoolean(section: string, directive: string) {
    return _PODMAN_BOOLEAN_DIRECTIVES.has(`[${section}]${directive}`);
}

/**
 * @param signatureString The text from the elements "dt" on the man pages
 */
export function extractDirectiveSignature(signatureString: string): ReadonlyArray<{ name: string; params: string[] }> {
    const result = new Map<string, string[]>();
    for (const part of signatureString.split(/,\s+/)) {
        if (part.startsWith("--")) continue; // cli options
        if (/^-\w$/.test(part)) continue; // cli options
        if (part.match(/^\$\w+(?:=\w*)?$/)) continue; // environment variables
        const mtx = part.match(/^([^\[=]+)(?:=(.*)|\[=\])?$/);
        if (!mtx) throw new Error(`Invalid directive "${signatureString}"`);

        const directive = mtx[1];
        const params = mtx[2] || "";
        if (!directive.match(/^[\w-]+(?:\.[\w-]+){0,3}$/)) throw new Error(`Invalid directive name "${directive}"`);

        const savedParams = result.get(directive);
        if (savedParams) savedParams.push(params);
        else if (params) result.set(directive, [params]);
        else result.set(directive, []);
    }

    const entries = Array.from(result.entries());
    return entries.map(([name, params]) => ({ name, params }));
}

/**
 * Check if a directive accepts boolean value from its documentation
 */
export function isBooleanArgument(docs: string | undefined) {
    if (!docs) return false;
    // mistake: Takes an boolean value. When true, the kernel ignores multicast groups handled by userspace. ...
    if (docs.match(/\btakes?\s+(an?\s+)?bool(?:ean)\s+(value|arguments?|parameter)/i)) return true;
    if (docs.match(/\btakes\s+an?\s+bool(?:ean)\./i)) return true;
    return false;
}

/**
 * https://github.com/systemd/systemd/blob/9529ae85f0a31720b7b17b71aef9ef4513473506/man/version-info.xml
 */
export function extractVersionInfoFromMarkdown(name: string, docsMarkdown: string) {
    let sinceVersion: number | undefined;
    docsMarkdown = docsMarkdown.replace(/\s*Added\s+in\s+version\s+(\d+)\.?\s*$/gi, (_, _v) => {
        const version = parseInt(_v, 10);
        if (!Number.isInteger(version) || version < 183)
            throw new Error(`Invalid version "${_v}" of the directive "${name}"`);
        // if (typeof sinceVersion === "number") throw new Error(`Duplicate version in the directive "${text}"`);
        sinceVersion = version;
        return "";
    });
    return { markdown: docsMarkdown, version: sinceVersion };
}
