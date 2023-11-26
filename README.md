# Systemd Configurations Helper for Visual Studio Code

[![.github/workflows/ci.yaml](https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml/badge.svg)](https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml)

Help you write systemd configurations in Visual Studio Code

![The screenshot of this extension](https://raw.githubusercontent.com/hangxingliu/vscode-systemd/7927822df923d9293402eedcbf92b32928e12306/docs/images/screenshot.png)

## Features

- Syntax highlights
- Autocomplete directive and specifiers
- Lint directive names
- Provide document for directives and specifiers

## Installation

1. Click `Extension` button in left side of VSCode. (Shortcut: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> or <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>)
2. Search for `hangxingliu.vscode-systemd-support` and click the `Install` button.


## Changelog

### 2.0.0-preview (2023-11-26)

- Add [Podman](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) into the support
    - Related issue: <https://github.com/hangxingliu/vscode-systemd/issues/7>
- Add more completion and docs for directive value 
    - Related issue: <https://github.com/hangxingliu/vscode-systemd/issues/8>
- Add completion for well-known unit names (`network-online.target`, ...)
- Improve the accuracy of variant completion based on file path and section name
- Fix links in completion/help documents
- Add `.dnssd` as an extension
- Add more systemd sections into the support
- Update directives to version 255 and remove incorrect directives
- Refactor the related code to hint data manager

See [CHANGELOG.md](docs/CHANGELOG.md)

## Build & Contributing

Please check out the document [CONTRIBUTING.md](docs/CONTRIBUTING.md) for information 
about building/contributing this project

## License

[MIT](LICENSE)

## References

- [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
- [Systemd Syntax](https://www.freedesktop.org/software/systemd/man/systemd.syntax.html#)
- [Icon resources](https://github.com/edent/SuperTinyIcons)
- [bearmini's systemd extension](https://github.com/bearmini/vscode-systemd-unit-file)
    - I created this extension to improve bearmini's systemd extension. It only provided syntax highlights.

