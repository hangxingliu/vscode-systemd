# Systemd Configurations Helper for Visual Studio Code

[![.github/workflows/ci.yaml](https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml/badge.svg)](https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml)

A Visual Studio Code extension that helps you read and write Systemd unit files

![The screenshot of this extension](https://raw.githubusercontent.com/hangxingliu/vscode-systemd/7927822df923d9293402eedcbf92b32928e12306/docs/images/screenshot.png)

## Features

- Syntax highlighting and completion for variant systemd unit(configuration) files
- Support for Podman systemd unit
- Lint for systemd directive names
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

## Changelog

### 2.1.0 (2024-02-28)

- Add CodeLens for files to show the type of the unit file and allow user to change the type
- Add a new lint rule for the directive `KillMode`
    - <https://github.com/systemd/systemd/blob/effefa30de46f25d0f50a36210a9835097381c2b/src/core/load-fragment.c#L665>
- Improve the accuracy of the following completion:
    - systemd.resource-control
    - systemd.kill
    - systemd.exec
- Add more unit types: `*.path`, `*.mount`, `journald.conf`, ...
- Fix the links to directives in the systemd help documents
- Add completion for `OnCalendar`
- Add more value completions
- Update the data of `podman-systemd.unit` to the latest (new section `[Pod]`)
- Update syntax for size/calendar/restart options/section names/prefixes
- Fix syntax for escaped characters

See [CHANGELOG.md](docs/CHANGELOG.md)

## Build & Contributing

Please check out the document [CONTRIBUTING.md](docs/CONTRIBUTING.md) for information 
about building/contributing this project

## License

[MIT](LICENSE)

## References

- [Systemd](https://github.com/systemd/systemd)
- [Podman](https://github.com/containers/podman)
- [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
- [Systemd Syntax](https://www.freedesktop.org/software/systemd/man/systemd.syntax.html#)
- [Icon resources](https://github.com/edent/SuperTinyIcons)
- [bearmini's systemd extension](https://github.com/bearmini/vscode-systemd-unit-file)
    - I created this extension to improve bearmini's systemd extension. It only provided syntax highlights.

