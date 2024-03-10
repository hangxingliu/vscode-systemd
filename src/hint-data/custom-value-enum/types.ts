import type { SystemdFileType } from "../../parser/file-info";
import type { PredefinedSignature } from "../types-manifest";

export type SystemdValueEnum = {
    directive: string;
    values?: string[];
    extends?: PredefinedSignature;
    desc?: Record<string, string>;
    section?: string;
    file?: SystemdFileType;
    manPage?: string;
    /** Separators */
    sep?: " " | ",";
    /** Supported prefixes */
    prefixes?: string[];
};
