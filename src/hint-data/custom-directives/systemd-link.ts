import { manpageURLs } from "../manpage-url";
import { CustomSystemdDirective } from "./types";

const manPage = "systemd.link(5)";
const url = manpageURLs.base + "systemd.link.html";
const section = "Link";

export const directives: CustomSystemdDirective[] = [
    {
        // 2018-06-22
        // dead: true,
        name: "UDPSegmentationOffload",
        docs: 'The UDP Segmentation Offload (USO) when true enables UDP segmentation offload. Takes a boolean value. Defaults to "unset".',
        fixHelp:
            "Support for `UDPSegmentationOffload=` has been removed, given its limited support in hardware, and waning software support.",
        deprecated: 239,
        section,
        manPage,
        url,
    },
];
