export const languageId = "systemd-conf";

export const knownSections = [
    "Automount",
    "Bridge",
    "DHCPServer",
    "Distribution",
    "Install",
    "Link",
    "Match",
    "Mount",
    "NetDev",
    "Network",
    "Output",
    "Path",
    "Partitions",
    "Packages",
    "Peer",
    "Resolve",
    "Service",
    "Socket",
    "Swap",
    "Timer",
    "Tunnel",
    "Unit",
    "VLAN",
];

export type CustomSystemdDirective = {
    name: string | string[];
    deprecated?: boolean;
    description?: string;
};
export const customDirectives: Array<CustomSystemdDirective> = [
    {
        name: "BusPolicy",
        description: [
            "If kdbus is enabled during build a new option `BusPolicy=` is",
            "available for service units, that allows locking all service",
            "processes into a stricter bus policy, in order to limit",
            "access to various bus services, or even hide most of them",
            "from the service's view entirely.",
        ].join("\n"),
    },
    {
        name: "Capabilities",
        deprecated: true,
        description: [
            "setting has been removed(it is ignored",
            "for backwards compatibility). `AmbientCapabilities=` and",
            "`CapabilityBoundingSet=` should be used instead.",
        ].join("\n"),
    },
    {
        name: ["InaccessableDirectories", "ReadOnlyDirectories", "ReadWriteDirectories"],
        description: [
            "The `InaccessableDirectories=`, `ReadOnlyDirectories=` and",
            "`ReadWriteDirectories=` unit file settings have been renamed to",
            "`InaccessablePaths=`, `ReadOnlyPaths=` and `ReadWritePaths=` and may now be",
            "applied to all kinds of file nodes, and not just directories, with",
            "the exception of symlinks. Specifically these settings may now be",
            "used on block and character device nodes, UNIX sockets and FIFOS as",
            "well as regular files. The old names of these settings remain",
            "available for compatibility.",
        ].join("\n"),
    },
    {
        name: "NetClass",
        description: [
            "Support for tweaking details in net_cls.class_id through the",
            "`NetClass=` configuration directive has been removed, as the kernel",
            "people have decided to deprecate that controller in cgroup v2.",
            "Userspace tools such as nftables are moving over to setting rules",
            "that are specific to the full cgroup path of a task, which obsoletes",
            "these controllers anyway. The `NetClass=` directive is kept around for",
            "legacy compatibility reasons. For a more in-depth description of the",
            "kernel change, please refer to the respective upstream commit:",
            "<https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/commit/?id=bd1060a1d671>",
        ].join("\n"),
    },
    {
        // from systemd samples
        name: [
            "ManagedOOMMemoryPressureLimitPercent",
            "PermissionsStartOnly",
            "CriticalConnection",
            "FwMark",
            "IPv6PrefixDelegation",
            "IPv6Token",
            "OneQueue",
            "PrefixRoute",
            "RapidCommit",
            "UDPSegmentationOffload",
            "ShutdownWatchdogSec",
            "PrivateUsersChown",
            "UserTasksMax",
            "DefaultMemoryLow",
            "DefaultMemoryMin",
            "InaccessibleDirectories",
            "UDP6ZeroCheckSumTx",
            "UDP6ZeroCheckSumRx",
            "TableId",
            "ARPProxy",
            "UDPCheckSum",
            "UDP6CheckSumRx",
            "UDP6CheckSumTx",
            "GatewayBandwithDown",
            "GatewayBandwithUp",
            "IgnoreUserspaceMulticastGroups",
            "ForceDHCPv6PDOtherInformation",
            "UseDomainName",
            "BlackList",
            "GatewayOnlink",
            "IPv6AcceptRouterAdvertisements",
            "IPv4LL",
            "DHCPv6PrefixDelegation",
            "PresumeACK",
            "Burst",
            "LimitSize",
            "Quantum",
            "InitialQuantum",
            "NetworkEmulatorDelaySec",
            "NetworkEmulatorDelayJitterSec",
            "NetworkEmulatorLossRate",
            "NetworkEmulatorDuplicateRate",
            "NetworkEmulatorPacketLimit",
            "BindTo",
            "IgnoreOnSnapshot",
            "OnFailureIsolate",
            "OnSuccessJobMode",
            "PropagateReloadFrom",
            "PropagateReloadTo",
            "RequiresOverridable",
            "RequisiteOverridable",
            "StartLimitInterval",
            "SysVStartPriority",
        ],
    },
];

export const deprecatedDirectives = [
    // https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#Deprecated%20Options
    "CPUShares",
    "StartupCPUShares",
    "MemoryLimit",
    "BlockIOAccounting",
    "BlockIOWeight",
    "StartupBlockIOWeight",
    "BlockIODeviceWeight",
    "BlockIOReadBandwidth",
    "BlockIOWriteBandwidth",
];
for (let i = 0; i < customDirectives.length; i++) {
    const d = customDirectives[i];
    if (d.deprecated) {
        if (Array.isArray(d.name)) deprecatedDirectives.push(...d.name);
        else deprecatedDirectives.push(d.name);
    }
}
export const deprecatedDirectivesSet = new Set(deprecatedDirectives);

export const directivePrefixes = ["x-", "X-", "-"];

export const optionsForServiceType = ['simple', 'exec', 'forking', 'oneshot', 'dbus', 'notify', 'idle'];

export const optionsForServiceRestart = ['no', 'on-success', 'on-failure', 'on-abnormal', 'on-watchdog', 'on-abort', 'always'];
