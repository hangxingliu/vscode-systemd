# CHANGELOG

### 2.2.0 (2024-03-xx)

- Add auto-completion and signature hint support for boolean values for directives
- Add support for a new unit file `iocost.conf`
- Add more completion/documentation for directive value
- Add more documentation for deprecated/renamed/removed directives
- Add version information into the documentation to indicate the first supported version and the version at which the directive became deprecated/removed
- Add a new configuration named `systemd.podman.completion` to enable/disable providing completion items related to Podman Quadlet by default
- Add a new configuration named `systemd.version` to ensure the extension only offers compatible auto-completion and provides more precise linting feature
- Add a new configuration named `systemd.style.boolean` to specify the preferred boolean value format for auto-completion
- Fixed a bug where the documentation for some directives was not displayed
- Fixed some errors in the documentation, including incorrect markup tags, tables that are not 
displaying properly and unexpected email addresses
- Fixed auto-completion feature for directives in the following sections: `MACVTAP`/`IPVTAP`/`Tap`
- Renamed the following configurations: (The old names will still be supported in 2024)
    - `systemd.lintDirectiveKeys` => `systemd.directive-keys.lint`
    - `systemd.customDirectiveKeys` => `systemd.directive-keys.custom`
- Fixed the parser to correctly detect unit types `sysupdated` and `repartd`
- Updated unit name completion for full special system units 
- Updated diagnostics to display detailed deprecation information and providing quick fixes for automatically renaming deprecated directives.
- Updated documentation to the latest
- Improved the process of changing unit file types
    - Highlighting recommended types in the type picker for easier selection
    - Retaining manually changed types in the workspace state to ensure they are remembered upon reopening the editor
- The unit file type of Podman Quadlet has been divided into several more specific types, such as `container`, `image`, ...


### 2.1.0 (2024-02-28)

- Add CodeLens for files to show the type of the unit file and allow user to change the type
- Add a new lint rule for the directive `KillMode`
    - <https://github.com/systemd/systemd/blob/effefa30de46f25d0f50a36210a9835097381c2b/src/core/load-fragment.c#L665>
- Improved the accuracy of the following completion:
    - systemd.resource-control
    - systemd.kill
    - systemd.exec
- Add more unit types: `*.path`, `*.mount`, `journald.conf`, ...
- Fixed the links to directives in the systemd help documents
- Add completion for `OnCalendar`
- Add more value completions
- Updated the data of `podman-systemd.unit` to the latest (new section `[Pod]`)
- Updated syntax for size/calendar/restart options/section names/prefixes
- Fixed syntax for escaped characters

### 2.0.0-preview (2023-11-26)

- Add [Podman](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) into the support
    - Related issue: <https://github.com/hangxingliu/vscode-systemd/issues/7>
- Add more completion and docs for directive value 
    - Related issue: <https://github.com/hangxingliu/vscode-systemd/issues/8>
- Add completion for well-known unit names (`network-online.target`, ...)
- Improved the accuracy of variant completion based on file path and section name
- Fixed links in completion/help documents
- Add `.dnssd` as an extension
- Add more systemd sections into the support
- Updated directives to version 255 and remove incorrect directives
- Refactor the related code to hint data manager

### 1.0.0 (2021-12-18)

- Refactor the extension
- Rewrite the syntax config to fix incorrect highlight
- Updated directives and their documents to the latest
- Add the configuration parser for more accurate language features
- Add more autocompletion
- Add liner for directive names
- Add document for directives and specifiers
- Add support for using this extension in the browser <https://vscode.dev>

### 0.1.1 (2018-10-08)

- Fixed syntax highlights

### 0.1.0 (2018-08-25)

- Improved syntaxes
- Add auto-completion support

### 0.0.1 (2018-02-23)

- Initial release by [@bearmini (Takashi Oguma)](https://github.com/bearmini)
