import { ConfigItem, VSCodeConfigs } from "./vscode-config-types";
import type { WorkspaceConfiguration } from "vscode";

export type BooleanStyleEnum = "yes-no" | "true-false" | "on-off" | "1-0";
export type AllRuntimeConfigs = {
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
    "systemd.podman.completion": {
        title: "Enable auto completion related to Podman Quadlet",
        type: "boolean",
        default: true,
        description:
            "Please set this configuration to false if you don't use Podman Quadlet and don't want to see the useless Podman option in the auto-completion list",
        markdownDescription:
            "Setting this configuration to `false` can remove all auto-completion related to " +
            "[Podman Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html)" +
            "\n\nHowever, syntax highlighting for supported Podman Quadlet unit files would **not be affected** by this configuration",
    },
    "systemd.style.boolean": {
        title: "Set default boolean value style",
        type: "string",
        enum: ["yes-no", "true-false", "on-off", "1-0"],
        default: "yes-no",
        description: "This configuration affects how boolean values are auto-completed",
    },
    "systemd.directive-keys.lint": {
        title: "Enable linter feature for directive keys",
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
            "An array contains case-sensitive strings or regex expressions. The extension will add them to the completion list and linter.",
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
