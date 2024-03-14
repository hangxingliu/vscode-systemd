import { systemCallFilter } from "./common-syscalls";
import { knownArchs } from "./common-unit-condition";
import { SystemdValueEnum } from "./types";

const manPage = "systemd.exec(5)";

export const valueEnum: SystemdValueEnum[] = [
    systemCallFilter,
    {
        directive: 'SystemCallArchitectures',
        manPage,
        values: knownArchs,
        sep: ' ',
    },
    {
        directive: "CPUSchedulingPolicy",
        manPage,
        values: ["other", "batch", "idle", "fifo", "rr"],
    },
    {
        directive: "IOSchedulingClass",
        manPage,
        values: ["realtime", "best-effort", "idle"],
    },
    {
        directive: "KeyringMode",
        manPage,
        values: ["inherit", "private", "shared"],
    },
    {
        directive: "Personality",
        manPage,
        values: [
            "arm64",
            "arm64-be",
            "arm",
            "arm-be",
            "x86",
            "x86-64",
            "ppc",
            "ppc-le",
            "ppc64",
            "ppc64-le",
            "s390",
            "s390x",
        ],
    },
    {
        directive: "ProcSubset",
        manPage,
        values: ["all", "pid"],
    },
    {
        directive: "ProtectProc",
        manPage,
        values: ["noaccess", "invisible", "ptraceable", "default"],
    },
    {
        directive: "StandardInput",
        manPage,
        values: ["null", "tty", "tty-force", "tty-fail", "data", "file:${path}", "socket", "fd:${name}"],
    },
    {
        directive: "StandardOutput",
        manPage,
        values: [
            "inherit",
            "null",
            "tty",
            "journal",
            "kmsg",
            "journal+console",
            "kmsg+console",
            "file:${path}",
            "append:${path}",
            "truncate:${path}",
            "socket",
            "fd:${name}",
        ],
    },
    {
        directive: "SyslogFacility",
        manPage,
        values: [
            "kern",
            "user",
            "mail",
            "daemon",
            "auth",
            "syslog",
            "lpr",
            "news",
            "uucp",
            "cron",
            "authpriv",
            "ftp",
            "local0",
            "local1",
            "local2",
            "local3",
            "local4",
            "local5",
            "local6",
            "local7",
        ],
    },
    {
        directive: "SyslogLevel",
        manPage,
        values: ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"],
    },
    {
        directive: "UtmpMode",
        manPage,
        values: ["init", "login", "user"],
    },
];
