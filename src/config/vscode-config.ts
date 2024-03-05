import { ConfigItem, VSCodeConfigs } from "./vscode-config-types";
import type { WorkspaceConfiguration } from "vscode";

export type AllRuntimeConfigs = {
    "podman.enabled": boolean;
    lintDirectiveKeys: boolean;
    customDirectiveKeys: string[];
};
export const vscodeConfigNS = "systemd";
export type VSCodeConfigPath = `${typeof vscodeConfigNS}.${keyof AllRuntimeConfigs}`;
export const allVSCodeConfigs: VSCodeConfigs<AllRuntimeConfigs, typeof vscodeConfigNS> = {
    "systemd.podman.enabled": {
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
