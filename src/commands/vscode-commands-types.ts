//#region main
// template: vscode-commands-types.ts
// author:   hangxingliu
// license:  MIT
// version:  2023-11-28
/**
 * @see https://code.visualstudio.com/api/references/contribution-points#contributes.commands
 * @see https://code.visualstudio.com/api/references/icons-in-labels
 */
export type CommandItem<CommandFullName = string> = {
    command: CommandFullName;
    title: string;
    shortTitle?: string;
    category?: string;
    enablement?: string;
    /**  */
    icon?:
      | string
      | {
          light: string;
          dark: string;
        };
  };
//#endregion main
