import { PredefinedSignature } from "../types-manifest";
import { SystemdValueEnum } from "./types";
import * as common from "./common-unit-condition";

const section = "Unit";
const manPage = "systemd.unit(5)";

/**
 * If multiple conditions are specified,
 * the unit will be executed if all of them apply (i.e. a logical AND is applied).
 * Condition checks can use a pipe symbol ("`|`") after the equals sign ("`Condition…=|…`"),
 * which causes the condition to become a *triggering* condition.
 *
 * The test may be negated by prepending an exclamation mark.
 *
 * If you prefix an argument with the pipe symbol and an exclamation mark,
 * the pipe symbol must be passed first, the exclamation second.
 */
const prefixChars = "|!";

export const valueEnum: SystemdValueEnum[] = [
    {
        directive: "CollectMode",
        section,
        manPage,
        values: ["inactive", "inactive-or-failed"],
        tips: { inactive: "default" },
    },
    //
    {
        directive: "ConditionFirmware",
        section,
        manPage,
        docs: common.knownFirmwareConds,
        prefixChars,
    },
    {
        directive: ["ConditionArchitecture", "AssertArchitecture"],
        section,
        manPage,
        /** uname */
        values: common.knownArches,
        prefixChars,
    },
    {
        directive: ["ConditionVirtualization", "AssertVirtualization"],
        manPage,
        section,
        docs: common.knownVirtualizationTechs,
        extends: PredefinedSignature.Boolean,
        prefixChars,
    },
    {
        directive: ["ConditionSecurity", "AssertSecurity"],
        manPage,
        section,
        docs: common.knownSecurityTechs,
        prefixChars,
    },
    {
        directive: ["ConditionCPUFeature", "AssertCPUFeature"],
        manPage,
        section,
        values: common.knownCPUFeatures,
        prefixChars,
    },
    //
    {
        directive: ["OnSuccessJobMode", "OnFailureJobMode"],
        section,
        manPage,
        docs: {
            fail: '"`fail`" is specified and a requested operation conflicts with a pending job (more specifically: causes an already pending start job to be reversed into a stop job or vice versa), cause the operation to fail.',
            replace: "(the default) any conflicting pending job will be replaced, as necessary.",
            "replace-irreversibly":
                'operate like "`replace`", but also mark the new jobs as irreversible. This prevents future conflicting transactions from replacing these jobs (or even being enqueued while the irreversible jobs are still pending). Irreversible jobs can still be cancelled using the **cancel** command. This job mode should be used on any transaction which pulls in `shutdown.target`.',
            isolate:
                '"`isolate`" is only valid for start operations and causes all other units to be stopped when the specified unit is started. This mode is always used when the **isolate** command is used.',
            flush: '"`flush`" will cause all queued jobs to be canceled when the new job is enqueued.',
            "ignore-dependencies":
                "all unit dependencies are ignored for this new job and the operation is executed immediately. If passed, no required units of the unit passed will be pulled in, and no ordering dependencies will be honored. This is mostly a debugging and rescue tool for the administrator and should not be used by applications.",
            "ignore-requirements":
                'it is similar to "`ignore-dependencies`", but only causes the requirement dependencies to be ignored, the ordering dependencies will still be honored.',
        },
    },
    {
        directive: ["FailureAction", "SuccessAction", "StartLimitAction", "JobTimeoutAction"],
        manPage,
        section,
        values: [
            "poweroff",
            "poweroff-force",
            "poweroff-immediate",
            "exit",
            "exit-force",
            "soft-reboot",
            "soft-reboot-force",
            "kexec",
            "kexec-force",
            "halt",
            "halt-force",
            "halt-immediate",
        ],
        docs: {
            none: "no action will be triggered",
            reboot: "it causes a reboot following the normal shutdown procedure (i.e. equivalent to **systemctl reboot**).",
            "reboot-force":
                "it causes a forced reboot which will terminate all processes forcibly but should cause no dirty file systems on reboot (i.e. equivalent to **systemctl reboot -f**)",
            "reboot-immediate":
                "it causes immediate execution of the [reboot(2)](https://man7.org/linux/man-pages/man2/reboot.2.html) system call, which might result in data loss (i.e. equivalent to **systemctl reboot -ff**).",
        },
    },
];
