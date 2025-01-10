# TODO

## Long time ago

- [x] capabilities
    - https://man7.org/linux/man-pages/man7/capabilities.7.html
- [x] Completion/Syntax for time spans, e.g., `OnCalendar=`, `weekly`
- [x] Fix docs in completion items for Linux capabilities
- [x] Fix highlights for podman directives: `AddCapability`, `DropCapability`

## 2.2.0

- [x] Update data for custom directives
- [x] boolean value completion
- [x] Settings for enabling/disabling Podman
- [x] Fix incorrect markdown styles in docs (italic with formatted code)
- [x] Fix completion for `MACVTAP`/`IPVTAP`/`Tap`
- [x] Fix linting directives
- [x] Settings for systemd version
- [x] Add more deprecated/removed/renamed directives from `CHANGELOG` in systemd repo
- [x] Update `extensionKind` to `["workspace", "ui"]` to allow user install it from local to remote
- [x] Update target completion: <https://www.freedesktop.org/software/systemd/man/latest/systemd.special.html#default.target>
- [x] Add completion for predefined filters and syscalls in <https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#> and <https://man7.org/linux/man-pages/man2/syscalls.2.html>
- [x] Add support for value prefixes and `sep` field in value enum rules
- [x] Add and check all value completions
- [x] Add docs about new folders (e.g., `custom-directives`)


## 3.0.0

- [x] support for `BooleanOrAuto`
- [x] Remove the old parser
- [x] Update documents about mkosi support
- [x] Update to Systemd v257

## 3.x/4.x

- [x] Fix the incorrect parsing of mkosi files that contains any comment line in the multi-line value
- [ ] Add more comments in the code to ensure this project can be easily maintained without me
- [ ] Add some docs to eliminate user misunderstandings about `Unknown directive`
  - [ ] Add an optional to disable it in quick fix
- [ ] Specifiers in `systemd.link(5)`, `repart.d(5)`, `sysupdate.d(5)`, ...
- [ ] New test files for `/etc/sysupdate.d/*.feature` (`sysupdate.features(5)`)
- [ ] Add versioning support for podman quadlet
- [ ] Add versioning support for mkosi
- [ ] Update documents for `Asset*` directives in systemd.unit(5) for more human-readable
- [ ] Add support for `jinja2`
- [ ] Add features that need to run `systemd` commands (start, stop, ...)
- [ ] Lint/Test by `systemd-analyze`
- [ ] Click and go to the unit file
- [ ] Auto-completion for unit file names
