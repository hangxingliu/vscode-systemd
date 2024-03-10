import { SystemdFileType } from "../../parser/file-info";
import { SystemdValueEnum } from "./types";

const section = "Socket";
const file = SystemdFileType.socket;

export const valueEnum: SystemdValueEnum[] = [
    {
        directive: "BindIPv6Only",
        section,
        file,
        values: ["default", "both", "ipv6-only"],
    },
    {
        directive: "IPTOS",
        section,
        file,
        values: ["low-delay", "throughput", "reliability", "low-cost"],
    },
    {
        directive: "SocketProtocol",
        section,
        file,
        values: ["udplite", "sctp"],
    },
    {
        directive: "TCPCongestion",
        section,
        file,
        values: ["westwood", "veno", "cubic", "lp"],
    },
    {
        directive: "Timestamping",
        section,
        file,
        values: ["off", "us", "usec", "μs", "ns", "nsec"],
    },
];
