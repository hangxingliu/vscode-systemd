import { SystemdValueEnum } from "./types";

const manPage = "systemd.resource-control(5)";

export const valueEnum: SystemdValueEnum[] = [
    {
        directive: "BPFProgram",
        manPage,
        values: [
            "egress",
            "ingress",
            "sock_create",
            "sock_ops",
            "device",
            "bind4",
            "bind6",
            "connect4",
            "connect6",
            "post_bind4",
            "post_bind6",
            "sendmsg4",
            "sendmsg6",
            "sysctl",
            "recvmsg4",
            "recvmsg6",
            "getsockopt",
            "setsockopt",
        ].map((it) => `${it}:\${program_path}`),
    },
    {
        directive: "MemoryPressureWatch",
        manPage,
        values: ["off", "on", "auto", "skip"],
    },

    {
        directive: "ManagedOOMSwap",
        values: ["auto", "kill"],
        manPage,
    },
    {
        directive: "ManagedOOMMemoryPressure",
        values: ["auto", "kill"],
        manPage,
    },
    {
        directive: "ManagedOOMPreference",
        values: ["none", "avoid", "omit"],
        manPage,
    },
];
