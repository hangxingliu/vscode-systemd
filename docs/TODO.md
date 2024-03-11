# TODO

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

## 2.3.0

- [ ] Add docs about new folders (e.g., `custom-directives`)
- [ ] Add and check all value completions
- [ ] Add support for value prefixes and `sep` field in value enum rules
- [ ] Add completion for predefined filters and syscalls in <https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#> and <https://man7.org/linux/man-pages/man2/syscalls.2.html>
- [ ] Update documents for `Asset*` directives in systemd.unit(5) for more human-readable

## 2.x

- [ ] Update to Systemd 256 (e.g., `IPv4ProxyARPPrivateVLAN=`)

## 3.x

- [ ] Add support for `jinja2`
- [ ] Settings for running `systemd` commands 
- [ ] Lint/Test by `systemd-analyze`
- [ ] Click and jump to unit file
- [ ] Completion for unit file names
