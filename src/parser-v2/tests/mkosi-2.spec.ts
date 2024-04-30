import { tokenizer } from "../tokenizer.js";
import { AssertTokens, test } from "./utils.js";

let exampleConf = [
    //
    //23456
    "[Host]", //                                         L1
    "@Incremental=yes", //                               L2
    "KernelCommandLineExtra=systemd.crash_shell=yes", // L3
    "                      systemd.log_level=debug", //  L4
].join("\n");

test(exampleConf, ({ diagnosis }) => {
    const { tokens } = tokenizer(exampleConf, { mkosi: true });
    diagnosis(tokens);

    const assert = new AssertTokens(tokens);
    assert
        .section("[Host]")
        .key("@Incremental")
        .assignment()
        .value("yes")
        .key("KernelCommandLineExtra")
        .assignment()
        .value("systemd.crash_shell=yes")
        .value("systemd.log_level=debug");
});

test(exampleConf, ({ diagnosis }) => {
    const { tokens } = tokenizer(exampleConf, {});
    diagnosis(tokens);

    const assert = new AssertTokens(tokens);
    assert
        .section("[Host]")
        .key("@Incremental")
        .assignment()
        .value("yes")
        .key("KernelCommandLineExtra")
        .assignment()
        .value("systemd.crash_shell=yes")
        .key("systemd.log_level")
        .assignment()
        .value('debug');
});
