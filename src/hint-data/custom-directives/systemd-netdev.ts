import { SectionGroupName } from "../../syntax/const-sections";
import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.netdev(5)";
const url = manpageURLs.base + "systemd.netdev.html";

export const directives: CustomSystemdDirective[] = [
    {
        name: "FwMark",
        renamedTo: "FirewallMark",
        docs: "Sets a firewall mark on outgoing WireGuard packets from this interface.",
        deprecated: "243",
        section: ["WireGuard"],
        manPage,
        url,
    },
    {
        name: "OneQueue",
        docs: 'Takes a boolean. Configures whether all packets are queued at the device (enabled), or a fixed number of packets are queued at the device and the rest at the "`qdisc`". Defaults to "`no`".',
        deprecated: "243",
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
        deprecated: "235",
        section: ["VRF"],
        manPage,
        url,
    },
    {
        name: "IgnoreUserspaceMulticastGroups",
        docs: "",
        section: "IPoIB",
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
        dead: true,
        name: ["GatewayBandwithDown", "GatewayBandwithUp"],
        renamedTo: ["GatewayBandwidthDown", "GatewayBandwidthUp"],
        docs: "Please see `GatewayBandwidthDown=` and `GatewayBandwidthUp=`",
        fixHelp: "Please rename them to `GatewayBandwidthDown=` and `GatewayBandwidthUp=`",
        section: "BatmanAdvanced",
        deprecated: "249",
        manPage,
        url,
    },
    {
        // 2017-03-01
        name: "ARPProxy",
        renamedTo: "ReduceARPProxy",
        docs: "A boolean. When true, enables ARP proxying.",
        fixHelp:
            "VXLAN-specific option `ARPProxy=` has been renamed to `ReduceARPProxy=`. The old names continue to be available for compatibility.",
        section: "VXLAN",
        deprecated: "233",
        manPage,
        url,
    },
];
