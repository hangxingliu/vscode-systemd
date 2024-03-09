import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "logind.conf(5)";
const url = manpageURLs.base + "logind.conf.html";

export const directives: CustomSystemdDirective[] = [
    {
        name: "UserTasksMax",
        docs: 'Sets the maximum number of OS tasks each user may run concurrently. This controls the `TasksMax=` setting of the per-user slice unit, see [systemd.resource-control(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html) for details. If assigned the special value "`infinity`", no tasks limit is applied. Defaults to 33%, which equals 10813 with the kernel\'s defaults on the host, but might be smaller in OS containers.',
        fixHelp:
            "`UserTasksMax=` setting in `logind.conf` was removed. Instead, the generic `TasksMax=` setting on the slice should be used. Instead of a transient unit we use a drop-in to tweak the default definition of a .slice. It's better to use the normal unit mechanisms instead of creating units on the fly. This will also make it easier to start `user@.service` independently of logind, or set additional settings like `MemoryMax=` for user slices.\n <https://github.com/systemd/systemd/commit/284149392755f086d0a714071c33aa609e61505e>",
        deprecated: 239,
        section: "Login",
        manPage,
        url,
    },
];
