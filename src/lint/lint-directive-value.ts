import { SystemdDirectiveWithLocation } from "../parser/get-directive-keys";
import { MapList } from "../utils/data-types";
import { LintDirectiveValueRule, lintDirectiveValueRules } from "./lint-directive-value-rules";

let nametoRule: MapList<LintDirectiveValueRule> | undefined;

export function lintDirectiveValue(directive: SystemdDirectiveWithLocation) {
    if (!nametoRule) {
        nametoRule = new MapList();
        for (const rule of lintDirectiveValueRules) nametoRule.push(rule.name, rule);
    }

    const rules = nametoRule.get(directive.directiveKey);
    if (!rules) return;

    for (const rule of rules) {
        if (rule.section && rule.section !== directive.section) continue;

        let ok = true;
        const input = directive.value;
        if (typeof rule.value === 'string') ok = input !== rule.value;
        else if (input.match(rule.value)) ok = false;

        if (ok) continue;
        return rule;
    }
}
