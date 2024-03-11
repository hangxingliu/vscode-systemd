import { SystemdValueEnum } from "./types";

/**
 * https://www.freedesktop.org/software/systemd/man/latest/systemd-detect-virt.html#
 *
 * Generator: src/analyzer/virtualization-tech.ts
 */
export const knownVirtualizationTechs: SystemdValueEnum["docs"] = {
    vm: "generic VM solution",
    container: "generic container solution",

    qemu: "*Type: VM*   \nQEMU software virtualization, without KVM",
    kvm:
        "*Type: VM*   \n" +
        "Linux KVM kernel virtual machine, in combination with QEMU. Not used for other virtualizers using the KVM interfaces, such as Oracle VirtualBox or Amazon EC2 Nitro, see below.",
    amazon: "*Type: VM*   \nAmazon EC2 Nitro using Linux KVM",
    zvm: "*Type: VM*   \ns390 z/VM",
    vmware: "*Type: VM*   \nVMware Workstation or Server, and related products",
    microsoft: "*Type: VM*   \n" + "Hyper-V, also known as Viridian or Windows Server Virtualization",
    oracle:
        "*Type: VM*   \n" +
        "Oracle VM VirtualBox (historically marketed by innotek and Sun Microsystems), for legacy and KVM hypervisor",
    powervm: "*Type: VM*   \n" + "IBM PowerVM hypervisor — comes as firmware with some IBM POWER servers",
    xen: "*Type: VM*   \nXen hypervisor (only domU, not dom0)",
    bochs: "*Type: VM*   \nBochs Emulator",
    uml: "*Type: VM*   \nUser-mode Linux",
    parallels: "*Type: VM*   \nParallels Desktop, Parallels Server",
    bhyve: "*Type: VM*   \nbhyve, FreeBSD hypervisor",
    qnx: "*Type: VM*   \nQNX hypervisor",
    acrn: "*Type: VM*   \n[ACRN hypervisor](https://projectacrn.org)",
    apple:
        "*Type: VM*   \n" +
        "[Apple Virtualization.framework](https://developer.apple.com/documentation/virtualization)",
    sre:
        "*Type: VM*   \n" +
        "[LMHS SRE hypervisor](https://www.lockheedmartin.com/en-us/products/Hardened-Security-for-Intel-Processors.html)",
    openvz: "*Type: Container*   \nOpenVZ/Virtuozzo",
    lxc: "*Type: Container*   \nLinux container implementation by LXC",
    "lxc-libvirt": "*Type: Container*   \nLinux container implementation by libvirt",
    "systemd-nspawn":
        "*Type: Container*   \n" +
        "systemd's minimal container implementation, see [systemd-nspawn(1)](systemd-nspawn.html#)",
    docker: "*Type: Container*   \nDocker container manager",
    podman: "*Type: Container*   \n[Podman](https://podman.io) container manager",
    rkt: "*Type: Container*   \nrkt app container runtime",
    wsl: "*Type: Container*   \n" + "[Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/about)",
    proot: "*Type: Container*   \n" + "[proot](https://proot-me.github.io/) userspace chroot/bind mount emulation",
    pouch: "*Type: Container*   \n" + "[Pouch](https://github.com/alibaba/pouch) Container Engine",

    "private-users": "running in a user namespace",
};

export const knownFirmwareConds = {
    uefi: "matches systems with EFI.",
    "device-tree": "matches systems with a device tree.",
    "device-tree-compatible(${value})": 'matches systems with a device tree that are compatible with "`value`".',
    "smbios-field(${field} ${operator} ${value})":
        'matches systems with a SMBIOS field containing a certain value. *`field`* is the name of the SMBIOS field exposed as "`sysfs`" attribute file below `/sys/class/dmi/id/`. *`operator`* is one of "`<`", "`<=`", "`>=`", "`>`", "`==`", "`<>`" for version comparisons, "`=`" and "`!=`" for literal string comparisons, or "`$=`", "`!$=`" for shell-style glob comparisons. *`value`* is the expected value of the SMBIOS field value (possibly containing shell style globs in case "`$=`"/"`!$=`" is used).',
};

export const knownSecurityTechs = {
    selinux: "SELinux MAC",
    apparmor: "AppArmor MAC",
    tomoyo: "Tomoyo MAC",
    smack: "SMACK MAC",
    ima: "Integrity Measurement Architecture (IMA)",
    audit: "Linux Audit Framework",
    "uefi-secureboot": "UEFI SecureBoot",
    tpm2: "Trusted Platform Module 2.0 (TPM2)",
    cvm: "Confidential virtual machine (SEV/TDX)",
    "measured-uki":
        "Unified Kernel Image with PCR 11 Measurements, as per [systemd-stub(7)](systemd-stub.html).\nAdded in version 255.",
};

export const knownArchs = [
    "x86",
    "x86-64",
    "ppc",
    "ppc-le",
    "ppc64",
    "ppc64-le",
    "ia64",
    "parisc",
    "parisc64",
    "s390",
    "s390x",
    "sparc",
    "sparc64",
    "mips",
    "mips-le",
    "mips64",
    "mips64-le",
    "alpha",
    "arm",
    "arm-be",
    "arm64",
    "arm64-be",
    "sh",
    "sh64",
    "m68k",
    "tilegx",
    "cris",
    "arc",
    "arc-be",
    "native",
];

/**
 * https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html#ConditionCPUFeature=
 */
export const knownCPUFeatures = [
    "fpu",
    "vme",
    "de",
    "pse",
    "tsc",
    "msr",
    "pae",
    "mce",
    "cx8",
    "apic",
    "sep",
    "mtrr",
    "pge",
    "mca",
    "cmov",
    "pat",
    "pse36",
    "clflush",
    "mmx",
    "fxsr",
    "sse",
    "sse2",
    "ht",
    "pni",
    "pclmul",
    "monitor",
    "ssse3",
    "fma3",
    "cx16",
    "sse4_1",
    "sse4_2",
    "movbe",
    "popcnt",
    "aes",
    "xsave",
    "osxsave",
    "avx",
    "f16c",
    "rdrand",
    "bmi1",
    "avx2",
    "bmi2",
    "rdseed",
    "adx",
    "sha_ni",
    "syscall",
    "rdtscp",
    "lm",
    "lahf_lm",
    "abm",
    "constant_tsc",
];
