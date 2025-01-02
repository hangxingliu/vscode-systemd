import { deepStrictEqual, ok } from "node:assert";
import { SystemdCursorContext } from "../get-cursor-context.js";
import { nameToTokenType } from "../token-dump.js";
import { LocationTuple, TokenType } from "../types.js";
import { TestFnContext } from "./utils.js";

export function initAssertCursorContext(ctx: TestFnContext, cursorGetter: SystemdCursorContext) {
    Object.assign(ctx, { cursorGetter });
}

export function assertCursorValue(ctx: TestFnContext, location: LocationTuple, expectedValue: string) {
    ctx.diagnosis(location, true);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const cursorGetter = (ctx as any).cursorGetter as SystemdCursorContext;
    const result = ctx.diagnosis(cursorGetter.getContext(location[0]));

    deepStrictEqual(result.complete, TokenType.directiveValue);

    ok(result.value);
    deepStrictEqual(result.value.value, expectedValue);
}

export function assertCursorContext(
    ctx: TestFnContext,
    //
    location: LocationTuple,
    //
    expectedType: keyof typeof nameToTokenType,
    expectedFrom?: LocationTuple,
    expectedSection?: string,
    expectedKey?: string
) {
    ctx.diagnosis(location, true);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const cursorGetter = (ctx as any).cursorGetter as SystemdCursorContext;
    const result = ctx.diagnosis(cursorGetter.getContext(location[0]));

    deepStrictEqual(result.complete, nameToTokenType[expectedType]);
    deepStrictEqual(result.from, expectedFrom || undefined);
    if (typeof expectedSection === "string") deepStrictEqual(result.section?.name, expectedSection);
    else deepStrictEqual(result.section, undefined);

    if (typeof expectedKey === "string") deepStrictEqual(result.key?.name, expectedKey);
    else deepStrictEqual(result.key, undefined);
}
