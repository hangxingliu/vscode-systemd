import { SystemdFileType } from "../../parser/file-info";
import { supportedNetdevKinds, wlanInterfaceTypes } from "./common";
import { SystemdValueEnum } from "./types";

const file = SystemdFileType.netdev;

export const valueEnum: SystemdValueEnum[] = [
    {
        directive: "Kind",
        section: "NetDev",
        file,
        docs: supportedNetdevKinds,
    },
    {
        directive: "EncapsulationType",
        section: "L2TP",
        file,
        values: ["udp", "ip"],
    },
    {
        directive: "EtherType",
        section: "BareUDP",
        file,
        values: ["ipv4", "ipv6", "mpls-uc", "mpls-mc"],
    },
    {
        directive: "GatewayMode",
        section: "BatmanAdvanced",
        file,
        values: ["off", "server", "client"],
    },
    {
        directive: "Layer2SpecificHeader",
        section: "L2TPSession",
        file,
        values: ["none", "default"],
    },
    {
        directive: "Local",
        section: "Tunnel",
        file,
        values: ["any", "ipv4_link_local", "ipv6_link_local", "dhcp4", "dhcp6", "slaac"],
    },
    {
        directive: "Local",
        section: "VXLAN",
        file,
        values: ["ipv4_link_local", "ipv6_link_local", "dhcp4", "dhcp6", "slaac"],
    },
    {
        directive: "RouteTable",
        section: "WireGuardPeer",
        file,
        values: ["default", "main", "local"],
    },
    {
        directive: "RouteTable",
        section: "WireGuard",
        file,
        values: ["default", "main", "local"],
    },
    {
        directive: "Type",
        section: "WLAN",
        file,
        docs: wlanInterfaceTypes,
        sep: " ",
        prefixChars: "!",
    },
];
