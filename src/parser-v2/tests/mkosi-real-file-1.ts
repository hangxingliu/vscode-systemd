import { readFileSync } from "fs";
import { resolve } from "path";
import { tokenizer } from "../tokenizer";
import { AssertTokens } from "./utils";

const filePath = resolve(__dirname, "../../../test/samples/mkosi/mkosi/mkosi.conf");
const fileContent = readFileSync(filePath, "utf-8");
const result = tokenizer(fileContent, { mkosi: true });
console.log(`tokens.length = ${result.tokens.length}`);

new AssertTokens(result.tokens)
    .comment()
    .section("[Output]")
    .comment()
    .comment()
    .key("@Format")
    .assignment()
    .value("directory")
    .key("@CacheDirectory")
    .assignment()
    .value("mkosi.cache")
    .key("@OutputDirectory")
    .assignment()
    .value("mkosi.output")
    //
    .section("[Content]")
    .key("Autologin")
    .assignment()
    .value("yes")
    .key("@SELinuxRelabel")
    .assignment()
    .value("no")
    .key("@ShimBootloader")
    .assignment()
    .value("unsigned")
    .key("BuildSources")
    .assignment()
    .value(".")
    .key("BuildSourcesEphemeral")
    .assignment()
    .value("yes")
    //
    .key("Packages")
    .assignment()
    .value("attr")
    .value("ca-certificates")
    .value("gdb")
    .value("jq")
    .value("less")
    .value("nano")
    .value("strace")
    .value("tmux")
    //
    .key("InitrdPackages")
    .assignment()
    .value("less")
    //
    .key("RemoveFiles")
    .assignment()
    .comment()
    .value("/usr/lib/kernel/install.d/20-grub.install")
    .comment()
    .value("/usr/lib/kernel/install.d/50-dracut.install")
    .comment()
    //
    .key("KernelCommandLine")
    .assignment()
    .value("console=ttyS0 enforcing=0")
    //
    .section("[Host]")
    .key("@QemuMem")
    .assignment()
    .value("4G");
