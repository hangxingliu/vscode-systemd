type Sections = ReadonlyArray<string | [name: string, help: string]>;
export type SectionsDefinition = Sections;

//
//#region section groups
export type SectionGroup = { name: SectionGroupName; sections: Sections };
export const enum SectionGroupName {
    ResourceControl = "group[resource-control]",
    Kill = "group[kill]",
    Execution = "group[execution]",
}
export const sectionGroups: SectionGroup[] = [
    {
        /** The resource control configuration options are configured in the [Slice], [Scope], [Service], [Socket], [Mount], or [Swap] sections, depending on the unit type. */
        name: SectionGroupName.ResourceControl,
        sections: ["Slice", "Scope", "Service", "Socket", "Mount", "Swap"],
    },
    {
        /** The kill procedure configuration options are configured in the [Service], [Socket], [Mount] or [Swap] section, depending on the unit type. */
        name: SectionGroupName.Kill,
        sections: ["Service", "Socket", "Mount", "Swap"],
    },
    {
        /** The execution specific configuration options are configured in the [Service], [Socket], [Mount], or [Swap] sections, depending on the unit type. */
        name: SectionGroupName.Execution,
        sections: ["Service", "Socket", "Mount", "Swap"],
    },
];
//#endregion section groups
//

export const similarSections = new Map<string, string>([
    //
    //#region systemd.netdev
    //
    // The [MACVTAP] section applies for netdevs of kind "macvtap" and accepts the same keys as [MACVLAN].
    ["MACVTAP", "MACVLAN"],
    // The [IPVTAP] section only applies for netdevs of kind "ipvtap" and accepts the same keys as [IPVLAN].
    ["IPVTAP", "IPVLAN"],
    // The [Tap] section only applies for netdevs of kind "tap", and accepts the same keys as the [Tun] section.
    ["Tap", "Tun"],
    //#endregion
]);

export const commonSections: Sections = [
    ["Unit", "[Unit] carries generic information about the unit that is not dependent on the type of unit"],
    [
        "Install",
        "[Install] carries installation information for the unit. This section is not interpreted by [systemd(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd.html#) during runtime; it is used by the enable and disable commands of the [systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html#) tool during installation of a unit.",
    ],
];

export const internalSections: Sections = [
    "DHCP", // before v243
    "IPv6PrefixDelegation", // before v247. then it was renamed to [IPv6SendRA]
    "DHCPv6PrefixDelegation", // before v250, then it was renamed to [DHCPPrefixDelegation]
    "TrafficControlQueueingDiscipline", // before 245. then it was renamed to [NetworkEmulator]
    "Distribution",
    "Output",
    "Content",
    "Target",
    "UKI",
    "D-BUS Service",
    "Packages",
];

/** sysupdate.d/*.conf */
export const sysupdatedSections: Sections = ["Transfer", "Source"];
/** resolved.conf, esolved.conf.d/*.conf */
export const resolvedSections: Sections = ["Resolve"];
/** repart.d/*.conf */
export const repartdSections: Sections = ["Partition"];
/** pstore.conf, pstore.conf.d/*  */
export const pstoreSections: Sections = ["PStore"];
/** oomd.conf, oomd.conf.d/*.conf */
export const oomdSections: Sections = ["OOM"];
/** homed.conf, homed.conf.d/*.conf */
export const homedSections: Sections = ["Home"];
/**
 * journald.conf, journald.conf.d/*.conf,
 * journald@NAMESPACE.conf, journald@NAMESPACE.conf.d/*.conf
 */
export const journaldSections: Sections = ["Journal"];
/** journal-remote.conf, journal-remote.conf.d/*.conf */
export const journalRemoteSections: Sections = ["Remote"];
/** journal-upload.conf, journal-upload.conf.d/*.conf */
export const journalUploadSections: Sections = ["Upload"];
/** logind.conf, logind.conf.d/*.conf */
export const logindSections: Sections = ["Login"];
/** timesyncd.conf, timesyncd.conf.d/*.conf */
export const timesyncdSections: Sections = ["Time"];
/** sleep.conf, sleep.conf.d/*.conf */
export const sleepSections: Sections = ["Sleep"];
/** networkd.conf, networkd.conf.d/*.conf */
export const networkdSections: Sections = ["Network", "DHCPv4", "DHCPv6"];
/** coredump.conf, coredump.conf.d/*.conf */
export const coredumpSections: Sections = ["Coredump"];
/**
 * system.conf, system.conf.d/*.conf
 * user.conf, user.conf.d/*.conf
 */
export const systemManagerSections: Sections = ["Manager"];
/** iocost.conf, iocost.conf.d/*.conf */
export const iocostSections: Sections = ["IOCost"];

