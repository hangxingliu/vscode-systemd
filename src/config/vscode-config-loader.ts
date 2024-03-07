import { ExtensionContext, window, workspace, EventEmitter, Disposable, ConfigurationChangeEvent } from "vscode";
import { parseRegExp } from "../utils/regexp";
import { BooleanStyleEnum, getRuntimeConfigValue, vscodeConfigNS } from "./vscode-config";

export type ReloadedConfigEvent = {
    // noop now
};

export class ExtensionConfig extends EventEmitter<ReloadedConfigEvent> {
    private static _instance: ExtensionConfig;
    static init(context: ExtensionContext) {
        if (!ExtensionConfig._instance) ExtensionConfig._instance = new ExtensionConfig(context);
        return ExtensionConfig._instance;
    }
    static get instance() {
        if (!ExtensionConfig._instance) throw new Error(`ExtensionConfig hasn't been initialized`);
        return ExtensionConfig._instance;
    }
    private readonly subscriptions: Disposable[] = [];

    //#region vscode configurations
    lintDirectiveKeys: boolean;
    podmanCompletion: boolean;
    booleanStyle: BooleanStyleEnum;

    readonly customDirectiveKeys: string[] = [];
    readonly customDirectiveRegexps: RegExp[] = [];
    //#endregion vscode configurations
    constructor(private context: ExtensionContext) {
        super();
        this.reload(false);
        this.subscriptions.push(workspace.onDidChangeConfiguration(this.onDidChangeConfiguration));
    }

    override dispose(): void {
        super.dispose();
        for (const sub of this.subscriptions) sub.dispose();
    }

    readonly onDidChangeConfiguration = (e: ConfigurationChangeEvent) => {
        if (!e.affectsConfiguration(vscodeConfigNS)) return;
        this.reload(true);
    };

    readonly reload = (fireEvent: boolean) => {
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
        if (fireEvent) this.fire({});
    };
}
