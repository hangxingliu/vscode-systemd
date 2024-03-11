import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.service(5)";
const url = manpageURLs.base + "systemd.service.html";
const section = "Service";

export const directives: CustomSystemdDirective[] = [
    {
        name: "PermissionsStartOnly",
        signature: "boolean",
        docs: "Takes a boolean argument. If true, the permission-related execution options, as configured with `User=` and similar options (see [systemd.exec(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) for more information), are only applied to the process started with `ExecStart=`, and not to the various other `ExecStartPre=`, `ExecStartPost=`, `ExecReload=`, `ExecStop=`, and `ExecStopPost=` commands. If false, the setting is applied to all configured commands the same way. Defaults to false.",
        fixHelp:
            'It is deprecated but still supported for backwards compatibility. The same functionality is provided by the more flexible "`+`", "`!`", and "`!!`" prefixes to `ExecStart=` and other commands.',
        fixURL: 'https://superuser.com/questions/1504114/permissionsstartonly-alternative-in-systemd',
        deprecated: 240,
        section,
        manPage,
        url,
    },
    {
        // DISABLED_LEGACY
        dead: true,
        name: "SysVStartPriority",
        docs: "Set the SysV start priority to use to order this service in relation to SysV services lacking LSB headers. This option is only necessary to fix ordering in relation to legacy SysV services that have no ordering information encoded in the script headers. As such, it should only be used as a temporary compatibility option and should not be used in new unit files. Almost always, it is a better choice to add explicit ordering directives via `After=` or `Before=`, instead. For more details, see [systemd.unit(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html). If used, pass an integer value in the range 0-99.",
        fixHelp: "Support for option `SysVStartPriority=` has been removed and it is ignored",
        deprecated: 218,
        section,
        manPage,
        url,
    },
    {
        // added from v217
        // deprecated since v230: DISABLED_LEGACY
        name: "BusPolicy",
        docs: "If specified, a custom [kdbus](https://code.google.com/p/d-bus/) endpoint will be created and installed as the default bus node for the service. Such a custom endpoint can hold an own set of policy rules that are enforced on top of the bus-wide ones. The custom endpoint is named after the service it was created for, and its node will be bind-mounted over the default bus node location, so the service can only access the bus through its own endpoint. Note that custom bus endpoints default to a 'deny all' policy. Hence, if at least one `BusPolicy=` directive is given, you have to make sure to add explicit rules for everything the service should be able to do.\n\nThe value of this directive is comprised of two parts; the bus name, and a verb to specify to granted access, which is one of `see`, `talk`, or `own`. `talk` implies `see`, and `own` implies both `talk` and `see`. If multiple access levels are specified for the same bus name, the most powerful one takes effect.\n\nExamples:\n\n    BusPolicy=org.freedesktop.systemd1 talk\n\n    BusPolicy=org.foo.bar see\n\nThis option is only available on kdbus enabled systems.",
        fixHelp: "Support for option `BusPolicy=` has been removed and it is ignored",
        deprecated: 230,
        section,
        manPage,
        url,
    },
];
