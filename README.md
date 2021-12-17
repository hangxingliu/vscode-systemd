# Systemd Configurations Helper for Visual Studio Code

[![.github/workflows/ci.yaml](https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml/badge.svg)](https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml)

Help you write systemd configurations in Visual Studio Code

![The screenshot of this extension](https://raw.githubusercontent.com/hangxingliu/vscode-systemd/7927822df923d9293402eedcbf92b32928e12306/docs/images/screenshot.png)

## Features

- Syntax highlights
- Autocomplete directive and specifiers
- Lint directive names
- Provide document for directives and specifiers

## Changelog

### 1.0.0 (2021-12-18)

- Refactor the extension
- Rewrite the syntax config to fix incorrect highlight
- Update directives and their documents to the latest
- Add the configuration parser for more accurate language features
- Add more autocompletion
- Add liner for directive names
- Add document for directives and specifiers
- Support running on the browser <https://vscode.dev>

See [CHANGELOG.md](docs/CHANGELOG.md)

## Build by Yourself & Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## License

[MIT](LICENSE)

## References

- [TextMate Language Grammars](https://macromates.com/manual/en/language_grammars)
- [Systemd Syntax](https://www.freedesktop.org/software/systemd/man/systemd.syntax.html#)
- [Icon resources](https://github.com/edent/SuperTinyIcons)
- [bearmini's systemd extension](https://github.com/bearmini/vscode-systemd-unit-file)
    - I created this extension to improve bearmini's systemd extension. It only provided syntax highlights.

