import { SectionGroupName } from "../../syntax/const-sections";
import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.resource-control(5)";
const url = manpageURLs.base + "systemd.resource-control.html";
const section = SectionGroupName.ResourceControl;

const fixHelpDetailsFor252 =
    "\nOptions for controlling the Legacy Control Group Hierarchy ([Control Groups version 1](https://docs.kernel.org/admin-guide/cgroup-v1/index.html)) are now fully deprecated: `CPUShares=*`weight`*`, `StartupCPUShares=*`weight`*`, `MemoryLimit=*`bytes`*`, `BlockIOAccounting=`, `BlockIOWeight=*`weight`*`, `StartupBlockIOWeight=*`weight`*`, `BlockIODeviceWeight=*`device`* *`weight`*`, `BlockIOReadBandwidth=*`device`* *`bytes`*`, `BlockIOWriteBandwidth=*`device`* *`bytes`*`. Please switch to the unified cgroup hierarchy.";
const fixHelpForIO252 =
    '"`IO`"-prefixed settings are a superset of and replace "`BlockIO`"-prefixed ones. On unified hierarchy, IO resource control also applies to buffered writes.';

export const directives: CustomSystemdDirective[] = [
    //
    //#region deprecated since v252
    //
    {
        name: ["CPUShares", "StartupCPUShares"],
        // renamedTo: ["CPUWeight", "StartupCPUWeight"],
        signature: "weight",
        section,
        docs: 'Assign the specified CPU time share weight to the processes executed. These options take an integer value and control the "`cpu.shares`" control group attribute. The allowed range is 2 to 262144. Defaults to 1024. For details about this control group attribute, see [CFS Scheduler](https://www.kernel.org/doc/html/latest/scheduler/sched-design-CFS.html). The available CPU time is split up among all units within one slice relative to their CPU time share weight.\n\nWhile `StartupCPUShares=` applies to the startup and shutdown phases of the system, `CPUShares=` applies to normal runtime of the system, and if the former is not set also to the startup and shutdown phases. Using `StartupCPUShares=` allows prioritizing specific services at boot-up and shutdown differently than during normal runtime.\n\nImplies "`CPUAccounting=yes`".\n\nThese settings are deprecated. Use `CPUWeight=` and `StartupCPUWeight=` instead.',
        fixHelp:
            '`CPUWeight=` and `StartupCPUWeight=` replace `CPUShares=` and `StartupCPUShares=`, respectively.\n\nThe "`cpuacct`" controller does not exist separately on the unified hierarchy.' +
            fixHelpDetailsFor252,
        deprecated: "252",
        manPage,
        url: url + "#History",
    },
    {
        name: "MemoryLimit",
        // renamedTo: "MemoryMax",
        signature: "bytes",
        section,
        docs: 'Specify the limit on maximum memory usage of the executed processes. The limit specifies how much process and kernel memory can be used by tasks in this unit. Takes a memory size in bytes. If the value is suffixed with K, M, G or T, the specified memory size is parsed as Kilobytes, Megabytes, Gigabytes, or Terabytes (with the base 1024), respectively. Alternatively, a percentage value may be specified, which is taken relative to the installed physical memory on the system. If assigned the special value "`infinity`", no memory limit is applied. This controls the "`memory.limit_in_bytes`" control group attribute. For details about this control group attribute, see [Memory Resource Controller](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v1/memory.html).\n\nImplies "`MemoryAccounting=yes`".\n\nThis setting is deprecated. Use `MemoryMax=` instead.',
        fixHelp: "`MemoryMax=` replaces `MemoryLimit=`." + fixHelpDetailsFor252,
        deprecated: "252",
        manPage,
        url: url + "#History",
    },
    {
        name: "BlockIOAccounting",
        // renamedTo: "IOAccounting",
        section,
        docs: "Turn on Block I/O accounting for this unit, if the legacy control group hierarchy is used on the system. Takes a boolean argument. Note that turning on block I/O accounting for one unit will also implicitly turn it on for all units contained in the same slice and all for its parent slices and the units contained therein. The system default for this setting may be controlled with `DefaultBlockIOAccounting=` in [systemd-system.conf(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd-system.conf.html).\n\nThis setting is deprecated. Use `IOAccounting=` instead.",
        fixHelp: fixHelpForIO252 + fixHelpDetailsFor252,
        deprecated: "252",
        manPage,
        url: url + "#History",
    },
    {
        name: ["BlockIOWeight", "StartupBlockIOWeight"],
        signature: "weight",
        // renamedTo: ["IOWeight", "StartupIOWeight"],
        section,
        docs: 'Set the default overall block I/O weight for the executed processes, if the legacy control group hierarchy is used on the system. Takes a single weight value (between 10 and 1000) to set the default block I/O weight. This controls the "`blkio.weight`" control group attribute, which defaults to 500. For details about this control group attribute, see [Block IO Controller](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v1/blkio-controller.html). The available I/O bandwidth is split up among all units within one slice relative to their block I/O weight.\n\nWhile `StartupBlockIOWeight=` only applies to the startup and shutdown phases of the system, `BlockIOWeight=` applies to the later runtime of the system, and if the former is not set also to the startup and shutdown phases. This allows prioritizing specific services at boot-up and shutdown differently than during runtime.\n\nImplies "`BlockIOAccounting=yes`".\n\nThese settings are deprecated. Use `IOWeight=` and `StartupIOWeight=` instead.',
        fixHelp: fixHelpForIO252 + fixHelpDetailsFor252,
        deprecated: "252",
        manPage,
        url: url + "#History",
    },
    {
        name: "BlockIODeviceWeight",
        // renamedTo: "IODeviceWeight",
        signature: "device weight",
        section,
        docs: 'Set the per-device overall block I/O weight for the executed processes, if the legacy control group hierarchy is used on the system. Takes a space-separated pair of a file path and a weight value to specify the device specific weight value, between 10 and 1000. (Example: "/dev/sda 500"). The file path may be specified as path to a block device node or as any other file, in which case the backing block device of the file system of the file is determined. This controls the "`blkio.weight_device`" control group attribute, which defaults to 1000. Use this option multiple times to set weights for multiple devices. For details about this control group attribute, see [Block IO Controller](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v1/blkio-controller.html).\n\nImplies "`BlockIOAccounting=yes`".\n\nThis setting is deprecated. Use `IODeviceWeight=` instead.',
        fixHelp: fixHelpForIO252 + fixHelpDetailsFor252,
        deprecated: "252",
        manPage,
        url: url + "#History",
    },
    {
        name: ["BlockIOReadBandwidth", "BlockIOWriteBandwidth"],
        signature: "device bytes",
        // renamedTo: ["IOReadBandwidthMax", "IOWriteBandwidthMax"],
        section,
        docs: 'Set the per-device overall block I/O bandwidth limit for the executed processes, if the legacy control group hierarchy is used on the system. Takes a space-separated pair of a file path and a bandwidth value (in bytes per second) to specify the device specific bandwidth. The file path may be a path to a block device node, or as any other file in which case the backing block device of the file system of the file is used. If the bandwidth is suffixed with K, M, G, or T, the specified bandwidth is parsed as Kilobytes, Megabytes, Gigabytes, or Terabytes, respectively, to the base of 1000. (Example: "/dev/disk/by-path/pci-0000:00:1f.2-scsi-0:0:0:0 5M"). This controls the "`blkio.throttle.read_bps_device`" and "`blkio.throttle.write_bps_device`" control group attributes. Use this option multiple times to set bandwidth limits for multiple devices. For details about these control group attributes, see [Block IO Controller](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v1/blkio-controller.html).\n\nImplies "`BlockIOAccounting=yes`".\n\nThese settings are deprecated. Use `IOReadBandwidthMax=` and `IOWriteBandwidthMax=` instead.',
        fixHelp: fixHelpForIO252 + fixHelpDetailsFor252,
        deprecated: "252",
        manPage,
        url: url + "#History",
    },
    //
    //#endregion deprecated since v252
    //

    // {
    //     name: 'ManagedOOMMemoryPressureLimitPercent',
    //     docs: 'Typo in systemd repo, it should be `ManagedOOMMemoryPressureLimit`',
    //     section,
    //     manPage,
    //     url,
    // },

    {
        name: ["DefaultMemoryLow", "DefaultMemoryMin"],
        signature: "bytes",
        docs: 'Units may have their children use a default "`memory.min`" or "`memory.low`" value by specifying `DefaultMemoryMin=` or `DefaultMemoryLow=`, which has the same semantics as `MemoryMin=` and `MemoryLow=`, or `DefaultStartupMemoryLow=` which has the same semantics as `StartupMemoryLow=`. This setting does not affect "`memory.min`" or "`memory.low`" in the unit itself. Using it to set a default child allocation is only useful on kernels older than 5.7, which do not support the "`memory_recursiveprot`" cgroup2 mount option.',
        section,
        manPage,
        url,
    },

    {
        // deprecated since v229: DISABLED_LEGACY
        name: "NetClass",
        docs: 'Configures a network class number to assign to the unit. This value will be set to the "`net_cls.class_id`" property of the "`net_cls`" cgroup of the unit. The directive accepts a numerical value (for fixed number assignment) and the keyword "`auto`" (for dynamic allocation). Network traffic of all processes inside the unit will have the network class ID assigned by the kernel. Also see the kernel docs for [net\\_cls controller](https://www.kernel.org/doc/Documentation/cgroups/net_cls.txt) and [systemd.resource-control(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html).',
        fixHelp:
            "Support for option `NetClass=` has been removed and it is ignored.\n" +
            "Support for tweaking details in `net_cls.class_id` through the" +
            "NetClass= configuration directive has been removed, as the kernel" +
            "people have decided to deprecate that controller in cgroup v2." +
            "Userspace tools such as nftables are moving over to setting rules" +
            "that are specific to the full cgroup path of a task, which obsoletes" +
            "these controllers anyway. The `NetClass=` directive is kept around for" +
            "legacy compatibility reasons. For a more in-depth description of the" +
            "kernel change, please refer to the respective upstream commit:\n" +
            "https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/commit/?id=bd1060a1d671",
        deprecated: "229",
        section,
        manPage,
        url,
    },
];
