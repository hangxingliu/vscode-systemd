import { VSCodeConfigs } from "./vscode-config-types";
import type { WorkspaceConfiguration } from "vscode";

export type AllRuntimeConfigs = {
    lintDirectiveKeys: boolean;
    customDirectiveKeys: string[];
    enablePodman: boolean;
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
    "systemd.enablePodman": {
        title: "Enable Podman Systemd Directives/Sections",
        type: "boolean",
        default: false,
        markdownDescription: [
            `[Podman](https://docs.podman.io/en/latest/index.html) is a daemonless, `,
            `open source, Linux native tool designed to make it easy to find, run, build, `,
            `share and deploy applications using Open Containers Initiative (OCI) Containers `,
            `and Container Images.   \n`,
            `Enable this config to tell this extension to activate the following features:\n`,
            `1. Treat "*.container"/"*.volume"/"*.kube" as systemd configuration\n`,
            `2. Highlight and hint all Podman sections/directives during editing of systemd configuration`,
        ].join(""),
    },
};

export function getRuntimeConfigValue<ConfigId extends keyof AllRuntimeConfigs>(
    configs: WorkspaceConfiguration,
    id: ConfigId
): AllRuntimeConfigs[ConfigId] {
    const prop = allVSCodeConfigs[`${vscodeConfigNS}.${id}`];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let defaults: any = prop.default;
    if (defaults) {
        if (Array.isArray(defaults)) defaults = [...defaults];
        else if (typeof defaults === "object") defaults = { ...defaults };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configValue = configs.get<any>(id, defaults);
    if (configValue && prop.enum) if (!prop.enum.includes(configValue)) return defaults;
    return configValue;
}
