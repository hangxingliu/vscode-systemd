import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const urlV255 = manpageURLs.historyBase(255) + "systemd.unit.html";

export const directives: CustomSystemdDirective[] = [
    {
        name: "systemd.battery-check",
        docs: "Takes a boolean. If specified with false, **systemd-battery-check** command will return immediately with exit status 0 without checking battery capacity and AC power existence, and the service `systemd-battery-check.service` will succeed. This may be useful when the command wrongly detects and reports battery capacity percentage or AC power existence, or when you want to boot the system forcibly.",
        url: urlV255,
        deprecated: 256,
        section: "",
        manPage: "systemd-battery-check.service(8)",
        since: 254,
    },
    {
        name: "net.ifname-policy",
        docs: "Translated into [systemd.link(5)](systemd.link.html) files.",
        url: urlV255,
        deprecated: 256,
        section: "",
        manPage: "systemd-network-generator.service(8)",
        since: 245,
    },
    {
        name: "net.ifname-policy",
        docs: 'Specifies naming policies applied when renaming network interfaces. Takes a list of policies and an optional MAC address separated with comma. Each policy value must be one of the policies understood by the `NamePolicy=` setting in .link files, e.g. "`onboard`" or "`path`". See [systemd.link(5)](systemd.link.html) for more details. When the MAC address is specified, the policies are applied to the interface which has the address. When no MAC address is specified, the policies are applied to all interfaces. This kernel command line argument can be specified multiple times.\n\nThis argument is not directly read by **systemd-udevd**, but is instead converted to a .link file by [systemd-network-generator.service(8)](systemd-network-generator.service.html). For this argument to take effect, `systemd-network-generator.service` must be enabled.\n\nExample:\n\nnet.ifname-policy=keep,kernel,path,slot,onboard,01:23:45:67:89:ab\nnet.ifname-policy=keep,kernel,path,slot,onboard,mac\n\nThis is mostly equivalent to creating the following .link files:\n\n\\# 91-name-policy-with-mac.link\n\\[Match\\]\nMACAddress=01:23:45:67:89:ab\n\n\\[Link\\]\nNamePolicy=keep kernel path slot onboard\nAlternativeNamePolicy=path slot onboard\n\nand\n\n\\# 92-name-policy-for-all.link\n\\[Match\\]\nOriginalName=\\*\n\n\\[Link\\]\nNamePolicy=keep kernel path slot onboard mac\nAlternativeNamePolicy=path slot onboard mac',
        url: urlV255,
        deprecated: 256,
        section: "",
        manPage: "systemd-udevd.service(8)",
        since: 250,
    },
    {
        name: "net.naming-scheme",
        docs: 'Network interfaces are renamed to give them predictable names when possible (unless `net.ifnames=0` is specified, see above). With this kernel command line option it is possible to pick a specific version of this algorithm and override the default chosen at compilation time. Expects one of the naming scheme identifiers listed in [systemd.net-naming-scheme(7)](systemd.net-naming-scheme.html), or "`latest`" to select the latest scheme known (to this particular version of `systemd-udevd.service`).\n\nNote that selecting a specific scheme is not sufficient to fully stabilize interface naming: the naming is generally derived from driver attributes exposed by the kernel. As the kernel is updated, previously missing attributes `systemd-udevd.service` is checking might appear, which affects older name derivation algorithms, too.',
        url: urlV255,
        deprecated: 256,
        section: "",
        manPage: "systemd-udevd.service(8)",
        since: 240,
    },
];
