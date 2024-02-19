---
date: 2023-11-20
---
# Contributing

[Pull Request][pr] & [Issues][issues]

## Project Structure

```
<project-root>
  + cache                 Generated directory for cached http response
  + docs                  Documentations for this project
  + scripts               Some bash scripts for building, publishing, and fixing 
  + src
    + assets              Some asset files, including the icon of this extension
	+ config              Internal configuration of this extension and 
                          Visual Studio Code config loader
    + hint-data           Generated data for auto-completion/help, and the loader for it
    + parser              A simple parser for systemd configuration file
	+ syntax              Systemd configuration syntax files and generator
	+ utils               Utilities for downloading and generating hints/references data,
                          and also some utility functions for extension runtime
  + test
```

<!-- #region vscode-extension-dev -->
<!-- version: 2023-11-20 -->
## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- [Yarn Classic](https://classic.yarnpkg.com/en/)
- [Visual Studio Code](https://code.visualstudio.com/)

## References

- <https://code.visualstudio.com/api>
- The difference between web extension and desktop extension: <https://code.visualstudio.com/api/extension-guides/web-extensions>
<!-- #endregion vscode-extension-dev -->


## Pull and Initialize

``` bash
git clone https://github.com/hangxingliu/vscode-systemd.git
cd vscode-systemd

# Install full dependencies:
yarn install

# OR You can install without optional dependencies:
# These optional dependencies will not break the building of this project, 
# but they are used for linting, testing, and release
yarn install --ignore-optional
```

## Build

``` bash
# Clean built files
yarn clean

# Build this project as desktop extension
yarn run build:webpack
```

## Build Syntax

Sources:

- `src/syntax/syntax.ts`
- `src/syntax/patterns.ts`
- `src/syntax/repository.ts`
- `src/syntax/match-names.ts`

Target file:

- `src/syntax/systemd.tmLanguage` (And The building script will copy it into the `out` directory for packing to the extension)

## Update Hint Data

``` bash
yarn build:dev
yarn fetch:directives
```
