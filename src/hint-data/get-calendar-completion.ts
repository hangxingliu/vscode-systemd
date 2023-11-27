import { CompletionItem, CompletionItemKind } from "vscode";

const calendarShorthands = [
    ["minutely", "*-*-* *:*:00"],
    ["hourly", "*-*-* *:00:00"],
    ["daily", "*-*-* 00:00:00"],
    ["monthly", "*-*-01 00:00:00"],
    ["weekly", "Mon *-*-* 00:00:00"],
    ["yearly", "*-01-01 00:00:00"],
    ["quarterly", "*-01,04,07,10-01 00:00:00"],
    ["semiannually", "*-01,07-01 00:00:00"],
].map((it) => {
    const ci = new CompletionItem(it[0], CompletionItemKind.Unit);
    ci.detail = it[1];
    return ci;
});

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
    (it) => new CompletionItem(it, CompletionItemKind.Unit)
);

export function getCalendarCompletion(directiveKey: string, prefix: string) {
    if (directiveKey !== "OnCalendar") return;
    if (prefix.indexOf(" ") >= 0) return;
    if (!prefix || !prefix.match(/\W/)) return calendarShorthands.concat(weekdayNames);
    if (prefix.endsWith(',') || prefix.endsWith('..')) return weekdayNames;
}
