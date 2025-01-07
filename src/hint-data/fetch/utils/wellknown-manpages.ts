export const wellknownManPages = {
    /** DNS-SD configuration */
    dnssd: "systemd.dnssd(5)",
    /** Virtual Network Device configuration */
    netdev: "systemd.netdev(5)",
    /** Network configuration */
    network: "systemd.network(5)",
    /** Service unit configuration */
    service: "systemd.service(5)",
    /** Socket unit configuration */
    socket: "systemd.socket(5)",
    /** Timer unit configuration */
    timer: "systemd.timer(5)",
    /** Network device configuration */
    link: "systemd.link(5)",
    /** Path unit configuration */
    path: "systemd.path(5)",
    /** Mount unit configuration */
    mount: "systemd.mount(5)",
    /** Container settings */
    nspawn: "systemd.nspawn(5)",
    /** Swap unit configuration */
    swap: "systemd.swap(5)",
    /** Scope unit configuration */
    scope: "systemd.scope(5)",
    /** Automount unit configuration */
    automount: "systemd.automount(5)",
    //
    /** Suspend and hibernation configuration file */
    sleep: "systemd-sleep.conf(5)",
    /** Network Time Synchronization configuration files */
    timesyncd: "timesyncd.conf(5)",
    /** System and session service manager configuration files */
    system: "systemd-system.conf(5)",
    /** Core dump storage configuration files */
    coredump: "coredump.conf(5)",
    /** Global Network configuration files */
    networkd: "networkd.conf(5)",
    /** Login manager configuration files */
    logind: "logind.conf(5)",
    /** Journal service configuration files */
    journald: 'journald.conf(5)',
    /** Configuration files for the service accepting remote journal uploads */
    journal_remote: "journal-remote.conf(5)",
    /** Configuration files for the journal upload service */
    journal_upload: "journal-upload.conf(5)",
    /** Home area/user account manager configuration files */
    homed: 'homed.conf(5)',
    /** Global systemd-oomd configuration files */
    oomd: 'oomd.conf(5)',
    /** PStore configuration file */
    pstore: 'pstore.conf(5)',
    /** Partition Definition Files for Automatic Boot-Time Repartitioning */
    repartd: 'repart.d(5)',
    /** Transfer Definition Files for Automatic Updates */
    sysupdated: 'sysupdate.d(5)',
} as const;
