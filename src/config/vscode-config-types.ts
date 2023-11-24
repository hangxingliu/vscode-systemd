//#region main
// template: vscode-config-types.ts
// author:   hangxingliu
// license:  MIT
// version:  2023-11-24
export type VSCodeConfigs<RuntimeConfigs, Namespace extends string> = AddNamespace<
    InferVSCodeConfigs<RuntimeConfigs>,
    Namespace
>;

type Str<T> = T extends string ? T : never;
type AddNamespace<T, Namespace extends string> = {
    [Key in keyof T as `${Namespace}.${Str<Key>}`]: T[Key];
};

type InferVSCodeConfigs<RuntimeConfigs> = {
    [key in keyof RuntimeConfigs]: ConfigItem<InferVSCodeType<RuntimeConfigs[key]>>;
};
type InferVSCodeType<T> = T extends Set<infer ItemType>
    ? ItemType[]
    : T extends Map<string, infer ItemType>
    ? Record<string, ItemType>
    : T;

/** A configuration setting can have one of the following possible scopes: */
export const enum ConfigScope {
    /** Settings that apply to all instances of VS Code and can only be configured in user settings. */
    application = "application",
    /**  Machine specific settings that can be set only in user settings or only in remote settings. For example, an installation path which shouldn't be shared across machines. */
    machine = "machine",
    /** Machine specific settings that can be overridden by workspace or folder settings. */
    machineOverridable = "machine-overridable",
    /**  Windows (instance) specific settings which can be configured in user, workspace, or remote settings. */
    window = "window",
    /** Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings. */
    resource = "resource",
    /** Resource settings that can be overridable at a language level. */
    languageOverridable = "language-overridable",
}

export type JSONSchemaType = "string" | "number" | "boolean" | "array" | "integer" | "object" | "null";

/**
 * @see https://code.visualstudio.com/api/references/contribution-points#contributes.configuration
 * @see https://github.com/microsoft/vscode/blob/main/src/vs/base/common/jsonSchema.ts#L8
 */
export type ConfigItem<Type> = {
    title: string;
    type: JSONSchemaType | JSONSchemaType[];
    /** for defining the default value of a property */
    default: Type;

    scope?: ConfigScope;

    items?: ConfigItem<Type>;
    examples?: unknown[];

    description?: string;
    markdownDescription?: string;
    deprecationMessage?: string;
    markdownDeprecationMessage?: string;

    enum?: Type[];
    enumDescriptions?: string[];
    enumItemLabels?: string[];

    /** for restricting strings to a given regular expression */
    pattern?: string;
    /** for giving a tailored error message when a pattern does not match. */
    patternErrorMessage?: string;

    /** Both categories and the settings within those categories can take an integer order type property, which gives a reference to how they should be sorted relative to other categories and/or settings. */
    order?: number;

    /** for restricting strings to well-known formats */
    format?: "date" | "time" | "ipv4" | "email" | "uri";
    /** minimum and maximum for restricting numeric values */
    minimum?: number;
    /** minimum and maximum for restricting numeric values  */
    maximum?: number;
    /** maxLength, minLength for restricting string length */
    maxLength?: number;
    /** maxLength, minLength for restricting string length */
    minLength?: number;

    /** for controlling whether a single-line inputbox or multi-line textarea is rendered for the string setting in the Settings editor */
    editPresentation?: "multilineText";
};
//#endregion main