/** .nspawn */
export const nspawnSections: Sections = ["Exec", "Network", "Files"];
/** *.service */
export const serviceSections: Sections = ["Service"];
/** *.socket */
export const socketSections: Sections = ["Socket"];
/** *.timer */
export const timerSections: Sections = ["Timer"];
/** *.automount */
export const automountSections: Sections = ["Automount"];
/** *.link */
export const linkSections: Sections = ["Link", "Match", "SR-IOV"];
/** *.dnssd */
export const dnssdSections: Sections = ["Service"];
/** *.path */
export const pathSections: Sections = ["Path"];
/** *.mount */
export const mountSections: Sections = ["Mount"];
/** *.swap */
export const swapSections: Sections = ["Swap"];
/** *.scope */
export const scopeSections: Sections = ["Scope"];
/** *.netdev */
export const netdevSections: Sections = [
    "BareUDP",
    "BatmanAdvanced",
    "Bond",
    "Bridge",
    "FooOverUDP",
    "GENEVE",
    "IPVLAN",
    "IPVTAP",
    "IPoIB",
    "L2TP",
    "L2TPSession",
    "MACVLAN",
    "MACVTAP",
    "MACsec",
    "MACsecReceiveAssociation",
    "MACsecReceiveChannel",
    "MACsecTransmitAssociation",
    "Match",
    "NetDev",
    "Peer",
    "Tap",
    "Tun",
    "Tunnel",
    "VLAN",
    "VRF",
    "VXCAN",
    "VXLAN",
    "WLAN",
    "WireGuard",
    "WireGuardPeer",
    "Xfrm",
];
/** *.network */
export const networkSections: Sections = [
    "Address",
    "BFIFO",
    "Bridge",
    "BridgeFDB",
    "BridgeMDB",
    "BridgeVLAN",
    "CAKE",
    "CAN",
    "ControlledDelay",
    "DHCPPrefixDelegation",
    "DHCPServer",
    "DHCPServerStaticLease",
    "DHCPv4",
    "DHCPv6",
    "DeficitRoundRobinScheduler",
    "DeficitRoundRobinSchedulerClass",
    "EnhancedTransmissionSelection",
    "FairQueueing",
    "FairQueueingControlledDelay",
    "FlowQueuePIE",
    "GenericRandomEarlyDetection",
    "HeavyHitterFilter",
    "HierarchyTokenBucket",
    "HierarchyTokenBucketClass",
    "IPoIB",
    "IPv6AcceptRA",
    "IPv6AddressLabel",
    "IPv6PREF64Prefix",
    "IPv6Prefix",
    "IPv6RoutePrefix",
    "IPv6SendRA",
    "LLDP",
    "Link",
    "Match",
    "Neighbor",
    "Network",
    "NetworkEmulator",
    "NextHop",
    "PFIFO",
    "PFIFOFast",
    "PFIFOHeadDrop",
    "PIE",
    "QDisc",
    "QuickFairQueueing",
    "QuickFairQueueingClass",
    "Route",
    "RoutingPolicyRule",
    "SR-IOV",
    "StochasticFairBlue",
    "StochasticFairnessQueueing",
    "TokenBucketFilter",
    "TrivialLinkEqualizer",
];

type PodmanUnitType = "Container" | "Kube" | "Volume" | "Network" | "Image" | "Pod";
export const podmanSections: { [x in PodmanUnitType]: Sections } = {
    Container: ["Container", "Service"],
    Kube: ["Kube"],
    Volume: ["Volume"],
    Network: ["Network"],
    Image: ["Image"],
    Pod: ["Pod"],
};
export const allPodmanSections: Sections = [
    ...podmanSections.Container,
    ...podmanSections.Image,
    ...podmanSections.Kube,
    ...podmanSections.Network,
    ...podmanSections.Pod,
    ...podmanSections.Volume,
];

export const defaultSections: Sections = Array.from(
    new Set([
        ...commonSections,
        //
        ...sysupdatedSections,
        ...resolvedSections,
        ...repartdSections,
        ...pstoreSections,
        ...oomdSections,
        ...homedSections,
        ...journaldSections,
        ...journalUploadSections,
        ...journalRemoteSections,
        ...logindSections,
        ...timesyncdSections,
        ...sleepSections,
        ...networkdSections,
        ...coredumpSections,
        ...systemManagerSections,
        ...iocostSections,
        //
        ...nspawnSections,
        ...serviceSections,
        ...socketSections,
        ...timerSections,
        ...automountSections,
        ...linkSections,
        ...dnssdSections,
        ...pathSections,
        ...mountSections,
        ...swapSections,
        ...scopeSections,
        ...netdevSections,
        ...networkSections,
    ])
);

/** This is used for generating grammar file */
export const allSections: Sections = Array.from(
    new Set([...defaultSections, ...internalSections, ...allPodmanSections])
);
