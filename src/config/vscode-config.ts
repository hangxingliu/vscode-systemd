import { ConfigItem, VSCodeConfigs } from "./vscode-config-types";
import type { WorkspaceConfiguration } from "vscode";

export type AllRuntimeConfigs = {
    lintDirectiveKeys: boolean;
    customDirectiveKeys: string[];
};
export const vscodeConfigNS = "systemd";
export type VSCodeConfigPath = `${typeof vscodeConfigNS}.${keyof AllRuntimeConfigs}`;
export const allVSCodeConfigs: VSCodeConfigs<AllRuntimeConfigs, typeof vscodeConfigNS> = {
    "systemd.lintDirectiveKeys": {
        title: "Enable linter feature for directive keys",
        type: "boolean",
        default: true,
        description: "Give you warnings if any directive keys don't exist in the systemd",
    },
    "systemd.customDirectiveKeys": {
        title: "Custom directive keys",
        type: "array",
        default: ["/^[A-Z_]+$/"],
        examples: [["/^[A-Z_]+$/"], ["custom-key"]],
        description:
            "An array contains case-sensitive strings or regex expressions. The extension will add them to the completion list and linter.",
    },
};

export function getRuntimeConfigValue<ConfigId extends keyof AllRuntimeConfigs>(
    configs: WorkspaceConfiguration,
    id: ConfigId
): AllRuntimeConfigs[ConfigId] {
    const prop: ConfigItem<unknown> = allVSCodeConfigs[`${vscodeConfigNS}.${id}`];

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
