---
date: 2025-01-06
---
# Contributing

[Pull Request][pr] & [Issues][issues]

## Project Structure

```
<project-root>
  + artifacts/vscode        contains built *.vsix extension file and list file
  + cache                   a generated directory for cached http response
  + docs                    documents for development
  + out                     a directory for built source code
  + scripts                 contains some miscellaneous scripts for this project
  + src
    + analyzer              contains some cli tools for analyzing the hint data and documents
    + assets                contains the icon of this extension
    + commands              source code related to Visual Studio Code commands
    + config                source code related to Visual Studio Code configurations
    + docs                  source code for transforming and generating documents for displaying
    + hint-data
      + custom-directives       contains manually maintained systemd directive data,
                                  for those deprecated, removed, custom directives
      + custom-value-enum       contains manually maintained systemd enumeration value data,
                                  for value auto-completion 
      + fetch                   scripts for fetching hint-data/enumeration/docs
        - systemd-all.ts
      + manager                 managers for loading and searching hint-data
      + manifest                contains generated hint-data manifest json files
    + lint                  contains some linting rules and source code of linting process 
    + parser-v2             a parser for systemd unit file, mkosi file and podman quadlet unit files
    + parser                old parser source code
    + syntax                systemd configuration grammar files (tmLanguage) and its generator
      - systemd.tmLanguage
      - generate-tmLanguage.ts
    + utils                 utilities
    - build-contributes.ts  a generator for VSCode-related fields in package.json
    - index.ts              the entry point of this extension
  + test
  - ts                      a script for executing any Typescript file in this project 
```

<!-- #region vscode-extension-dev -->
<!-- version: 2023-11-20 -->
## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/getting-started/install) 
- [Visual Studio Code](https://code.visualstudio.com/)

> [!NOTE]
> 1. Only Node.js [LTS versions](https://nodejs.org/en/about/previous-releases) are supported
> 2. The classic yarn cannot be used in this project.

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

### Prerequisite knowledge for building

After executing commands such as `yarn build:ts` or `webpack`, 
the built/bundled source code will be generated into the `out` directory.

Up to now, the `out` directory contains two distinct types of file structures:

1. Bundled by the command `webpack` (or package scripts `build`, `build:webpack`). 
In this scenario, the directory contains only a few files, including a bundled script file named `index.js`, 
asset files,  and language grammar files.
  - This structure is intended for the bundled extension, ensuring that no unnecessary files 
  are included in the final extension file. 
2. Built using the command `swc` (or package script `build:ts`). Here, the directory holds many
built JavaScript files alongside other files.
  - This structure is advantageous for development and debugging purposes.

To clean the `out` directory, you can execute the package script `clean` (`yarn run clean`)

### Build extension file

``` bash
# This package script `build` does the following tasks:
# 1. clean up the `out` directory for previously generated files.
# 2. bundle the script by the `webpack` command.
# 3. copy asset files into the `out` directory
yarn run build
```

### Run TypeScript file

``` bash
./ts src/path/to/typescript-file.ts

# debug mode:
./ts inspect src/path/to/typescript-file.ts
./ts --inspect-brk src/path/to/typescript-file.ts
```

### Make changes to the grammar/syntax

The entrypoint of the grammar syntax rules: [src/syntax/syntax.ts](../src/syntax/syntax.ts)

Executing the generator [src/syntax/generate-tmLanguage.ts](../src/syntax/generate-tmLanguage.ts) 
to generate `systemd.tmLanguage` xml file from the grammar syntax rules.

``` bash
yarn build:ts && yarn build build:syntax
```

### Update hint data to the latest version

Please check out the document [UPDATE-HINT-DATA.md](UPDATE-HINT-DATA.md) for more information about
how to update all hint data (systemd documents, directives, ...) to the latest and the relevant SOP.

### Add new section names

Please take a look at the file [src/syntax/const-sections.ts](../src/syntax/const-sections.ts)

### Add custom directives

Please add/modify them in the directory [src/hint-data/custom-directives](../src/hint-data/custom-directives)

### Add enumeration completion for value

Please add/modify them in the directory [src/hint-data/custom-value-enum](../src/hint-data/custom-value-enum)
