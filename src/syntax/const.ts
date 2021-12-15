export const languageId = 'systemd-conf';

export const knownSections = [
    'Unit',
    'Install',
    'Service',
    'Socket',
    'Mount',
    'Automount',
    'Swap',
    'Path',
    'Timer'
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
