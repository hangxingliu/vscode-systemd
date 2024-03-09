import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.unit(5)";
const url = manpageURLs.base + "systemd.unit.html";

export const directives: CustomSystemdDirective[] = [
    {
        dead: true,
        name: "StartLimitInterval",
        renamedTo: "StartLimitIntervalSec",
        docs: "It was renamed to `StartLimitIntervalSec=`",
        deprecated: 230,
        section: "Unit",
        manPage,
        url,
    },
    {
        dead: true,
        name: ["RequiresOverridable", "RequisiteOverridable"],
        docs: "Removed settings",
        fixHelp:
            "The dependency types `RequiresOverridable=` and" +
            "`RequisiteOverridable=` have been removed from systemd. They" +
            "have been used only very sparingly to our knowledge and" +
            "other options that provide a similar effect (such as" +
            "`systemctl --mode=ignore-dependencies`) are much more useful" +
            "and commonly used. Moreover, they were only half-way" +
            "implemented as the option to control behaviour regarding" +
            "these dependencies was never added to systemctl. By removing" +
            "these dependency types the execution engine becomes a bit" +
            "simpler. Unit files that use these dependencies should be" +
            "changed to use the non-Overridable dependency types" +
            "instead. In fact, when parsing unit files with these" +
            "options, that's what systemd will automatically convert them" +
            "too, but it will also warn, asking users to fix the unit" +
            "files accordingly. Removal of these dependency types should" +
            "only affect a negligible number of unit files in the wild.",
        deprecated: 228,
        section: "Unit",
        manPage,
        url,
    },
    {
        dead: true,
        name: ["PropagateReloadTo", "PropagateReloadFrom"],
        renamedTo: ["PropagatesReloadTo", "ReloadPropagatedFrom"],
        docs: "Lists one or more units where reload requests on the unit will be propagated to/on the other unit will be propagated from. Issuing a reload request on a unit will automatically also enqueue a reload request on all units that the reload request shall be propagated to via these two settings.",
        deprecated: 187,
        section: "Unit",
        manPage,
        url,
    },
    {
        // https://cgit.freedesktop.org/systemd/systemd/commit/?id=d420282b2
        // commit hash: d420282b28f50720e233ccb1c02547c562195653
        // author: Lennart Poettering <lennart@poettering.net>
        dead: true,
        name: "OnFailureIsolate",
        renamedTo: "OnFailureJobMode",
        signature: "boolean",
        docs: "Takes a boolean argument. If `true`, the unit listed in `OnFailure=` will be enqueued in isolation mode, i.e. all units that are not its dependency will be stopped. If this is set, only a single unit may be listed in `OnFailure=`. Defaults to `false`.",
        fixHelp:
            "Please replace `OnFailureIsolate=` setting by a more generic `OnFailureJobMode=` setting and make use of it where applicable",
        deprecated: 209,
        section: "Unit",
        manPage,
        url,
    },
    {
        dead: true,
        name: "BindTo",
        docs: "Configures requirement dependencies, very similar in style to `Requires=`, however in addition to this behaviour it also declares that this unit is stopped when any of the units listed suddenly disappears. Units can suddenly, unexpectedly disappear if a service terminates on its own choice, a device is unplugged or a mount point unmounted without involvement of systemd.",
        fixHelp: "It is renamed to `BindsTo`",
        renamedTo: "BindsTo",
        deprecated: 187,
        section: "Unit",
        manPage,
        url,
    },

    {
        // DISABLED_LEGACY
        name: "IgnoreOnSnapshot",
        signature: "boolean",
        docs: "Takes a boolean argument. If `true`, this unit will not be included in snapshots. Defaults to `true` for device and snapshot units, `false` for the others.",
        fixHelp: "Support for option `IgnoreOnSnapshot=` has been removed and it is ignored",
        deprecated: 228,
        section: "Unit",
        manPage,
        url,
    },
];
