export type CustomSystemdDirective = {
    signature?: string;
    section: string | string[];
    docs: string;
    /**
     * `true` represents:
     * 1. These directives are removed/deprecated very long time ago
     * 2. These directives would be not shown in auto-completion list
     * 3. These directives would be marked as deprecated in syntax level (in grammar file)
     */
    dead?: boolean;
    /**
     * `true` represents:
     * 1. These directives are used for internal or backwards compatibility
     * 2. These directives would be not shown in auto-completion list
     */
    internal?: boolean;
    /** a systemd version string represents this directive is deprecated */
    deprecated?: number;
    fixHelp?: string;

    /** The name of the man page */
    manPage?: string;
    /** The URL of the man page */
    url?: string;
} & (
    | {
          name: string;
          /** The extension can show a code action to automatically rename it */
          renamedTo?: string;
      }
    | {
          name: string[];
          /** The extension can show a code action to automatically rename it */
          renamedTo?: string[];
      }
);
