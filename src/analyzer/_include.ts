import { glob } from "glob";
import { manifestDir } from "../config/fs";
import { readFileSync } from "fs";
import { resolve } from "path";

export function listManifestFiles() {
    const manifestFiles: string[] = glob.sync("*.json", { cwd: manifestDir });
    return manifestFiles.map((file) => {
        const path = resolve(manifestDir, file);
        return {
            file,
            path,
            get items(): unknown[][] {
                return JSON.parse(readFileSync(path, "utf-8"));
            },
        };
    });
}
