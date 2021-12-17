# How to Contribute

There are many ways to contribute to this project project: logging bugs, submitting pull requests, reporting issues, and creating suggestions.

``` bash
yarn install
yarn run build:webpack
yarn clean
```

## Syntax

Sources:

- `src/syntax/syntax.ts`
- `src/syntax/patterns.ts`
- `src/syntax/repository.ts`
- `src/syntax/match-names.ts`

Target file:

- `src/syntax/systemd.tmLanguage` (And The building script will copy it into the `out` directory for packing to the extension)

