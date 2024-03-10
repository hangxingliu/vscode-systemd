import { systemdValueEnum } from "../hint-data/custom-value-enum";
import { SystemdValueEnum } from "../hint-data/custom-value-enum/types";
import { MapList } from "../utils/data-types";

const duplicate = new MapList<SystemdValueEnum>();
systemdValueEnum.forEach((it) => {
    if (!it.values) return;
    const encoded = JSON.stringify(Array.from(it.values).sort());
    duplicate.push(encoded, it);
});

for (const [key, list] of duplicate.entries()) {
    if (list.length <= 1) continue;
    console.log(key);
    for (const item of list) {
        let log = `  ${item.directive}`
        if(item.section) log += ` [${item.section}]`
        console.log(log);
    }
    console.log();
}
