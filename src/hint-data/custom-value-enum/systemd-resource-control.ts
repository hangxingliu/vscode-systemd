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
        directive: "DevicePolicy",
        manPage,
        docs: {
            strict: "means to only allow types of access that are explicitly specified. Added in version 208.",
            closed: " in addition, allows access to standard pseudo devices including `/dev/null`, `/dev/zero`, `/dev/full`, `/dev/random`, and `/dev/urandom`. Added in version 208.",
            auto: "in addition, allows access to all devices if no explicit `DeviceAllow=` is present. This is the default. Added in version 208.",
        },
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
