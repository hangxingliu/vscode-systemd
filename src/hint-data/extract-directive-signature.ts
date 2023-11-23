/**
 * @param signatureString The text from the elements "dt" on the man pages
 */
export function extractDirectiveSignature(
    signatureString: string
): ReadonlyArray<{ name: string; params: string[] | string }> {
    const result = new Map<string, string[]>();
    for (const part of signatureString.split(/,\s+/)) {
        if (part.startsWith("--")) continue; // cli options
        if (part.match(/^\$\w+(?:=\w*)?$/)) continue; // environment variables
        const mtx = part.match(/^([^\[=]+)(?:=(.*)|\[=\])?$/);
        if (!mtx) throw new Error(`Invalid directive "${signatureString}"`);

        const directive = mtx[1];
        const params = mtx[2] || "";
        if (!directive.match(/^[\w-]+(?:\.[\w-]+){0,3}$/)) throw new Error(`Invalid directive name "${directive}"`);

        const savedParams = result.get(directive);
        if (savedParams) savedParams.push(params);
        else result.set(directive, [params]);
    }

    const entries = Array.from(result.entries());
    return entries.map(([name, params]) => {
        if (params.length > 1) return { name, params };
        return { name, params: params[0] };
    });
}
