import { PredefinedSignature } from "../types-manifest";
import { SystemdValueEnum } from "./types";
import * as common from "./common-unit-condition";
import { SystemdFileType } from "../../parser/file-info";
import { supportedNetdevKinds } from "./common";

const manPage = "systemd.link(5)";
const file = SystemdFileType.link;

export const valueEnum: SystemdValueEnum[] = [
    {
        directive: "Type",
        section: "Match",
        file,
        manPage,
        values: ["ether", "loopback", "wlan", "wwan", "${UDEV_DEVTYPE}"],
        sep: " ",
        prefixChars: "!",
    },
    {
        directive: "Kind",
        section: "Match",
        file,
        manPage,
        docs: supportedNetdevKinds,
        sep: " ",
        prefixChars: "!",
    },
    {
        directive: "Virtualization",
        section: "Match",
        file,
        manPage,
        docs: common.knownVirtualizationTechs,
        sep: " ",
        prefixChars: "!",
    },
    {
        directive: "Architecture",
        section: "Match",
        file,
        manPage,
        values: common.knownArchs,
        sep: " ",
        prefixChars: "!",
    },
    {
        directive: "Firmware",
        section: "Match",
        file,
        manPage,
        docs: common.knownFirmwareConds,
        sep: " ",
        prefixChars: "!",
    },
    // [Link]
    {
        directive: "MACAddressPolicy",
        section: "Link",
        file,
        manPage,
        docs: {
            persistent:
                "If the hardware has a persistent MAC address, as most hardware should, and if it is used by the kernel, nothing is done. Otherwise, a new MAC address is generated which is guaranteed to be the same on every boot for the given machine and the given device, but which is otherwise random. This feature depends on ID_NET_NAME_* properties to exist for the link. On hardware where these properties are not set, the generation of a persistent MAC address will fail.Added in version 211.",
            random: 'If the kernel is using a random MAC address, nothing is done. Otherwise, a new address is randomly generated each time the device appears, typically at boot. Either way, the random address will have the "`unicast`" and "`locally administered`" bits set.Added in version 211.',
            none: "Keeps the MAC address assigned by the kernel. Or use the MAC address specified in `MACAddress=`.Added in version 227.",
        },
    },
    {
        directive: "NamePolicy",
        section: "Link",
        file,
        manPage,
        docs: {
            kernel: "If the kernel claims that the name it has set for a device is predictable, then no renaming is performed. Added in version 216.",
            database:
                "The name is set based on entries in the udev's Hardware Database with the key `ID_NET_NAME_FROM_DATABASE`. Added in version 211.",
            onboard:
                "The name is set based on information given by the firmware for on-board devices, as exported by the udev property `ID_NET_NAME_ONBOARD`. See [systemd.net-naming-scheme(7)](https://www.freedesktop.org/software/systemd/man/latest/systemd.net-naming-scheme.html#). Added in version 211.",
            slot: "The name is set based on information given by the firmware for hot-plug devices, as exported by the udev property `ID_NET_NAME_SLOT`. See [systemd.net-naming-scheme(7)](https://www.freedesktop.org/software/systemd/man/latest/systemd.net-naming-scheme.html#). Added in version 211.",
            path: "The name is set based on the device's physical location, as exported by the udev property `ID_NET_NAME_PATH`. See [systemd.net-naming-scheme(7)](https://www.freedesktop.org/software/systemd/man/latest/systemd.net-naming-scheme.html#). Added in version 211.",
            mac: "The name is set based on the device's persistent MAC address, as exported by the udev property `ID_NET_NAME_MAC`. See [systemd.net-naming-scheme(7)](https://www.freedesktop.org/software/systemd/man/latest/systemd.net-naming-scheme.html#). Added in version 211.",
            keep: "If the device already had a name given by userspace (as part of creation of the device or a rename), keep it. Added in version 241.",
        },
    },
    // todo: WIP: AlternativeNamesPolicy...
    {
        directive: "MDI",
        section: "Link",
        file,
        manPage,
        values: ["straight", "mdi", "crossover", "mdi-x", "mdix", "auto"],
    },
];
