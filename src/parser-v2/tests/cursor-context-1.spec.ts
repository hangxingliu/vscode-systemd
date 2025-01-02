import { test } from "./utils.js";
import { SystemdCursorContext } from "../get-cursor-context.js";
import { initAssertCursorContext, assertCursorContext as assert, assertCursorValue } from "./cursor-context-assert.js";

test(
    [
        "#", //               0
        "; c2", //            1
        "[S1]", //            2
        "K = ㄅㄆ # メモ", //   3
        "K2=", //             4
        "K3=a quick\\", //    5
        "   fox\\", //        6
        "   # jumps over", // 7
        "   懒狗", //          8
        "[]", //              9
        "[S2]", //            10
        "Description=", //    11
    ].join("\n"),
    (ctx) => {
        const { conf, at, diagnosis } = ctx;

        let cursor = new SystemdCursorContext(conf, {});
        initAssertCursorContext(ctx, cursor);
        //
        assert(ctx, at(0, 0), 'key');
        assert(ctx, at(0, 1), 'comment');
        //
        assert(ctx, at(1, 0), 'key');
        assert(ctx, at(1, 1), 'comment');
        assert(ctx, at(1, 4), 'comment');
        //
        assert(ctx, at(2, 0), 'unknown');
        assert(ctx, at(2, 1), 'section', at(2, 0));
        assert(ctx, at(2, 3), 'section', at(2, 0));
        assert(ctx, at(2, 4), 'unknown');
        //
        assert(ctx, at(3, 0), 'key', undefined, '[S1]');
        assert(ctx, at(3, 1), 'key', at(3, 0), '[S1]');
        assert(ctx, at(3, 2), 'assignment', undefined, '[S1]', 'K ');
        assert(ctx, at(3, 4), 'value', undefined, '[S1]', 'K ');
        assert(ctx, at(3, 5), 'value', at(3, 4), '[S1]', 'K ');
        assert(ctx, at(3, 7), 'value', at(3, 4), '[S1]', 'K ');
        assert(ctx, at(3, 8), 'value', at(3, 4), '[S1]', 'K ');
        assert(ctx, at(3, 11), 'value', at(3, 4), '[S1]', 'K ');
        assertCursorValue(ctx, at(3, 11), 'ㄅㄆ # メモ');
        //
        assert(ctx, at(5, 0), 'key', undefined, '[S1]');
        assert(ctx, at(5, 11), 'value', at(5, 3), '[S1]', 'K3');
        assert(ctx, at(6, 0), 'value', at(5, 3), '[S1]', 'K3');
        assert(ctx, at(7, 0), 'value', at(6, 0), '[S1]', 'K3');
        assert(ctx, at(8, 0), 'value', undefined, '[S1]', 'K3');
        assert(ctx, at(8, 1), 'value', at(8, 0), '[S1]', 'K3');
        assertCursorValue(ctx, at(8, 1), 'a quick   fox\\');
        assertCursorValue(ctx, at(8, 5), 'a quick   fox   懒狗');
        //
        assert(ctx, at(9, 0), 'unknown', undefined);
        assert(ctx, at(9, 1), 'section', at(9, 0));
        //
        assert(ctx, at(11, 0), 'key', undefined, '[S2]');

        //
        //
        // mkosi mode:
        //
        //
        cursor = new SystemdCursorContext(conf, { mkosi: true });
        initAssertCursorContext(ctx, cursor);
        //
        assert(ctx, at(0, 0), 'key');
        assert(ctx, at(0, 1), 'comment');
        //
        assert(ctx, at(1, 0), 'key');
        assert(ctx, at(1, 1), 'key', at(1, 0));
        assert(ctx, at(1, 2), 'assignment', undefined, undefined, '; ');
        // assert(ctx, at(1, 3), 'unknown'); // <-- The behaviour at here is undefined
        //
        assert(ctx, at(3, 8), 'comment');
        assert(ctx, at(3, 11), 'comment');
        //
        assert(ctx, at(8, 1), 'value', undefined, '[S1]', 'K3');
        assert(ctx, at(8, 5), 'value', at(8, 3), '[S1]', 'K3');
        assertCursorValue(ctx, at(8, 1), 'a quick\\\nfox\\');
        assertCursorValue(ctx, at(8, 5), 'a quick\\\nfox\\\n懒狗');
        //
        assert(ctx, at(11, 0), 'key', undefined, '[S2]');
    }
);
