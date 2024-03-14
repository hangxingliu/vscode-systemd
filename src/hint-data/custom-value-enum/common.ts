import { SystemdValueEnum } from "../custom-value-enum/types";

export const knownMatchTypes: SystemdValueEnum["values"] = ["ether", "loopback", "wlan", "wwan", "${UDEV_DEVTYPE}"];

/**
 * https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html#WLANInterfaceType=
 *
 * `enum nl80211_iftype`
 */
export const wlanInterfaceTypes: SystemdValueEnum["docs"] = {
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

const signalActions = {
    Term: "Default action is to terminate the process.",
    Ign: "Default action is to ignore the signal.",
    Core: "Default action is to terminate the process and dump core. (see core(5)).",
    Stop: "Default action is to stop the process.",
    Cont: "Default action is to continue the process if it is currently stopped.",
};
const posix1990 = "POSIX.1-1990   \n";
const posix2001 = "the signal was added in SUSv2 and POSIX.1-2001   \n";
/**
 * https://man7.org/linux/man-pages/man7/signal.7.html
 *
 * `Standard signals`
 */
export const standardSignals: SystemdValueEnum["docs"] = {
    SIGABRT: `Abort signal from abort(3)\n\n${posix1990}${signalActions.Core}`,
    SIGALRM: `Timer signal from alarm(2)\n\n${posix1990}${signalActions.Term}`,
    SIGBUS: `Bus error (bad memory access)\n\n${posix2001}${signalActions.Core}`,
    SIGCHLD: `Child stopped or terminated\n\n${posix1990}${signalActions.Ign}`,
    SIGCLD: `A synonym for \`SIGCHLD\`\n\n${signalActions.Ign}`,
    SIGCONT: `Continue if stopped\n\n${posix1990}${signalActions.Cont}`,
    SIGEMT: `Emulator trap\n\n${signalActions.Term}`,
    SIGFPE: `Floating-point exception\n\n${posix1990}${signalActions.Core}`,
    SIGHUP: `Hangup detected on controlling terminal or death of controlling process\n\n${posix1990}${signalActions.Term}`,
    SIGILL: `Illegal Instruction\n\n${posix1990}${signalActions.Core}`,
    SIGINFO: `A synonym for \`SIGPWR\``,
    SIGINT: `Interrupt from keyboard\n\n${posix1990}${signalActions.Term}`,
    SIGIO: `I/O now possible (4.2BSD)\n\n${signalActions.Term}`,
    SIGIOT: `IOT trap. A synonym for \`SIGABRT\`\n\n${signalActions.Core}`,
    SIGKILL: `Kill signal\n\n${posix1990}${signalActions.Term}`,
    SIGLOST: `File lock lost (unused)\n\n${signalActions.Term}`,
    SIGPIPE: `Broken pipe: write to pipe with no readers; see pipe(7)\n\n${posix1990}${signalActions.Term}`,
    SIGPOLL: `Pollable event (Sys V); synonym for \`SIGIO\`\n\n${posix2001}${signalActions.Term}`,
    SIGPROF: `Profiling timer expired\n\n${posix2001}${signalActions.Term}`,
    SIGPWR: `Power failure (System V)\n\n${signalActions.Term}`,
    SIGQUIT: `Quit from keyboard\n\n${posix1990}${signalActions.Core}`,
    SIGSEGV: `Invalid memory reference\n\n${posix1990}${signalActions.Core}`,
    SIGSTKFLT: `Stack fault on coprocessor (unused)\n\n${signalActions.Term}`,
    SIGSTOP: `Stop process\n\n${posix1990}${signalActions.Stop}`,
    SIGTSTP: `Stop typed at terminal\n\n${posix1990}${signalActions.Stop}`,
    SIGSYS: `Bad system call (SVr4); see also seccomp(2)\n\n${posix2001}${signalActions.Core}`,
    SIGTERM: `Termination signal\n\n${posix1990}${signalActions.Term}`,
    SIGTRAP: `Trace/breakpoint trap\n\n${posix2001}${signalActions.Core}`,
    SIGTTIN: `Terminal input for background process\n\n${posix1990}${signalActions.Stop}`,
    SIGTTOU: `Terminal output for background process\n\n${posix1990}${signalActions.Stop}`,
    SIGUNUSED: `Synonymous with \`SIGSYS\`\n\n${signalActions.Core}`,
    SIGURG: `Urgent condition on socket (4.2BSD)\n\n${posix2001}${signalActions.Ign}`,
    SIGUSR1: `User-defined signal 1\n\n${posix1990}${signalActions.Term}`,
    SIGUSR2: `User-defined signal 2\n\n${posix1990}${signalActions.Term}`,
    SIGVTALRM: `Virtual alarm clock (4.2BSD)\n\n${posix2001}${signalActions.Term}`,
    SIGXCPU: `CPU time limit exceeded (4.2BSD); see setrlimit(2)\n\n${posix2001}${signalActions.Core}`,
    SIGXFSZ: `File size limit exceeded (4.2BSD); see setrlimit(2)\n\n${posix2001}${signalActions.Core}`,
    SIGWINCH: `Window resize signal (4.3BSD, Sun)\n\n${signalActions.Ign}`,
};

/**
 * https://www.freedesktop.org/software/systemd/man/latest/repart.d.html#%5BPartition%5D%20Section%20Options
 */
export const gptPartitionTypeIds: SystemdValueEnum["docs"] = {
    esp: "EFI System Partition",
    xbootldr: "Extended Boot Loader Partition",
    swap: "Swap partition",
    home: "Home (`/home/`) partition",
    srv: "Server data (`/srv/`) partition",
    var: "Variable data (`/var/`) partition",
    tmp: "Temporary data (`/var/tmp/`) partition",
    "linux-generic": "Generic Linux file system partition",
    root: "Root file system partition type appropriate for the local architecture (an alias for an architecture root file system partition type listed below, e.g. `root-x86-64`)",
    "root-verity": "Verity data for the root file system partition for the local architecture",
    "root-verity-sig": "Verity signature data for the root file system partition for the local architecture",
    "root-secondary":
        "Root file system partition of the secondary architecture of the local architecture (usually the matching 32-bit architecture for the local 64-bit architecture)",
    "root-secondary-verity": "Verity data for the root file system partition of the secondary architecture",
    "root-secondary-verity-sig":
        "Verity signature data for the root file system partition of the secondary architecture",
    "root-${arch}": "Root file system partition of the given architecture (such as `root-x86-64` or `root-riscv64`)",
    "root-${arch}-verity": "Verity data for the root file system partition of the given architecture",
    "root-${arch}-verity-sig": "Verity signature data for the root file system partition of the given architecture",
    usr: "`/usr/` file system partition type appropriate for the local architecture (an alias for an architecture `/usr/` file system partition type listed below, e.g. `usr-x86-64`)",
    "usr-verity": "Verity data for the `/usr/` file system partition for the local architecture",
    "usr-verity-sig": "Verity signature data for the `/usr/` file system partition for the local architecture",
    "usr-secondary":
        "`/usr/` file system partition of the secondary architecture of the local architecture (usually the matching 32-bit architecture for the local 64-bit architecture)",
    "usr-secondary-verity": "Verity data for the `/usr/` file system partition of the secondary architecture",
    "usr-secondary-verity-sig":
        "Verity signature data for the `/usr/` file system partition of the secondary architecture",
    "usr-${arch}": "`/usr/` file system partition of the given architecture     ",
    "usr-${arch}-verity": "Verity data for the `/usr/` file system partition of the given architecture",
    "usr-${arch}-verity-sig": "Verity signature data for the `/usr/` file system partition of the given architecture",
};
