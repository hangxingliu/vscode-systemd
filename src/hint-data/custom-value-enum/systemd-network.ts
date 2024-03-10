import { SystemdFileType } from "../../parser/file-info";
import { PredefinedSignature } from "../types-manifest";
import { wlanInterfaceTypes } from "./common";
import { SystemdValueEnum } from "./types";

const file = SystemdFileType.network;

/** https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html#%5BNetworkEmulator%5D%20Section%20Options */
const qdsicParentEnum4 = {
    values: ["root", "ingress", "clsact", "${class_identifier}"],
    desc: {
        root: "default",
    },
};
/** https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html#%5BHierarchyTokenBucketClass%5D%20Section%20Options */
const qdsicParentEnum2 = {
    values: ["root", "${qdisc_identifier}"],
    desc: {
        root: "default",
    },
};

export const valueEnum: SystemdValueEnum[] = [
    {
        directive: "ActivationPolicy",
        section: "Link",
        file,
        values: ["up", "always-up", "manual", "always-down", "down", "bound"],
    },
    {
        directive: "AssociatedWith",
        section: "BridgeFDB",
        file,
        values: ["use", "self", "master", "router"],
    },
    {
        directive: "ClientIdentifier",
        section: "DHCPv4",
        file,
        values: ["mac", "duid"],
    },
    {
        directive: "CompensationMode",
        section: "CAKE",
        file,
        values: ["none", "atm", "ptm"],
    },
    {
        directive: "DuplicateAddressDetection",
        section: "Address",
        file,
        values: ["ipv4", "ipv6", "both", "none"],
    },
    {
        directive: "FallbackLeaseLifetimeSec",
        section: "DHCPv4",
        file,
        values: ["forever", "infinity"],
    },
    {
        directive: "Family",
        section: "NextHop",
        file,
        values: ["ipv4", "ipv6"],
    },
    {
        directive: "WLANInterfaceType",
        section: "Match",
        file,
        desc: wlanInterfaceTypes,
        sep: " ",
        prefixes: ["!"],
    },
    {
        directive: "DHCP",
        section: "Network",
        file,
        values: ["yes", "no", "ipv4", "ipv6"],
        desc: { no: "default" },
    },
    {
        directive: "LinkLocalAddressing",
        section: "Network",
        file,
        values: ["yes", "no", "ipv4", "ipv6"],
    },
    {
        directive: "VLANId",
        section: "SR-IOV",
        file,
        values: ["802.1Q", "802.1ad"],
    },
    {
        directive: "LinkState",
        section: "SR-IOV",
        file,
        values: ["auto"],
        extends: PredefinedSignature.Boolean,
    },

    {
        directive: "LLMNR",
        section: "Network",
        file,
        values: ["resolve"],
        extends: PredefinedSignature.Boolean,
    },
    {
        directive: "MulticastDNS",
        section: "Network",
        file,
        values: ["resolve"],
        extends: PredefinedSignature.Boolean,
    },
    {
        directive: "DNSOverTLS",
        section: "Network",
        file,
        values: ["opportunistic"],
        extends: PredefinedSignature.Boolean,
    },
    {
        directive: "DNSSEC",
        section: "Network",
        file,
        values: ["allow-downgrade"],
        extends: PredefinedSignature.Boolean,
    },
    {
        directive: "IPForward",
        section: "Network",
        file,
        values: ["ipv4", "ipv6"],
        extends: PredefinedSignature.Boolean,
    },
    {
        directive: "IPMasquerade",
        section: "Network",
        file,
        values: ["ipv4", "ipv6", "both", "no"],
    },
    {
        directive: "IPServiceType",
        section: "DHCPv4",
        file,
        values: ["none", "CS6", "CS4"],
    },
    {
        directive: "IPv4ReversePathFilter",
        section: "Network",
        file,
        values: ["no", "strict", "loose"],
    },
    {
        directive: "IPv6LinkLocalAddressGenerationMode",
        section: "Network",
        file,
        values: ["eui64", "none", "stable-privacy", "random"],
    },
    {
        directive: "Mode",
        section: "IPoIB",
        file,
        values: ["datagram", "connected"],
    },
    {
        directive: "IPv6Preference",
        section: "Route",
        file,
        values: ["low", "medium", "high"],
    },
    {
        directive: "KeepConfiguration",
        section: "Network",
        file,
        values: ["static", "dhcp-on-stop", "dhcp"],
        extends: PredefinedSignature.Boolean,
    },
    {
        directive: "MulticastRouter",
        section: "Bridge",
        file,
        values: ["no", "query", "permanent", "temporary"],
    },
    {
        directive: "FlowIsolationMode",
        section: "CAKE",
        file,
        values: [],
        desc: {
            none: "The flow isolation is disabled, and all traffic passes through a single queue",
            "src-host":
                'Flows are defined only by source address. Equivalent to the "`srchost`" option for **tc qdisc** command',
            "dst-host":
                'Flows are defined only by destination address. Equivalent to the "`dsthost`" option for **tc qdisc** command',
            hosts: "Flows are defined by source-destination host pairs. Equivalent to the same option for **tc qdisc** command",
            flows: "Flows are defined by the entire 5-tuple of source address, destination address, transport protocol, source port and destination port. Equivalent to the same option for **tc qdisc** command",
            "dual-src-host":
                'Flows are defined by the 5-tuple (see "`flows`"), and fairness is applied first over source addresses, then over individual flows. Equivalent to the "`dual-srchost`" option for **tc qdisc** command',
            "dual-dst-host":
                'Flows are defined by the 5-tuple (see "`flows`"), and fairness is applied first over destination addresses, then over individual flows. Equivalent to the "`dual-dsthost`" option for **tc qdisc** command',
            triple: 'Flows are defined by the 5-tuple (see "`flows`"), and fairness is applied over source and destination addresses, and also over individual flows. Equivalent to the "`triple-isolate`" option for **tc qdisc** command',
        },
    },
    {
        directive: "Parent",
        section: "QuickFairQueueingClass",
        file,
        ...qdsicParentEnum2,
    },
    {
        directive: "Parent",
        section: "QuickFairQueueing",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "HeavyHitterFilter",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "HierarchyTokenBucketClass",
        file,
        ...qdsicParentEnum2,
    },
    {
        directive: "Parent",
        section: "HierarchyTokenBucket",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "TrivialLinkEqualizer",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "FairQueueing",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "FairQueueingControlledDelay",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "GenericRandomEarlyDetection",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "EnhancedTransmissionSelection",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "DeficitRoundRobinSchedulerClass",
        file,
        ...qdsicParentEnum2,
    },
    {
        directive: "Parent",
        section: "DeficitRoundRobinScheduler",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "ControlledDelay",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "CAKE",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "PFIFOFast",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "PFIFOHeadDrop",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "PFIFO",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "BFIFO",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "StochasticFairnessQueueing",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "StochasticFairBlue",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "FlowQueuePIE",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "PIE",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "TokenBucketFilter",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "NetworkEmulator",
        file,
        ...qdsicParentEnum4,
    },
    {
        directive: "Parent",
        section: "QDisc",
        file,
        values: ["clsact", "ingress"],
    },
    {
        directive: "RequiredFamilyForOnline",
        section: "Link",
        file,
        values: ["ipv4", "ipv6", "both", "any"],
    },
    {
        directive: "RouteTable",
        section: "IPv6AcceptRA",
        file,
        values: ["default", "main", "local"],
    },
    {
        directive: "RouteTable",
        section: "DHCPv4",
        file,
        values: ["default", "main", "local"],
    },
    {
        directive: "SendOption",
        section: "DHCPServer",
        file,
        values: ["uint8", "uint16", "uint32", "ipv4address", "ipv6address", "string"],
    },
    {
        directive: "SendOption",
        section: "DHCPv4",
        file,
        values: ["uint8", "uint16", "uint32", "ipv4address", "string"],
    },
    {
        directive: "SendVendorOption",
        section: "DHCPServer",
        file,
        values: ["uint8", "uint16", "uint32", "ipv4address", "string"],
    },
    {
        directive: "SendVendorOption",
        section: "DHCPv6",
        file,
        values: ["uint8", "uint16", "uint32", "ipv4address", "ipv6address", "string"],
    },
    {
        directive: "SendVendorOption",
        section: "DHCPv4",
        file,
        values: ["uint8", "uint16", "uint32", "ipv4address", "string"],
    },
    {
        directive: "Table",
        section: "Route",
        file,
        values: ["default", "main", "local"],
    },
    {
        directive: "Table",
        section: "RoutingPolicyRule",
        file,
        values: ["default", "main", "local"],
    },
    {
        directive: "Type",
        section: "Route",
        file,
        values: [
            "unicast",
            "local",
            "broadcast",
            "anycast",
            "multicast",
            "blackhole",
            "unreachable",
            "prohibit",
            "throw",
            "nat",
            "xresolve",
        ],
    },
    {
        directive: "Type",
        section: "RoutingPolicyRule",
        file,
        values: ["blackhole", "unreachable", "prohibit"],
    },
    {
        directive: "WithoutRA",
        section: "DHCPv6",
        file,
        values: ["no", "solicit", "information-request"],
    },
];
