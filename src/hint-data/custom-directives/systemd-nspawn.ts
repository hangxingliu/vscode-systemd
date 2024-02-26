import { SectionGroupName } from "../../syntax/const-sections";
import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.nspawn(5)";
const url = manpageURLs.base + "systemd.nspawn.html";

export const directives: CustomSystemdDirective[] = [
    {
        name: "PrivateUsersChown",
        docs: "Configures whether the ownership of the files and directories in the container tree shall be adjusted to the UID/GID range used, if necessary and user namespacing is enabled. This is equivalent to the `--private-users-chown` command line switch. This option is privileged (see above).",
        deprecated: "249",
        section: "Files",
        manPage,
        url,
    },
];
