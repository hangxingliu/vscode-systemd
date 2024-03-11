import { SystemdValueEnum } from "./types";
import { valueEnum as netdev } from "./systemd-netdev";
import { valueEnum as network } from "./systemd-network";
import { valueEnum as service } from "./systemd-service";
import { valueEnum as socket } from "./systemd-socket";
import { valueEnum as unit } from "./systemd-unit";
import { valueEnum as exec } from "./systemd-exec";
import { valueEnum as kill } from "./systemd-kill";
import { valueEnum as link } from "./systemd-link";
import { valueEnum as resource_control } from "./systemd-resource-control";

export const systemdValueEnum: ReadonlyArray<SystemdValueEnum> = [
    ...unit,
    ...exec,
    ...resource_control,
    ...service,
    ...netdev,
    ...network,
    ...socket,
    ...kill,
    ...link,
    {
        directive: "OOMPolicy",
        manPage: "systemd.scope(5)",
        values: ["continue", "stop", "kill"],
    },
    {
        directive: "systemd.default_standard_error",
        manPage: "systemd(1)",
        values: ["inherit", "null", "tty", "journal", "journal+console", "kmsg", "kmsg+console"],
    },
    {
        directive: "DefaultFileSystemType",
        section: "Home",
        manPage: "homed.conf(5)",
        values: ["btrfs", "ext4", "xfs"],
    },
    {
        directive: "DefaultStorage",
        section: "Home",
        manPage: "homed.conf(5)",
        values: ["luks", "fscrypt", "directory", "subvolume", "cifs"],
    },
    {
        directive: "DNSStubListener",
        section: "Resolve",
        manPage: "resolved.conf(5)",
        values: ["udp", "tcp"],
    },
    {
        directive: "_LINE_BREAK",
        manPage: "systemd.journal-fields(7)",
        values: ["nul", "line-max", "eof", "pid-change"],
    },
    {
        directive: "class",
        manPage: "pam_systemd(8)",
        values: ["user", "greeter", "lock-screen", "background"],
    },
    {
        directive: "type",
        manPage: "pam_systemd(8)",
        values: ["unspecified", "tty", "x11", "wayland", "mir"],
    },
    {
        directive: "MaxLevelConsole",
        section: "Journal",
        manPage: "journald.conf(5)",
        values: ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"],
    },
    {
        directive: "Storage",
        section: "Journal",
        manPage: "journald.conf(5)",
        values: ["volatile", "persistent", "auto", "none"],
    },
    {
        directive: "Storage",
        section: "Coredump",
        manPage: "coredump.conf(5)",
        values: ["none", "external", "journal"],
    },
    {
        directive: "HandleHibernateKey",
        section: "Login",
        manPage: "logind.conf(5)",
        values: [
            "ignore",
            "poweroff",
            "reboot",
            "halt",
            "kexec",
            "suspend",
            "hibernate",
            "hybrid-sleep",
            "suspend-then-hibernate",
            "lock",
            "factory-reset",
        ],
    },
    {
        directive: "IdleAction",
        section: "Login",
        manPage: "logind.conf(5)",
        values: [
            "ignore",
            "poweroff",
            "reboot",
            "halt",
            "kexec",
            "suspend",
            "hibernate",
            "hybrid-sleep",
            "suspend-then-hibernate",
            "lock",
        ],
    },
    {
        directive: "Storage",
        section: "PStore",
        manPage: "pstore.conf(5)",
        values: ["none", "external", "journal"],
    },
    {
        directive: "Encrypt",
        section: "Partition",
        manPage: "repart.d(5)",
        values: ["off", "key-file", "tpm2", "key-file+tpm2"],
    },
    {
        directive: "Minimize",
        section: "Partition",
        manPage: "repart.d(5)",
        values: ["off", "best", "guess"],
    },
    {
        directive: "Type",
        section: "Partition",
        manPage: "repart.d(5)",
        values: [
            "alpha",
            "arc",
            "arm",
            "arm64",
            "ia64",
            "loongarch64",
            "mips-le",
            "mips64-le",
            "parisc",
            "ppc",
            "ppc64",
            "ppc64-le",
            "riscv32",
            "riscv64",
            "s390",
            "s390x",
            "tilegx",
            "x86",
            "x86-64",
        ],
    },
    {
        directive: "Verity",
        section: "Partition",
        manPage: "repart.d(5)",
        values: ["off", "data", "hash", "signature"],
    },
    {
        directive: "PathRelativeTo",
        section: "Target",
        manPage: "sysupdate.d(5)",
        values: ["root", "esp", "xbootldr", "boot"],
    },
    {
        directive: "Type",
        section: "Target",
        manPage: "sysupdate.d(5)",
        values: ["partition", "regular-file", "directory", "subvolume"],
    },
    {
        directive: "Type",
        section: "Source",
        manPage: "sysupdate.d(5)",
        values: ["url-file", "url-tar", "tar", "regular-file", "directory", "subvolume"],
    },
];
