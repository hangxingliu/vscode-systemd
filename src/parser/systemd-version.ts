export type ParsedSystemdVersion = {
    major: number;
    minor?: number;
};

export function parseSystemdVersion(rawVersion?: string | number): ParsedSystemdVersion | undefined {
    if (typeof rawVersion === "number") {
        if (Number.isNaN(rawVersion) || rawVersion < 1) return;
        if (Number.isSafeInteger(rawVersion)) return { major: rawVersion };
        rawVersion = String(rawVersion);
    }

    if (typeof rawVersion === "string" && !/^latest$/i.test(rawVersion)) {
        const match = rawVersion
            .replace(/^\s*v(?:er(?:sion)?)?/i, "")
            .replace(/^\s*systemd/i, "")
            .trim()
            .match(/^([1-9]\d*)(?:\.(\d+))?/);

        if (match) {
            const major = parseInt(match[1], 10);
            if (!Number.isSafeInteger(major)) return;

            const result: ParsedSystemdVersion = { major };
            if (match[2]) {
                const minor = parseInt(match[2], 10);
                if (Number.isSafeInteger(minor)) result.minor = minor;
            }
            return result;
        }
    }
}
