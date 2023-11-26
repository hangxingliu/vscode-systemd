type Sections = ReadonlyArray<string | [name: string, help: string]>;
export type SectionsDefinition = Sections;

export const commonSections: Sections = [
    ["Unit", "[Unit] carries generic information about the unit that is not dependent on the type of unit"],
    [
        "Install",
        "[Install] carries installation information for the unit. This section is not interpreted by [systemd(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd.html#) during runtime; it is used by the enable and disable commands of the [systemctl(1)](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html#) tool during installation of a unit.",
    ],
];
export const internalSections: Sections = ["Target", "UKI", "D-BUS Service"];
export const knownSections: Sections = [
    "Automount",
    "Distribution",
    "Exec",
    "Files",
    "Home",
    "Journal",
    "Login",
    "Mount",
    "Network",
    "Output",
    "OOM",
    "PStore",
    "Path",
    "Partition",
    "Partitions",
    "Packages",
    "Remote",
    "Resolve",
    "Swap",
    "Source",
    "Transfer",
];
export const serviceSections: Sections = ["Service"];
export const socketSections: Sections = ["Socket"];
export const timerSections: Sections = ["Timer"];
export const linkSections: Sections = ["Link", "Match", "SR-IOV"];
export const dnssdSections: Sections = ["Service"];
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
export const podmanSections: Sections = ["Container", "Kube", "Network", "Volume", "Image"];
