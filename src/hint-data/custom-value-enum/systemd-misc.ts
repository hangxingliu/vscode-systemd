import { PredefinedSignature } from "../types-manifest";
import { gptPartitionTypeIds } from "./common";
import { SystemdValueEnum } from "./types";

export const valueEnum: SystemdValueEnum[] = [
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
        directive: "DNSStubListener",
        section: "Resolve",
        manPage: "resolved.conf(5)",
        values: ["udp", "tcp"],
        extends: PredefinedSignature.Boolean,
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
        directive: "Storage",
        section: "Coredump",
        manPage: "coredump.conf(5)",
        values: ["none", "external", "journal"],
    },
    {
        directive: "Storage",
        section: "PStore",
        manPage: "pstore.conf(5)",
        values: ["none", "external", "journal"],
    },

    //
    //#region homed.conf(5)
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
    //#endregion homed.conf(5)
    //

    //
    //#region journald.conf(5)
    {
        directive: ["MaxLevelStore", "MaxLevelSyslog", "MaxLevelKMsg", "MaxLevelConsole", "MaxLevelWall"],
        section: "Journal",
        manPage: "journald.conf(5)",
        values: ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug", "${int}"],
    },
    {
        directive: "Storage",
        section: "Journal",
        manPage: "journald.conf(5)",
        values: ["volatile", "persistent", "auto", "none"],
    },
    //#endregion journald.conf(5)
    //

    //
    //#region logind.conf(5)
    {
        directive: [
            "HandlePowerKey",
            "HandlePowerKeyLongPress",
            "HandleRebootKey",
            "HandleRebootKeyLongPress",
            "HandleSuspendKey",
            "HandleSuspendKeyLongPress",
            "HandleHibernateKey",
            "HandleHibernateKeyLongPress",
            "HandleLidSwitch",
            "HandleLidSwitchExternalPower",
            "HandleLidSwitchDocked",
        ],
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
    //#endregion logind.conf(5)
    //

    //
    //#region repart.d(5)
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
            "${GPT_PARTITION_TYPE_UUID}",
        ],
        docs: gptPartitionTypeIds,
    },
    {
        directive: "Format",
        section: "Partition",
        manPage: "repart.d(5)",
        // cat /proc/filesystems
        values: ["ext4", "btrfs", "xfs", "vfat", "erofs", "squashfs", "exfat", "swap", "${file_system_name}"],
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
        directive: "Verity",
        section: "Partition",
        manPage: "repart.d(5)",
        values: ["off", "data", "hash", "signature"],
    },
    //#endregion repart.d(5)
    //

    //
    //#region sysupdate.d(5)
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
    //#endregion sysupdate.d(5)
    //
];
