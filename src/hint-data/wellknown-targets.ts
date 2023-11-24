/**
 * systemctl list-units | awk '$1~/.target$/ {$2="";$3="";$4="";print $0}'
 */
export const wellknownSystemdTargets: Array<[unit: string, description?: string]> = [
    //#region target
    ["basic.target", "Basic System"],
    ["bluetooth.target", "Bluetooth Support"],
    ["cryptsetup.target", "Local Encrypted Volumes"],
    ["getty-pre.target", "Preparation for Logins"],
    ["getty.target", "Login Prompts"],
    ["graphical.target", "Graphical Interface"],
    ["local-fs-pre.target", "Preparation for Local File Systems"],
    ["local-fs.target", "Local File Systems"],
    ["multi-user.target", "Multi-User System"],
    ["network-online.target", "Network is Online"],
    ["network-pre.target", "Preparation for Network"],
    ["network.target", "Network"],
    ["nss-lookup.target", "Host and Network Name Lookups"],
    ["nss-user-lookup.target", "User and Group Name Lookups"],
    ["paths.target", "Path Units"],
    ["remote-fs.target", "Remote File Systems"],
    ["slices.target", "Slice Units"],
    ["snapd.mounts-pre.target", "Mounting snaps"],
    ["snapd.mounts.target", "Mounted snaps"],
    ["sockets.target", "Socket Units"],
    ["sound.target", "Sound Card"],
    ["swap.target", "Swaps"],
    ["sysinit.target", "System Initialization"],
    ["time-set.target", "System Time Set"],
    ["timers.target", "Timer Units"],
    ["veritysetup.target", "Local Verity Protected Volumes"],
    //#endregion target
];
