# Systemd Configurations Helper for Visual Studio Code

[![.github/workflows/ci.yaml](https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml/badge.svg)](https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml)

A Visual Studio Code extension to help you read and write *Systemd unit config*, *mkosi config* and *Podman Quadlet unit files*.

![The screenshot of this extension](https://raw.githubusercontent.com/hangxingliu/vscode-systemd/HEAD/docs/images/screenshot-2.2.0.png)

## Features

- Syntax highlighting, auto-completion, folding range and linter for the following files
  - Various systemd unit files (configuration files)
  - [mkosi](https://github.com/systemd/mkosi) configuration files
  - [Podman Quadlet](https://github.com/containers/podman) unit files
- Document and help information for directives and specifiers in the editor

## Installation

1. Click `Extension` button in left side of VSCode. (Shortcut: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> or <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>)
2. Search for `hangxingliu.vscode-systemd-support` and click the `Install` button.

### via Command Line

You can replace the `code` command to `codium` in following scripts if you are using [VSCodium](https://vscodium.com/)

``` bash
code --install-extension hangxingliu.vscode-systemd-support
# Or install from a downloaded VSIX file:
code --install-extension vscode-systemd-support-${version}.vsix
```

### Nightly Builds

Nightly builds can be found and downloaded in Github Actions page 
(Click any successful workflow run and the extension file is located in the **Artifacts** pane):
<https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml>

![How to download nightly builds](docs/images/download-nightly-builds.jpg)

## Changelog

### 3.0.0 (2025-01-08)

- Update the support to Systemd v257 and Podman Quadlet v5.3.1
- Add support for mkosi config files
- Add folding range feature
  - sections, multi-line comment, multi-line value and `#region` comments
- Add more auto-completion for directive(setting) value.
  - Add auto-completion support for directives that accept boolean or auto as values
- Update file path detection for Podman `.network` file ([@marshallwp](https://github.com/marshallwp))
- Refactor the parser for fixing issues and more editor features
- Refactor some part of fetch scripts for comparing changes and generating diagnosis log

## Build & Contributing

Please check out the document [CONTRIBUTING.md](docs/CONTRIBUTING.md) for information 
about building/contributing this project

## License

[MIT](LICENSE)

## References

- [Systemd](https://github.com/systemd/systemd)
- [Podman](https://github.com/containers/podman)
- [mkosi](https://github.com/systemd/mkosi)
- [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
- [Systemd Syntax](https://www.freedesktop.org/software/systemd/man/systemd.syntax.html#)
- [Icon resources](https://github.com/edent/SuperTinyIcons)
- [bearmini's systemd extension](https://github.com/bearmini/vscode-systemd-unit-file)
    - I created this extension to improve bearmini's systemd extension. It only provides syntax highlights.

