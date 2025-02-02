import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.network(5)";
const url = manpageURLs.base + "systemd.network.html";
const urlV255 = manpageURLs.historyBase(255) + "systemd.network.html";

export const directives: CustomSystemdDirective[] = [
    //
    //#region deprecated since v256
    {
        name: "IPForward",
        docs: 'Configures IP packet forwarding for the system. If enabled, incoming packets on any network interface will be forwarded to any other interfaces according to the routing table. Takes a boolean, or the values "`ipv4`" or "`ipv6`", which only enable IP packet forwarding for the specified address family. This controls the `net.ipv4.ip_forward` and `net.ipv6.conf.all.forwarding` sysctl options of the network interface (see [IP Sysctl](https://docs.kernel.org/networking/ip-sysctl.html) for details about sysctl options). Defaults to "`no`".\n\nNote: this setting controls a global kernel option, and does so one way only: if a network that has this setting enabled is set up the global setting is turned on. However, it is never turned off again, even after all networks with this setting enabled are shut down again.\n\nTo allow IP packet forwarding only between specific network interfaces use a firewall.',
        fixHelp:
            "`IPForward=` setting in `.network` file is deprecated and replaced with `IPv4Forwarding=` and `IPv6Forwarding=` settings. These new settings are supported both in `.network` file and `networkd.conf`. If specified in a `.network` file, they control corresponding per-link settings. If specified in networkd.conf, they control corresponding global settings. Note, previously `IPv6SendRA=` and `IPMasquerade=` implied `IPForward=`, but now they imply the new per-link settings. One of the simplest ways to migrate configurations, that worked as a router with the previous version, is enabling both `IPv4Forwarding=` and `IPv6Forwarding=` in `networkd.conf`. See systemd.network(5) and networkd.conf(5) for more details.",
        deprecated: 256,
        url,
        section: "Network",
        manPage,
        since: 219,
    },
    {
        name: "TTLPropagate",
        docs: "Takes a boolean. When true enables TTL propagation at Label Switched Path (LSP) egress. When unset, the kernel's default will be used.",
        fixHelp: "The implementation behind TTLPropagate= network setting has been removed and the setting is now ignored",
        deprecated: 256,
        section: "Route",
        manPage,
        since: 243,
    },
    {
        name: "UseICMP6RateLimit",
        docs: "Takes a boolean. When true, the ICMP6 rate limit received in the Router Advertisement will be set to ICMP6 rate limit based on the advertisement. Defaults to true.",
        deprecated: 256,
        fixURL: 'https://github.com/systemd/systemd/commit/39af486a7fdc67817652c51d9bf42ca051ed8ff2',
        url: urlV255,
        section: "IPv6AcceptRA",
        manPage,
        since: 255,
    },
    //#endregion deprecated since v256
    //
    {
        name: "CriticalConnection",
        renamedTo: "KeepConfiguration",
        signature: "boolean",
        docs: "When true, the connection will never be torn down even if the DHCP lease expires. This is contrary to the DHCP specification, but may be the best choice if, say, the root filesystem relies on this connection. Defaults to false.",
        fixHelp:
            "It is replaced by a new `KeepConfiguration=` setting which allows more detailed configuration of the IP configuration to keep in place.",
        deprecated: 243,
        section: [`DHCPv4`, "DHCPv6", "DHCP"],
        manPage,
        url,
    },
    {
        name: "IPv6PrefixDelegation",
        renamedTo: "IPv6SendRA",
        docs: 'Whether to enable or disable Router Advertisement sending on a link. Allowed values are "`static`" which distributes prefixes as defined in the \\[IPv6PrefixDelegation\\] and any \\[IPv6Prefix\\] sections, "`dhcpv6`" which requests prefixes using a DHCPv6 client configured for another link and any values configured in the \\[IPv6PrefixDelegation\\] section while ignoring all static prefix configuration sections, "`yes`" which uses both static configuration and DHCPv6, and "`false`" which turns off IPv6 prefix delegation altogether. Defaults to "`false`". See the \\[IPv6PrefixDelegation\\] and the \\[IPv6Prefix\\] sections for more configuration options.',
        fixHelp:
            "`IPv6PrefixDelegation=` options has been renamed as `IPv6SendRA=` (the old names are still accepted for backwards compatibility).",
        deprecated: 247,
        section: ["Network"],
        manPage,
        url,
    },
    {
        name: "IPv6Token",
        docs: 'Specifies an optional address generation mode for the Stateless Address Autoconfiguration (SLAAC). Supported modes are "`prefixstable`" and "`static`".\n\nWhen the mode is set to "`static`", an IPv6 address must be specified after a colon ("`:`"), and the lower bits of the supplied address are combined with the upper bits of a prefix received in a Router Advertisement (RA) message to form a complete address. Note that if multiple prefixes are received in an RA message, or in multiple RA messages, addresses will be formed from each of them using the supplied address. This mode implements SLAAC but uses a static interface identifier instead of an identifier generated by using the EUI-64 algorithm. Because the interface identifier is static, if Duplicate Address Detection detects that the computed address is a duplicate (in use by another node on the link), then this mode will fail to provide an address for that prefix. If an IPv6 address without mode is specified, then "`static`" mode is assumed.\n\nWhen the mode is set to "`prefixstable`" the [RFC 7217](https://tools.ietf.org/html/rfc7217) algorithm for generating interface identifiers will be used. This mode can optionally take an IPv6 address separated with a colon ("`:`"). If an IPv6 address is specified, then an interface identifier is generated only when a prefix received in an RA message matches the supplied address.\n\nIf no address generation mode is specified (which is the default), or a received prefix does not match any of the addresses provided in "`prefixstable`" mode, then the EUI-64 algorithm will be used to form an interface identifier for that prefix. This mode is also SLAAC, but with a potentially stable interface identifier which does not directly map to the interface\'s hardware address.\n\nNote that the "`prefixstable`" algorithm uses both the interface name and MAC address as input to the hash to compute the interface identifier, so if either of those are changed the resulting interface identifier (and address) will change, even if the prefix received in the RA message has not changed.\n\nThis setting can be specified multiple times. If an empty string is assigned, then the all previous assignments are cleared.\n\nExamples:\n\n    IPv6Token=::1a:2b:3c:4d\n    IPv6Token=static:::1a:2b:3c:4d\n    IPv6Token=prefixstable\n    IPv6Token=prefixstable:2002:da8:1::',
        fixHelp:
            "The `[IPv6AcceptRA]` section gained the `Token=` setting for its replacement. The `[IPv6Prefix]` section also gained the `Token=` setting. The `Token=` setting gained 'eui64' mode to explicitly configure an address with the EUI64 algorithm based on the interface MAC address. The 'prefixstable' mode can now optionally take a secret key. The `Token=` setting in the `[DHCPPrefixDelegation]` section now supports all algorithms supported by the same settings in the other sections.",
        section: ["Network"],
        deprecated: 250,
        manPage,
        url,
    },
    {
        name: "PrefixRoute",
        // renamedTo: 'AddPrefixRoute',
        signature: "boolean",
        docs: "Takes a boolean. When adding or modifying an IPv6 address, the userspace application needs a way to suppress adding a prefix route. This is for example relevant together with IFA\\_F\\_MANAGERTEMPADDR, where userspace creates autoconf generated addresses, but depending on on-link, no route for the prefix should be added. Defaults to false.",
        fixHelp: "It has been deprecated, and replaced by `AddPrefixRoute=`, with its sense inverted.",
        section: ["Address"],
        deprecated: 245,
        manPage,
        url,
    },
    {
        // dead: true,
        name: [
            "NetworkEmulatorDelaySec",
            "NetworkEmulatorDelayJitterSec",
            "NetworkEmulatorLossRate",
            "NetworkEmulatorDuplicateRate",
            "NetworkEmulatorPacketLimit",
        ],
        section: "TrafficControlQueueingDiscipline",
        docs:
            "The `[TrafficControlQueueingDiscipline]` section in .network files has" +
            'been renamed to `[NetworkEmulator]` with the "NetworkEmulator" prefix' +
            "dropped from the individual setting names.",
        fixHelp: 'Please move this setting into the section `NetworkEmulator` and remove its "NetworkEmulator" prefix',
        deprecated: 245,
        manPage,
        url,
    },
    {
        // dead: true,
        name: ["InitialQuantum", "Quantum"],
        renamedTo: ["InitialQuantumBytes", "QuantumBytes"],
        docs: "Please see `InitialQuantumBytes=` and `QuantumBytes=`",
        fixHelp: "They were renamed with a `Bytes` suffix.",
        section: "FairQueueing",
        deprecated: 246,
        manPage,
        url,
    },
    {
        internal: true,
        name: "IPv4LL",
        docs: "backwards compatibility: do not add new entries to this section",
        fixHelp: "Please use `LinkLocalAddressing=` instead",
        section: "Network",
        manPage,
        url,
    },
    {
        // commit hash: ad0734e890b25751ef8229e47210ff11ae8fa3f3
        // author: Tom Gundersen <teg@jklm.no>
        // temporary name between v215 and v216
        dead: true,
        name: "UseDomainName",
        renamedTo: "UseDomains",
        docs: "When true (not the default), the domain name received from the DHCP server will be used for DNS resolution over this link.",
        fixHelp: "Please rename `UseDomainName=` to `UseDomains=`",
        deprecated: 216,
        section: ["DHCP", "DHCPv4"],
        manPage,
        url,
    },
    {
        // 2016-07-25
        dead: true,
        name: "IPv6AcceptRouterAdvertisements",
        renamedTo: "IPv6AcceptRA",
        docs: "Please see `IPv6AcceptRA=`",
        fixHelp:
            "`IPv6AcceptRouterAdvertisements=` option has been" +
            "renamed `IPv6AcceptRA=`, without altering its behaviour. The old" +
            "setting name remains available for compatibility reasons.",
        section: "Network",
        deprecated: 231,
        manPage,
        url,
    },
    {
        name: "DHCPv6PrefixDelegation",
        renamedTo: "DHCPPrefixDelegation",
        signature: "boolean",
        docs: "Takes a boolean value. When enabled, requests prefixes using a DHCPv6 client configured on another link. By default, an address within each delegated prefix will be assigned, and the prefixes will be announced through IPv6 Router Advertisement when `IPv6SendRA=` is enabled. Such default settings can be configured in \\[DHCPv6PrefixDelegation\\] section. Defaults to disabled.",
        fixHelp: "Please rename it to `DHCPPrefixDelegation=`",
        section: "Network",
        deprecated: 250,
        manPage,
        url,
    },
    {
        name: "BlackList",
        renamedTo: "DenyList",
        docs: "A whitespace-separated list of IPv4 addresses/IPv6 prefixes. DHCP offers from servers in the list are rejected. IPv6 prefixes supplied via router advertisements in the list are ignored.",
        fixHelp:
            "The `BlackList=` settings in `.network` files' `[DHCPv4]` and" +
            "`[IPv6AcceptRA]` sections have been renamed `DenyList=`. The old names" +
            "are still understood to provide compatibility.",
        section: ["IPv6AcceptRA", "DHCPv4"],
        deprecated: 246,
        manPage,
        url,
    },
    {
        // renamed since v246
        internal: true,
        name: "Burst",
        renamedTo: "BurstBytes",
        docs: "Specifies the size of the bucket. This is the maximum amount of bytes that tokens can be available for instantaneous transfer. When the size is suffixed with K, M, or G, it is parsed as Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1000. Defaults to unset.",
        section: "TokenBucketFilter",
        deprecated: 246,
        manPage,
        url,
    },
    {
        // renamed since v246
        internal: true,
        name: "LimitSize",
        renamedTo: "LimitBytes",
        docs: "Takes the number of bytes that can be queued waiting for tokens to become available. When the size is suffixed with K, M, or G, it is parsed as Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1000. Defaults to unset.",
        section: "TokenBucketFilter",
        manPage,
        url,
    },
    {
        name: "IgnoreUserspaceMulticastGroups",
        renamedTo: "IgnoreUserspaceMulticastGroup",
        docs: "`IgnoreUserspaceMulticastGroup` takes a boolean value. When true, the kernel ignores multicast groups handled by userspace. Defaults to unset, and the kernel's default is used.",
        section: "IPoIB",
        deprecated: 250,
        manPage,
        url,
    },
    {
        name: "ForceDHCPv6PDOtherInformation",
        signature: "boolean",
        docs: "Takes a boolean that enforces DHCPv6 stateful mode when the 'Other information' bit is set in Router Advertisement messages. By default setting only the 'O' bit in Router Advertisements makes DHCPv6 request network information in a stateless manner using a two-message Information Request and Information Reply message exchange. [RFC 7084](https://tools.ietf.org/html/rfc7084), requirement WPD-4, updates this behavior for a Customer Edge router so that stateful DHCPv6 Prefix Delegation is also requested when only the 'O' bit is set in Router Advertisements. This option enables such a CE behavior as it is impossible to automatically distinguish the intention of the 'O' bit otherwise. By default this option is set to false, enable it if no prefixes are delegated when the device should be acting as a CE router.",
        fixHelp:
            "The `ForceDHCPv6PDOtherInformation=` setting in the `[DHCPv6]` section" +
            "has been removed. Please use the `WithoutRA=` and `UseDelegatedPrefix=`" +
            "settings in the `[DHCPv6]` section and the `DHCPv6Client=` setting in the" +
            "`[IPv6AcceptRA]` section to control when the DHCPv6 client is started" +
            "and how the delegated prefixes are handled by the DHCPv6 client.",
        section: ["DHCPv6", "DHCP"],
        deprecated: 250,
        manPage,
        url,
    },
    {
        // 2017-03-01
        // This directive can not be marked as dead,
        // the same name directive is active in the section [Bridge]
        name: "ProxyARP",
        renamedTo: "IPV4ProxyARP",
        signature: "boolean",
        docs: 'A boolean. Configures proxy ARP. Proxy ARP is the technique in which one host, usually a router, answers ARP requests intended for another machine. By "faking" its identity, the router accepts responsibility for routing packets to the "real" destination. (see [RFC 1027](https://tools.ietf.org/html/rfc1027). Defaults to unset.',
        fixHelp:
            "The systemd-networkd `ProxyARP=` option has been renamed to `IPV4ProxyARP=`. The old names continue to be available for compatibility.",
        section: "Network",
        deprecated: 233,
        manPage,
        url,
    },
];
