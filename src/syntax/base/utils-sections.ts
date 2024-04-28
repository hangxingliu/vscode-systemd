import { MapList } from "../../utils/data-types";
import type { SectionGroup, SectionsDefinition } from "../common/section-names";

/**
 * Return all section names in lower case
 */
export function getLCSectionNames(...args: SectionsDefinition[]) {
    const result = new Set<string>();
    for (const sections of args) {
        for (const section of sections) {
            const name = typeof section === "string" ? section : section[0];
            result.add(name.toLowerCase());
        }
    }
    return result;
}
export function getOrderedSectionNames(...args: SectionsDefinition[]) {
    const result = new Set<string>();
    for (const sections of args) {
        for (const section of sections) {
            const name = typeof section === "string" ? section : section[0];
            result.add(name);
        }
    }
    return Array.from(result).sort();
}

export class SectionGroupMatcher {
    nameToGroup: MapList<string>;
    groupNames: Set<string>;
    constructor(groups: SectionGroup[]) {
        this.nameToGroup = new MapList();
        this.groupNames = new Set();
        for (const group of groups) {
            this.groupNames.add(group.name);
            const names = getLCSectionNames(group.sections);
            for (const name of names) this.nameToGroup.push(name, group.name);
        }
    }
    hasGroup(groupName: string) {
        return this.groupNames.has(groupName);
    }
    /**
     * @returns group names
     */
    match(sectionName: string): string[] {
        return this.nameToGroup.getList(sectionName.toLowerCase());
    }
}
