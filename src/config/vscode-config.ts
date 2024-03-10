import { manpageURLs } from "../hint-data/manpage-url";
import { ConfigItem, ConfigScope, VSCodeConfigs } from "./vscode-config-types";
import type { WorkspaceConfiguration } from "vscode";

export type BooleanStyleEnum = "yes-no" | "true-false" | "on-off" | "1-0";
export type AllRuntimeConfigs = {
    version: number | "latest";
    "podman.completion": boolean;
    "style.boolean": BooleanStyleEnum;
    "directive-keys.lint": boolean;
    "directive-keys.custom": string[];
};

export type DeprecatedRuntimeConfigs = {
    lintDirectiveKeys: boolean;
    customDirectiveKeys: string[];
};

export const vscodeConfigNS = "systemd";
export type VSCodeConfigPath = `${typeof vscodeConfigNS}.${keyof AllRuntimeConfigs}`;

export const all: VSCodeConfigs<AllRuntimeConfigs, typeof vscodeConfigNS> = {
    "systemd.version": {
        title: "Systemd version",
        type: ["number", "string"],
        default: "latest",
        examples: [255, "v255", "latest"],
        scope: ConfigScope.machineOverridable,
        markdownDescription:
            "By adjusting this configuration, the extension will exclusively offer " +
            "directive/option completions that are compatible with this version." +
            "\n\n" +
            "This configuration impacts auto-completion and linting features, but **it doesn't" +
            "affect syntax highlighting**." +
            "\n\n" +
            "This configuration accepts various types of version strings or version number " +
            'and a special value: `"latest"`. And you can determine the version of systemd ' +
            "installed on your OS by running the command: `systemctl --version`.   \n" +
            "Here are some sample values that this configuration accepts:" +
            "\n\n" +
            "- `latest`\n" +
            '- `255`, `"255"`, `"v255"`\n' +
            // https://packages.debian.org/search?keywords=systemd
            '- `"252.22-1~deb12u1"`, `"255.4-1"`\n' +
            // https://launchpad.net/systemd/+packages
            '- `"255.4-1ubuntu4"`\n',
    },
    "systemd.podman.completion": {
        title: "Enable auto completion related to Podman Quadlet",
        type: "boolean",
        default: true,
        markdownDescription:
            "Setting this configuration to `false` can remove ambiguous auto-completion items " +
            `related to [Podman Quadlet](${manpageURLs.podman}).   \n` +
            "It is useful **if you don't work with Podman Quadlet**.\n\n" +
            "You can still manually change the unit type to Podman-related types and " +
            "get auto completion in some unambiguous Podman unit files (e.g., *.container) " +
            "even if this configuration is set to `false`.   \n" +
            "Moreover, this configuration would not affect the syntax highlighting for " +
            "Podman unit files and documentation for Podman related directives/options.",
    },
    "systemd.style.boolean": {
        title: "Set default boolean value style",
        type: "string",
        enum: ["yes-no", "true-false", "on-off", "1-0"],
        default: "yes-no",
        description: "This configuration affects how boolean values are auto-completed",
    },
    "systemd.directive-keys.lint": {
        title: "Enable lint(checker) feature for directive keys",
        type: "boolean",
        default: true,
        description: "Give you warnings if any directive keys don't exist in the systemd",
    },
    "systemd.directive-keys.custom": {
        title: "Custom directive keys",
        type: "array",
        default: ["/^[A-Z_]+$/"],
        examples: [["/^[A-Z_]+$/"], ["custom-key"]],
        description:
            "An array contains case-sensitive strings or regex expressions. The extension will add them to the completion list and lint.",
    },
};

const renameTo = (key: keyof AllRuntimeConfigs) =>
    `This config was renamed to \`${key}\`. It will be removed in early 2025`;
export const deprecated: VSCodeConfigs<DeprecatedRuntimeConfigs, typeof vscodeConfigNS> = {
    "systemd.lintDirectiveKeys": {
        ...all["systemd.directive-keys.lint"],
        description: undefined,
        markdownDeprecationMessage: renameTo("directive-keys.lint"),
    },
    "systemd.customDirectiveKeys": {
        ...all["systemd.directive-keys.custom"],
        description: undefined,
        markdownDeprecationMessage: renameTo("directive-keys.custom"),
    },
};

export function getRuntimeConfigValue<ConfigId extends keyof (AllRuntimeConfigs & DeprecatedRuntimeConfigs)>(
    configs: WorkspaceConfiguration,
    id: ConfigId
): ConfigId extends keyof AllRuntimeConfigs
    ? AllRuntimeConfigs[ConfigId]
    : ConfigId extends keyof DeprecatedRuntimeConfigs
    ? DeprecatedRuntimeConfigs[ConfigId]
    : never {
    const propName = `${vscodeConfigNS}.${id}`;
    const prop: ConfigItem<unknown> = propName in all ? all[propName] : deprecated[propName];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let defaults: any = prop.default;
    if (defaults) {
        if (Array.isArray(defaults)) defaults = [...defaults];
        else if (typeof defaults === "object") defaults = { ...defaults };
    }

    const configValue = configs.get(id, defaults);
    if (configValue && prop.enum) if (!prop.enum.includes(configValue)) return defaults;
    return configValue;
}
