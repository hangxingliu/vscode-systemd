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

export const supportedNetdevKinds: Record<string, string> = {
    bond: "A bond device is an aggregation of all its slave devices. See [Linux Ethernet Bonding Driver HOWTO](https://docs.kernel.org/networking/bonding.html) for details.",
    bridge: "A bridge device is a software switch, and each of its slave devices and the bridge itself are ports of the switch.",
    dummy: "A dummy device drops all packets sent to it.",
    gre: 'A Level 3 GRE tunnel over IPv4. See [RFC 2784](https://tools.ietf.org/html/rfc2784) for details. Name "`gre0`" should not be used, as the kernel creates a device with this name when the corresponding kernel module is loaded.',
    gretap: 'A Level 2 GRE tunnel over IPv4. Name "`gretap0`" should not be used, as the kernel creates a device with this name when the corresponding kernel module is loaded.',
    erspan: 'ERSPAN mirrors traffic on one or more source ports and delivers the mirrored traffic to one or more destination ports on another switch. The traffic is encapsulated in generic routing encapsulation (GRE) and is therefore routable across a layer 3 network between the source switch and the destination switch. Name "`erspan0`" should not be used, as the kernel creates a device with this name when the corresponding kernel module is loaded.',
    ip6gre: "A Level 3 GRE tunnel over IPv6.",
    ip6tnl: "An IPv4 or IPv6 tunnel over IPv6",
    ip6gretap: "A Level 2 GRE tunnel over IPv6.",
    ipip: "An IPv4 over IPv4 tunnel.",
    ipvlan: "An IPVLAN device is a stacked device which receives packets from its underlying device based on IP address filtering.",
    ipvtap: "An IPVTAP device is a stacked device which receives packets from its underlying device based on IP address filtering and can be accessed using the tap user space interface.",
    macvlan:
        "A macvlan device is a stacked device which receives packets from its underlying device based on MAC address filtering.",
    macvtap:
        "A macvtap device is a stacked device which receives packets from its underlying device based on MAC address filtering.",
    sit: "An IPv6 over IPv4 tunnel.",
    tap: "A persistent Level 2 tunnel between a network device and a device node.",
    tun: "A persistent Level 3 tunnel between a network device and a device node.",
    veth: "An Ethernet tunnel between a pair of network devices.",
    vlan: "A VLAN is a stacked device which receives packets from its underlying device based on VLAN tagging. See [IEEE 802.1Q](http://www.ieee802.org/1/pages/802.1Q.html) for details.",
    vti: "An IPv4 over IPSec tunnel.",
    vti6: "An IPv6 over IPSec tunnel.",
    vxlan: "A virtual extensible LAN (vxlan), for connecting Cloud computing deployments.",
    geneve: "A GEneric NEtwork Virtualization Encapsulation (GENEVE) netdev driver.",
    l2tp: "A Layer 2 Tunneling Protocol (L2TP) is a tunneling protocol used to support virtual private networks (VPNs) or as part of the delivery of services by ISPs. It does not provide any encryption or confidentiality by itself",
    macsec: "Media Access Control Security (MACsec) is an 802.1AE IEEE industry-standard security technology that provides secure communication for all traffic on Ethernet links. MACsec provides point-to-point security on Ethernet links between directly connected nodes and is capable of identifying and preventing most security threats.",
    vrf: "A Virtual Routing and Forwarding ([VRF](https://docs.kernel.org/networking/vrf.html)) interface to create separate routing and forwarding domains.",
    vcan: "The virtual CAN driver (vcan). Similar to the network loopback devices, vcan offers a virtual local CAN interface.",
    vxcan: "The virtual CAN tunnel driver (vxcan). Similar to the virtual ethernet driver veth, vxcan implements a local CAN traffic tunnel between two virtual CAN network devices. When creating a vxcan, two vxcan devices are created as pair. When one end receives the packet it appears on its pair and vice versa. The vxcan can be used for cross namespace communication.",
    wireguard: "WireGuard Secure Network Tunnel.",
    nlmon: "A Netlink monitor device. Use an nlmon device when you want to monitor system Netlink messages.",
    fou: "Foo-over-UDP tunneling.",
    xfrm: "A virtual tunnel interface like vti/vti6 but with several advantages.",
    ifb: "The Intermediate Functional Block (ifb) pseudo network interface acts as a QoS concentrator for multiple different sources of traffic.",
    bareudp:
        "Bare UDP tunnels provide a generic L3 encapsulation support for tunnelling different L3 protocols like MPLS, IP etc. inside of a UDP tunnel.",
    batadv: "[B.A.T.M.A.N. Advanced](https://www.open-mesh.org/projects/open-mesh/wiki) is a routing protocol for multi-hop mobile ad-hoc networks which operates on layer 2.",
    ipoib: "An IP over Infiniband subinterface.",
    wlan: "A virtual wireless network (WLAN) interface.",
};
