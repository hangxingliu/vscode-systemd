import { standardSignals } from "./common";
import { SystemdValueEnum } from "./types";

const manPage = "systemd.kill(5)";

export const valueEnum: SystemdValueEnum[] = [
    {
        directive: "KillMode",
        values: ["control-group", "mixed", "process", "none"],
        manPage,
        tips: {
            process: "not recommended",
            none: "deprecated",
        },
        docs: {
            "control-group":
                "All remaining processes in the control group of this unit will be killed on unit stop (for services: after the stop command is executed, as configured with `ExecStop=`).",
            mixed: "The `SIGTERM` signal is sent to the main process while the subsequent `SIGKILL` signal is sent to all remaining processes of the unit's control group.",
            process: "Only the main process itself is killed (not recommended!)",
            none: "No process is killed (strongly recommended against!)",
        },
    },
    {
        directive: "KillSignal",
        manPage,
        tips: { SIGTERM: "default" },
        docs: standardSignals,
    },
    {
        directive: "RestartKillSignal",
        manPage,
        docs: standardSignals,
    },
    {
        directive: "FinalKillSignal",
        manPage,
        tips: { SIGKILL: "default" },
        docs: standardSignals,
    },
    {
        directive: "WatchdogSignal",
        manPage,
        tips: { SIGABRT: "default" },
        docs: standardSignals,
    },
];
