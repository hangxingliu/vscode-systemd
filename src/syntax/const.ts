export const languageId = 'systemd-conf';

export const knownSections = [
    'Automount',
    'Bridge',
    'DHCPServer',
    'Distribution',
    'Install',
    'Link',
    'Match',
    'Mount',
    'NetDev',
    'Network',
    'Output',
    'Path',
    'Partitions',
    'Packages',
    'Peer',
    'Resolve',
    'Service',
    'Socket',
    'Swap',
    'Timer',
    'Tunnel',
    'Unit',
    'VLAN',
];

export const deprecatedDirectives = [
    // https://www.freedesktop.org/software/systemd/man/systemd.resource-control.html#Deprecated%20Options
    'CPUShares',
    'StartupCPUShares',
    'MemoryLimit',
    'BlockIOAccounting',
    'BlockIOWeight',
    'StartupBlockIOWeight',
    'BlockIODeviceWeight',
    'BlockIOReadBandwidth',
    'BlockIOWriteBandwidth',
]
export const deprecatedDirectivesSet = new Set(deprecatedDirectives);
