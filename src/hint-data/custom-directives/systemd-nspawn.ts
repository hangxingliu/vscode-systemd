import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.nspawn(5)";
const url = manpageURLs.base + "systemd.nspawn.html";

export const directives: CustomSystemdDirective[] = [
    {
        // https://github.com/systemd/systemd/commit/6c045a999800c62368470938307951bb669f5afc
        name: "PrivateUsersChown",
        renamedTo: "PrivateUsersOwnership",
        docs: "Configures whether the ownership of the files and directories in the container tree shall be adjusted to the UID/GID range used, if necessary and user namespacing is enabled. This is equivalent to the `--private-users-chown` command line switch. This option is privileged (see above).",
        deprecated: 249,
        section: "Files",
        manPage,
        url,
    },
];
