export const similarSections = new Map<string, string>([
    //
    //#region systemd.netdev
    //
    // The [MACVTAP] section applies for netdevs of kind "macvtap" and accepts the same keys as [MACVLAN].
    ["MACVTAP", "MACVLAN"],
    // The [IPVTAP] section only applies for netdevs of kind "ipvtap" and accepts the same keys as [IPVLAN].
    ["IPVTAP", "IPVLAN"],
    // The [Tap] section only applies for netdevs of kind "tap", and accepts the same keys as the [Tun] section.
    ["Tap", "Tun"],
    //#endregion
]);
