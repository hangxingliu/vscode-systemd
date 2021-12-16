import { window, workspace } from "vscode";
import { parseRegExp } from "../utils/regexp";

const defaults = {
    lintDirectiveKeys: false,
    customDirectiveKeys: [] as string[],
    customDirectiveRegexps: [] as RegExp[],
}

export class ExtensionConfig {

    //#region vscode configurations
    lintDirectiveKeys: boolean
    customDirectiveKeys: string[]
    customDirectiveRegexps: RegExp[]
    //#endregion vscode configurations

    init = () => {
        Object.keys(defaults).forEach(key => {
            let v = defaults[key];
            if (Array.isArray(v)) v = v.map(it => it);
            else if (v && typeof v === 'object') v = Object.assign({}, v);
            this[key] = v;
        });
    }

    reload = () => {
        const config = workspace.getConfiguration('systemd');

        this.init();
        this.lintDirectiveKeys = config.get('lintDirectiveKeys', false);
        const customKeys = config.get('customDirectiveKeys', []);
        for (let i = 0; i < customKeys.length; i++) {
            const key = customKeys[i];
            if (typeof key !== 'string') continue;
            if (key.startsWith('/')) {
                try {
                    this.customDirectiveRegexps.push(parseRegExp(key));
                } catch (error) {
                    window.showErrorMessage(`Systemd: Invalid regular expression "${key}" in configurations"`);
                }
            } else {
                this.customDirectiveKeys.push(key);
            }
        }
        console.log(`Loaded ${this.customDirectiveKeys.length} custom directives and ${this.customDirectiveRegexps.length} custom regexps`);
    }

    constructor() {
        this.init();
    }

    private static _instance: ExtensionConfig;
    static get() {
        if (!ExtensionConfig._instance) ExtensionConfig._instance = new ExtensionConfig();
        return ExtensionConfig._instance;
    }
}
