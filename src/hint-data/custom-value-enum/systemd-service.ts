import { SystemdFileType } from "../../parser/file-info";
import { SystemdValueEnum } from "./types";

const section = "Service";
const file = SystemdFileType.service;

export const valueEnum: SystemdValueEnum[] = [
    {
        directive: "ExitType",
        section,
        file,
        tips: { main: "default" },
        docs: {
            main: "The service manager will consider the unit stopped when the main process, which is determined according to the `Type=`, exits. Consequently, it cannot be used with `Type=oneshot`.",
            cgroup: "The service will be considered running as long as at least one process in the cgroup has not exited.",
        },
    },
    {
        directive: "FileDescriptorStorePreserve",
        section,
        file,
        values: ["no", "yes", "restart"],
    },
    {
        directive: "NotifyAccess",
        section,
        file,
        values: ["none", "main", "exec", "all"],
    },
    {
        directive: "OOMPolicy",
        section,
        file,
        values: ["continue", "stop", "kill"],
    },
    {
        directive: "Restart",
        section,
        file,
        values: ["no", "on-success", "on-failure", "on-abnormal", "on-watchdog", "on-abort", "always"],
    },
    {
        directive: "RestartMode",
        file,
        values: ["normal", "direct"],
    },
    {
        directive: "TimeoutStartFailureMode",
        section,
        file,
        values: ["terminate", "abort", "kill"],
    },
    {
        directive: "Type",
        section,
        file,
        docs: {
            //#region
            // these help text are extracted from
            // https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html#
            // by the author
            simple: "*Typically, `Type=exec` is the better choice* (the default if `ExecStart=` is specified but neither `Type=` nor `BusName=` are). The service manager will consider the unit started immediately after the main service process has been forked off",
            exec: "The `exec` type is similar to simple, but the service manager will consider the unit started immediately after the main service binary has been executed.",
            forking:
                "*The use of this type is discouraged, use `notify`, `notify-reload`, or `dbus` instead.* The manager will consider the unit started immediately after the binary that forked off by the manager exits.",
            oneshot:
                "Behavior of `oneshot` is similar to `simple`; however, the service manager will consider the unit up after the main process exits",
            dbus: "(the default is `BusName=` is specified) Behavior of `dbus` is similar to `simple`; however, units of this type must have the `BusName=` specified and the service manager will consider the unit up when the specified bus name has been acquired.",
            notify: 'It is expected that the service sends a "READY=1" notification message via sd_notify(3) or an equivalent call when it has finished starting up.',
            "notify-reload":
                "Behavior of `notify-reload` is similar to `notify`, with one difference: the `SIGHUP` UNIX process signal is sent to the service's main process when the service is asked to reload and the manager will wait for a notification about the reload being finished.",
            idle: "Behavior of `idle` is very similar to `simple`; however, actual execution of the service program is delayed until all active jobs are dispatched. This may be used to avoid interleaving of output of shell services with the status output on the console. Note that this type is useful only to improve console output, it is not useful as a general unit ordering tool, and the effect of this service type is subject to a 5s timeout, after which the service program is invoked anyway.",
            //#endregion
        },
    },
];
