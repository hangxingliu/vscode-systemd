import { SystemdFileType } from "../../parser/file-info";
import { SystemdValueEnum } from "./types";

const file = SystemdFileType.system;

export const valueEnum: SystemdValueEnum[] = [
    /**
     * "crash_action_table" in
     * https://github.com/systemd/systemd/blob/0dfd89fa32b828e284de61c8e98bdf6148d18422/src/core/main.c#L171
     */
    {
        directive: "CrashAction",
        section: "Manager",
        file,
        values: ["freeze", "reboot", "poweroff"],
    },
];
