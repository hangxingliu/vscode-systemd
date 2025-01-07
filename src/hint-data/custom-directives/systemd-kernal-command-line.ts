import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "kernel-command-line(7)";
const urlV255 = manpageURLs.historyBase(255) + "systemd.unit.html";

export const directives: CustomSystemdDirective[] = [
    {
        name: "net.naming-scheme",
        docs: "Parameters understood by the device event managing daemon. For details, see [systemd-udevd.service(8)](systemd-udevd.service.html).",
        deprecated: 256,
        url: urlV255,
        section: "",
        manPage,
        since: 186,
    },
    {
        name: "systemd.clock-usec",
        docs: "Takes a decimal, numeric timestamp in μs since January 1st 1970, 00:00am, to set the system clock to. The system time is set to the specified timestamp early during boot. It is not propagated to the hardware clock (RTC).",
        deprecated: 256,
        url: urlV255,
        section: "",
        manPage,
        since: 246,
    },
    {
        name: "systemd.condition-first-boot",
        docs: "Takes a boolean argument. If specified, overrides the result of `ConditionFirstBoot=` unit condition checks. See [systemd.unit(5)](systemd.unit.html) for details. Not to be confused with `systemd.firstboot=` which only controls behaviour of the `systemd-firstboot.service` system service but has no effect on the condition check (see above).",
        deprecated: 256,
        url: urlV255,
        section: "",
        manPage,
        since: 246,
    },
    {
        name: "systemd.condition-needs-update",
        docs: "Takes a boolean argument. If specified, overrides the result of `ConditionNeedsUpdate=` unit condition checks. See [systemd.unit(5)](systemd.unit.html) for details.",
        deprecated: 256,
        url: urlV255,
        section: "",
        manPage,
        since: 246,
    },
    {
        name: "systemd.random-seed",
        docs: "Takes a base64 encoded random seed value to credit with full entropy to the kernel's random pool during early service manager initialization. This option is useful in testing environments where delays due to random pool initialization in entropy starved virtual machines shall be avoided.\n\nNote that if this option is used the seed is accessible to unprivileged programs from `/proc/cmdline`. This option is hence a security risk when used outside of test systems, since the (possibly) only seed used for initialization of the kernel's entropy pool might be easily acquired by unprivileged programs.\n\nIt is recommended to pass 512 bytes of randomized data (as that matches the Linux kernel pool size), which may be generated with a command like the following:\n\ndd if=/dev/urandom bs=512 count=1 status=none | base64 -w 0\n\nAgain: do not use this option outside of testing environments, it's a security risk elsewhere, as secret key material derived from the entropy pool can possibly be reconstructed by unprivileged programs.",
        deprecated: 256,
        url: urlV255,
        section: "",
        manPage,
        since: 246,
    },
];
