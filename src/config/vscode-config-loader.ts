import { ExtensionContext, window, workspace, EventEmitter, Disposable, ConfigurationChangeEvent } from "vscode";
import { parseRegExp } from "../utils/regexp";
import { BooleanStyleEnum, getRuntimeConfigValue, vscodeConfigNS } from "./vscode-config";
import { parseSystemdVersion } from "../parser/systemd-version";

export interface ExtensionParsedConfig {
    version: number;
    podmanCompletion: boolean;
    booleanStyle: BooleanStyleEnum;
    lintDirectiveKeys: boolean;
    customDirectives: string[];
}

export type ReloadedConfigEvent = {
    prev: Readonly<ExtensionParsedConfig>;
    config: Readonly<ExtensionConfig>;
};

export class ExtensionConfig extends EventEmitter<ReloadedConfigEvent> implements ExtensionParsedConfig {
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

    //
    //#region vscode configurations
    version: number;
    podmanCompletion: boolean;
    booleanStyle: BooleanStyleEnum;
    lintDirectiveKeys: boolean;
    customDirectives: string[] = [];
    // parsed and transformed:
    readonly customDirectiveKeys: string[] = [];
    readonly customDirectiveRegexps: RegExp[] = [];
    //#endregion vscode configurations
    //
    constructor(private context: ExtensionContext) {
        super();
        this.reload(false);
        this.subscriptions.push(workspace.onDidChangeConfiguration(this.onDidChangeConfiguration));
    }

    override dispose(): void {
        super.dispose();
        for (const sub of this.subscriptions) sub.dispose();
    }

    readonly snapshot = (): Readonly<ExtensionParsedConfig> => {
        let customDirectives: ExtensionParsedConfig["customDirectives"];
        if (typeof structuredClone === "function") customDirectives = structuredClone(this.customDirectives);
        else customDirectives = JSON.parse(JSON.stringify(this.customDirectives));

        return {
            version: this.version,
            podmanCompletion: this.podmanCompletion,
            booleanStyle: this.booleanStyle,
            lintDirectiveKeys: this.lintDirectiveKeys,
            customDirectives,
        };
    };

    private readonly onDidChangeConfiguration = (e: ConfigurationChangeEvent) => {
        if (!e.affectsConfiguration(vscodeConfigNS)) return;
        this.reload(true);
    };

    private readonly reload = (fireEvent: boolean) => {
        const config = workspace.getConfiguration(vscodeConfigNS);
        const prev = this.snapshot();
        this.podmanCompletion = getRuntimeConfigValue(config, "podman.completion");
        this.booleanStyle = getRuntimeConfigValue(config, "style.boolean");

        {
            const rawVersion = getRuntimeConfigValue(config, "version");
            const version = parseSystemdVersion(rawVersion);
            this.version = version ? version.major : 0;
            // console.log(`systemd version: ${this.version || "latest"}`);
        }

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
                } catch {
                    window.showErrorMessage(`Systemd: Invalid regular expression "${key}" in configurations"`);
                }
            } else {
                customDirectiveKeys.push(key);
            }
        }

        console.log(
            `Loaded ${customDirectiveKeys.length} custom directives and ${customDirectiveRegexps.length} custom regexps`
        );
        if (fireEvent) this.fire({ prev, config: this });
    };
}
