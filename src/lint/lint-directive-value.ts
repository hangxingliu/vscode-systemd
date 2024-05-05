import { MapList } from "../utils/data-types";
import { SystemdDirective } from "../parser-v2/types.js";
import { LintDirectiveValueRule, lintDirectiveValueRules } from "./lint-directive-value-rules";

let nameToRule: MapList<LintDirectiveValueRule> | undefined;

export function lintDirectiveValue(directive: SystemdDirective) {
    if (!nameToRule) {
        nameToRule = new MapList();
        for (const rule of lintDirectiveValueRules) nameToRule.push(rule.name, rule);
    }

    const rules = nameToRule.get(directive.key);
    if (!rules) return;

    for (const rule of rules) {
        if (rule.section && rule.section !== directive.section) continue;

        let ok = true;
        const input = directive.value || '';
        if (typeof rule.value === 'string') ok = input !== rule.value;
        else if (input.match(rule.value)) ok = false;

        if (ok) continue;
        return rule;
    }
}
