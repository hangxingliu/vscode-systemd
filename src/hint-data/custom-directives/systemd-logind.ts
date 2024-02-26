import { SectionGroupName } from "../../syntax/const-sections";
import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "logind.conf(5)";
const url = manpageURLs.base + "logind.conf.html";

export const directives: CustomSystemdDirective[] = [
    {
        name: "UserTasksMax",
        docs: 'Sets the maximum number of OS tasks each user may run concurrently. This controls the `TasksMax=` setting of the per-user slice unit, see [systemd.resource-control(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html) for details. If assigned the special value "`infinity`", no tasks limit is applied. Defaults to 33%, which equals 10813 with the kernel\'s defaults on the host, but might be smaller in OS containers.',
        deprecated: "239",
        section: "Login",
        manPage,
        url,
    },
];
