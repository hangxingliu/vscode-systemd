import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.netdev(5)";
const url = manpageURLs.base + "systemd.netdev.html";

export const directives: CustomSystemdDirective[] = [
    {
        name: "FwMark",
        renamedTo: "FirewallMark",
        docs: "Sets a firewall mark on outgoing WireGuard packets from this interface.",
        deprecated: 243,
        section: ["WireGuard"],
        manPage,
        url,
    },
    {
        // DISABLED_LEGACY
        name: "OneQueue",
        signature: "boolean",
        docs: 'Takes a boolean. Configures whether all packets are queued at the device (enabled), or a fixed number of packets are queued at the device and the rest at the "`qdisc`". Defaults to "`no`".',
        deprecated: 243,
        fixHelp:
            "`OneQueue=` for tun or tap devices is deprecated. Because  `IFF_ONE_QUEUE` has no effect since kernel-3.8. See kernel's commit: 5d097109257c03a71845729f8db6b5770c4bbedc.",
        section: ["Tun"],
        manPage,
        url,
    },
    {
        // 2017-10-06
        dead: true,
        name: "TableId",
        renamedTo: "Table",
        docs: "The numeric routing table identifier. This setting is compulsory.",
        deprecated: 235,
        section: ["VRF"],
        manPage,
        url,
    },
    {
        name: "IgnoreUserspaceMulticastGroups",
        signature: "boolean",
        renamedTo: "IgnoreUserspaceMulticastGroup",
        docs: "`IgnoreUserspaceMulticastGroup` takes an boolean value. When true, the kernel ignores multicast groups handled by userspace. Defaults to unset, and the kernel's default is used.",
        section: "IPoIB",
        deprecated: 250,
        manPage,
        url,
    },
    {
        name: ["UDP6CheckSumRx", "UDP6CheckSumTx"],
        docs: "",
        section: "L2TP",
        manPage,
        url,
    },
    {
        // typo
        // dead: true,
        name: ["GatewayBandwithDown", "GatewayBandwithUp"],
        renamedTo: ["GatewayBandwidthDown", "GatewayBandwidthUp"],
        docs: "Please see `GatewayBandwidthDown=` and `GatewayBandwidthUp=`",
        fixHelp: "Please rename them to `GatewayBandwidthDown=` and `GatewayBandwidthUp=`",
        section: "BatmanAdvanced",
        deprecated: 249,
        manPage,
        url,
    },
    {
        // 2017-03-01
        name: "ARPProxy",
        renamedTo: "ReduceARPProxy",
        signature: "boolean",
        docs: "A boolean. When true, enables ARP proxying.",
        fixHelp:
            "VXLAN-specific option `ARPProxy=` has been renamed to `ReduceARPProxy=`. The old names continue to be available for compatibility.",
        section: "VXLAN",
        deprecated: 233,
        manPage,
        url,
    },
];
