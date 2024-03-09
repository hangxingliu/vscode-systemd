export type LintDirectiveValueRule = {
    /** @example `[Service]` */
    section?: string;
    /** directive name */
    name: string;
    value: string | RegExp;
    msg: string;
    url?: string;
    deprecated?: boolean;
};

export const lintDirectiveValueRules: ReadonlyArray<LintDirectiveValueRule> = [
    {
        name: "KillMode",
        value: /^none$/i,
        msg:
            "Unit uses KillMode=none. " +
            "This is unsafe, as it disables systemd's process lifecycle management for the service. " +
            "Please update the service to use a safer KillMode=, such as `mixed` or `control-group`. " +
            "Support for KillMode=none is deprecated and will eventually be removed.",
        url: "https://github.com/systemd/systemd/blob/effefa30de46f25d0f50a36210a9835097381c2b/src/core/load-fragment.c#L665",
        deprecated: true,
    },
];
