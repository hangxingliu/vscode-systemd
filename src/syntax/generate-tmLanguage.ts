import { createWriteStream } from "fs";
import { tmLanguageFiles } from "../config/fs";
import { generateTmLanguage } from "./base/generate-tmLanguage";
import { getSystemdSyntax } from "./systemd/tmLanguage-syntax";
import { getMkosiSyntax } from "./mkosi/tmLanguage-syntax";

main();
export function main() {
    {
        const stream = createWriteStream(tmLanguageFiles.systemd);
        generateTmLanguage(getSystemdSyntax(), stream);
        stream.close();
        console.log(`created '${tmLanguageFiles.systemd}'`);
    }
    {
        const stream = createWriteStream(tmLanguageFiles.mkosi);
        generateTmLanguage(getMkosiSyntax(), stream);
        stream.close();
        console.log(`created '${tmLanguageFiles.systemd}'`);
    }
}
