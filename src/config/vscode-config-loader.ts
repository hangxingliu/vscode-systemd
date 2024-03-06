import { ExtensionContext, window, workspace } from "vscode";
import { parseRegExp } from "../utils/regexp";
import { BooleanStyleEnum, getRuntimeConfigValue, vscodeConfigNS } from "./vscode-config";

export class ExtensionConfig {
    private static _instance: ExtensionConfig;
    static init(context: ExtensionContext) {
        if (!ExtensionConfig._instance) ExtensionConfig._instance = new ExtensionConfig(context);
        return ExtensionConfig._instance;
    }
    static get instance() {
        if (!ExtensionConfig._instance) throw new Error(`ExtensionConfig hasn't been initialized`);
        return ExtensionConfig._instance;
    }

    //#region vscode configurations
    lintDirectiveKeys: boolean;
    podmanCompletion: boolean;
    booleanStyle: BooleanStyleEnum;

    readonly customDirectiveKeys: string[] = [];
    readonly customDirectiveRegexps: RegExp[] = [];
    //#endregion vscode configurations
    constructor(private context: ExtensionContext) {
        this.reload();
    }

    reload = () => {
        const config = workspace.getConfiguration(vscodeConfigNS);
        this.podmanCompletion = getRuntimeConfigValue(config, "podman.completion");
        this.booleanStyle = getRuntimeConfigValue(config, "style.boolean");

        {
            const key = "directive-keys.lint" as const;
            this.lintDirectiveKeys = config.has(key)
                ? getRuntimeConfigValue(config, key)
                : getRuntimeConfigValue(config, "lintDirectiveKeys");
        }

        let customKeys: string[];
        {
            const key = "directive-keys.custom" as const;
            customKeys = config.has(key)
                ? getRuntimeConfigValue(config, key)
                : getRuntimeConfigValue(config, "customDirectiveKeys");
        }
        const { customDirectiveKeys, customDirectiveRegexps } = this;
        customDirectiveKeys.length = 0;
        customDirectiveRegexps.length = 0;
        for (const key of customKeys) {
            if (typeof key !== "string") continue;
            if (key.startsWith("/")) {
                try {
                    customDirectiveRegexps.push(parseRegExp(key));
                } catch (error) {
                    window.showErrorMessage(`Systemd: Invalid regular expression "${key}" in configurations"`);
                }
            } else {
                customDirectiveKeys.push(key);
            }
        }

        console.log(
            `Loaded ${customDirectiveKeys.length} custom directives and ${customDirectiveRegexps.length} custom regexps`
        );
    };
}
