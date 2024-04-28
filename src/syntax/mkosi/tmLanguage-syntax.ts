import { getMkosiPatterns } from "./tmLanguage-patterns";
import { TextMateGrammarConfig } from "../base/tmLanguage-types";
import { RepositoryManager } from "../common/tmLanguage-repo";

/**
 * @see https://macromates.com/manual/en/language_grammars
 */
export function getMkosiSyntax(): TextMateGrammarConfig {
    const repo = new RepositoryManager();
    return {
        name: "mkosi configuration file",
        scopeName: "source.mkosi",
        uuid: "def576f2-a56e-400c-9a22-f014ceef415f",
        patterns: getMkosiPatterns(repo),
        repository: repo.getUsedRepo(),
    };
}
