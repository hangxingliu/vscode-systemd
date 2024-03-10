import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd-sleep.conf(5)";
const section = "Sleep";
const url = manpageURLs.base + "systemd-sleep.conf.html";

const v255Fix =
    "`SuspendMode=`, `HibernateState=` and `HybridSleepState=` are now deprecated " +
    "and have no effect. They did not (and could not) take any value other than the respective " +
    "default. `HybridSleepMode=` is also deprecated, and will now always use the 'suspend' " +
    "disk mode.";

export const directives: CustomSystemdDirective[] = [
    //
    //#region v255
    //
    {
        name: "HibernateState",
        docs: "The string to be written to `/sys/power/state` by, respectively, [systemd-suspend.service(8)](systemd-suspend.service.html), [systemd-hibernate.service(8)](systemd-hibernate.service.html), or [systemd-hybrid-sleep.service(8)](systemd-hybrid-sleep.service.html). More than one value can be specified by separating multiple values with whitespace. They will be tried in turn, until one is written without error. If none of the writes succeed, the operation will be aborted.\n\nThe allowed set of values is determined by the kernel and is shown in the file itself (use **cat /sys/power/state** to display). See [the kernel documentation](https://www.kernel.org/doc/html/latest/admin-guide/pm/sleep-states.html#basic-sysfs-interfaces-for-system-suspend-and-hibernation) for more details.\n\n[systemd-suspend-then-hibernate.service(8)](systemd-suspend-then-hibernate.service.html) uses the value of `SuspendState=` when suspending and the value of `HibernateState=` when hibernating.",
        fixHelp: v255Fix,
        deprecated: 255,
        section,
        manPage,
        url,
    },
    {
        name: "HybridSleepMode",
        docs: "The string to be written to `/sys/power/disk` by, respectively, [systemd-suspend.service(8)](systemd-suspend.service.html), [systemd-hibernate.service(8)](systemd-hibernate.service.html), or [systemd-hybrid-sleep.service(8)](systemd-hybrid-sleep.service.html). More than one value can be specified by separating multiple values with whitespace. They will be tried in turn, until one is written without error. If none of the writes succeed, the operation will be aborted.\n\nThe allowed set of values is determined by the kernel and is shown in the file itself (use **cat /sys/power/disk** to display). See [the kernel documentation](https://www.kernel.org/doc/html/latest/admin-guide/pm/sleep-states.html#basic-sysfs-interfaces-for-system-suspend-and-hibernation) for more details.\n\n[systemd-suspend-then-hibernate.service(8)](systemd-suspend-then-hibernate.service.html) uses the value of `SuspendMode=` when suspending and the value of `HibernateMode=` when hibernating.",
        fixHelp: v255Fix,
        deprecated: 255,
        section,
        manPage,
        url,
    },
    {
        name: "HybridSleepState",
        docs: "The string to be written to `/sys/power/state` by, respectively, [systemd-suspend.service(8)](systemd-suspend.service.html), [systemd-hibernate.service(8)](systemd-hibernate.service.html), or [systemd-hybrid-sleep.service(8)](systemd-hybrid-sleep.service.html). More than one value can be specified by separating multiple values with whitespace. They will be tried in turn, until one is written without error. If none of the writes succeed, the operation will be aborted.\n\nThe allowed set of values is determined by the kernel and is shown in the file itself (use **cat /sys/power/state** to display). See [the kernel documentation](https://www.kernel.org/doc/html/latest/admin-guide/pm/sleep-states.html#basic-sysfs-interfaces-for-system-suspend-and-hibernation) for more details.\n\n[systemd-suspend-then-hibernate.service(8)](systemd-suspend-then-hibernate.service.html) uses the value of `SuspendState=` when suspending and the value of `HibernateState=` when hibernating.",
        fixHelp: v255Fix,
        deprecated: 255,
        section,
        manPage,
        url,
    },
    {
        name: "SuspendMode",
        docs: "The string to be written to `/sys/power/disk` by, respectively, [systemd-suspend.service(8)](systemd-suspend.service.html), [systemd-hibernate.service(8)](systemd-hibernate.service.html), or [systemd-hybrid-sleep.service(8)](systemd-hybrid-sleep.service.html). More than one value can be specified by separating multiple values with whitespace. They will be tried in turn, until one is written without error. If none of the writes succeed, the operation will be aborted.\n\nThe allowed set of values is determined by the kernel and is shown in the file itself (use **cat /sys/power/disk** to display). See [the kernel documentation](https://www.kernel.org/doc/html/latest/admin-guide/pm/sleep-states.html#basic-sysfs-interfaces-for-system-suspend-and-hibernation) for more details.\n\n[systemd-suspend-then-hibernate.service(8)](systemd-suspend-then-hibernate.service.html) uses the value of `SuspendMode=` when suspending and the value of `HibernateMode=` when hibernating.",
        fixHelp: v255Fix,
        deprecated: 255,
        section,
        manPage,
        url,
    },
    //
    //#endregion v255
    //
];
