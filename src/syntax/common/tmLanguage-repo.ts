import { TextMateGrammarPattern } from "../base/tmLanguage-types";
import { allRepositories } from "./tmLanguage-repo-patterns";

export type RepositoryNames = keyof typeof allRepositories;

export class RepositoryManager {
    readonly repo = allRepositories;
    readonly entries = Array.from(Object.entries(allRepositories));
    readonly usage: { [name in RepositoryNames]: number };

    constructor() {
        const usage: { [name in RepositoryNames]?: number } = {};
        for (const name of Object.keys(this.repo)) usage[name] = 0;
        this.usage = usage as typeof this.usage;
    }

    /**
     * ``` javascript
     * // A sample usage:
     * const { nameOf, repo } = repoManager;
     * nameOf(repo.variables)
     * ```
     */
    readonly nameOf = (repo: unknown): `#${RepositoryNames}` => {
        const entry = this.entries.find((it) => it[1] === repo);
        if (!entry) throw new Error(`Failed to resolve the name of the repo`);
        const name = entry[0] as RepositoryNames;
        this.usage[name]++;
        return `#${name}`;
    };

    /**
     * ``` javascript
     * // A sample usage:
     * const { include, repo } = repoManager;
     * include(repo.variables)
     * ```
     */
    readonly include = (repo: unknown): { include: `#${RepositoryNames}` } => {
        return { include: this.nameOf(repo) };
    };

    readonly getUsedRepo = () => {
        const used: { [x: string]: TextMateGrammarPattern } = {};
        for (const [name, count] of Object.entries(this.usage)) {
            if (count === 0) continue;
            used[name] = this.repo[name];
        }
        return used;
    };
}
