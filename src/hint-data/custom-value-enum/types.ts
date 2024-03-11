import type { SystemdFileType } from "../../parser/file-info";
import type { PredefinedSignature } from "../types-manifest";

export type SystemdValueEnum = {
    //#region Fields for matching the directive
    directive: string | string[];
    section?: string;
    file?: SystemdFileType;
    //#endregion

    /** Enumeration values */
    values?: string[];
    /** Add predefined completion (e.g., boolean) */
    extends?: PredefinedSignature;
    /** The documentation for each enumeration value */
    docs?: Record<string, string>;
    /** The short tip for each enumeration value, for example, "default"  */
    tips?: Record<string, string>;
    /**
     * The name of the man page from which these enumeration values come
     * @example "systemd.scope(5)"
     */
    manPage?: string;

    /** The separator supported by this directive */
    sep?: " " | ",";
    /** The prefixes supported by this directive */
    prefixes?: string[];
};
