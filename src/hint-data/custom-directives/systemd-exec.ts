import { SectionGroupName } from "../../syntax/common/section-names";
import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.exec(5)";
const url = manpageURLs.base + "systemd.exec.html";
const section = SectionGroupName.Execution;

export const directives: CustomSystemdDirective[] = [
    {
        // 2016-07-25
        dead: true,
        name: ["InaccessableDirectories", "InaccessibleDirectories", "ReadOnlyDirectories", "ReadWriteDirectories"],
        renamedTo: ["InaccessiblePaths", "InaccessiblePaths", "ReadOnlyPaths", "ReadWritePaths"],
        docs: 'Sets up a new file system namespace for executed processes. These options may be used to limit access a process might have to the main file system hierarchy. Each setting takes a space-separated list of absolute directory paths. Directories listed in `ReadWriteDirectories=` are accessible from within the namespace with the same access rights as from outside. Directories listed in `ReadOnlyDirectories=` are accessible for reading only, writing will be refused even if the usual file access controls would permit this. Directories listed in `InaccessibleDirectories=` will be made inaccessible for processes inside the namespace, and may not countain any other mountpoints, including those specified by `ReadWriteDirectories=` or `ReadOnlyDirectories=`. Note that restricting access with these options does not extend to submounts of a directory that are created later on. These options may be specified more than once, in which case all directories listed will have limited access from within the namespace. If the empty string is assigned to this option, the specific list is reset, and all prior assignments have no effect.\n\nPaths in `ReadOnlyDirectories=` and `InaccessibleDirectories=` may be prefixed with "`-`", in which case they will be ignored when they do not exist. Note that using this setting will disconnect propagation of mounts from the service to the host (propagation in the opposite direction continues to work). This means that this setting may not be used for services which shall be able to install mount points in the main mount namespace.',
        fixHelp:
            "The `InaccessableDirectories=`, `ReadOnlyDirectories=` and" +
            "`ReadWriteDirectories=` unit file settings have been renamed to" +
            "`InaccessablePaths=`, `ReadOnlyPaths=` and `ReadWritePaths=` and may now be" +
            "applied to all kinds of file nodes, and not just directories, with" +
            "the exception of symlinks. Specifically these settings may now be" +
            "used on block and character device nodes, UNIX sockets and FIFOS as" +
            "well as regular files. The old names of these settings remain" +
            "available for compatibility.",
        deprecated: 231,
        section,
        manPage,
        url,
    },
    {
        // 2016-05-21
        dead: true,
        name: "Capabilities",
        docs:
            "The `Capabilities=` unit file setting has been removed (it is ignored" +
            "for backwards compatibility). `AmbientCapabilities=` and" +
            "`CapabilityBoundingSet=` should be used instead.",
        fixHelp: "Please change use `AmbientCapabilities=` or `CapabilityBoundingSet=` to instead of it",
        deprecated: 230,
        section,
        manPage,
        url,
    },
];
