import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd-system.conf(5)";
const url = manpageURLs.base + "systemd-system.conf.html";
const section = "Manager";

export const directives: CustomSystemdDirective[] = [
    {
        name: "ShutdownWatchdogSec",
        renamedTo: "RebootWatchdogSec",
        docs: 'Configure the hardware watchdog at runtime and at reboot. Takes a timeout value in seconds (or in other time units if suffixed with "`ms`", "`min`", "`h`", "`d`", "`w`"). If `RuntimeWatchdogSec=` is set to a non-zero value, the watchdog hardware (`/dev/watchdog` or the path specified with `WatchdogDevice=` or the kernel option `systemd.watchdog-device=`) will be programmed to automatically reboot the system if it is not contacted within the specified timeout interval. The system manager will ensure to contact it at least once in half the specified timeout interval. This feature requires a hardware watchdog device to be present, as it is commonly the case in embedded and server systems. Not all hardware watchdogs allow configuration of all possible reboot timeout values, in which case the closest available timeout is picked. `ShutdownWatchdogSec=` may be used to configure the hardware watchdog when the system is asked to reboot. It works as a safety net to ensure that the reboot takes place even if a clean reboot attempt times out. Note that the `ShutdownWatchdogSec=` timeout applies only to the second phase of the reboot, i.e. after all regular services are already terminated, and after the system and service manager process (PID 1) got replaced by the `systemd-shutdown` binary, see system [bootup(7)](https://www.freedesktop.org/software/systemd/man/latest/bootup.html) for details. During the first phase of the shutdown operation the system and service manager remains running and hence `RuntimeWatchdogSec=` is still honoured. In order to define a timeout on this first phase of system shutdown, configure `JobTimeoutSec=` and `JobTimeoutAction=` in the "`[Unit]`" section of the `shutdown.target` unit. By default `RuntimeWatchdogSec=` defaults to 0 (off), and `ShutdownWatchdogSec=` to 10min. These settings have no effect if a hardware watchdog is not available.',
        fixHelp:
            "The old `ShutdownWatchdogSec=` setting has been renamed to `RebootWatchdogSec=` to more clearly communicate what it is about. The old name is still accepted for compatibility.",
        deprecated: 243,
        section,
        manPage,
        url,
    },
];
