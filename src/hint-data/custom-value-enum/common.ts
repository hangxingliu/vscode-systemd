/**
 * https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html#WLANInterfaceType=
 *
 * `enum nl80211_iftype`
 */
export const wlanInterfaceTypes: Record<string, string> = {
    "ad-hoc": "independent BSS member",
    station: "managed BSS member",
    ap: "access point",
    "ap-vlan":
        "VLAN interface for access points; VLAN interfaces are a bit special in that they must always be tied to a pre-existing AP type interface.",
    wds: "wireless distribution interface",
    monitor: "monitor interface receiving all frames",
    "mesh-point": "mesh point",
    "p2p-client": "P2P client",
    "p2p-go": "P2P group owner",
    "p2p-device": "P2P device interface type",
    ocb: "Outside Context of a BSS. This mode corresponds to the MIB variable `dot11OCBActivated=true`",
    nan: "NAN device interface type (not a netdev)",
};

