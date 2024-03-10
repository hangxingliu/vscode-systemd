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

## 2.3.0

- [ ] Add docs about new folders (e.g., `custom-directives`) and how to update hint data after systemd released new version
- [ ] Support value prefixes and `sep` field in value enum rules
- [ ] Systemd 256: `IPv4ProxyARPPrivateVLAN=`
- [ ] Add more deprecated/removed/renamed directives from `CHANGELOG` in systemd repo
- [ ] Add completion for predefined filters in <https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#>
    - <https://man7.org/linux/man-pages/man2/syscalls.2.html>

## 2.4.0

- [ ] Add support for `jinja2`
- [ ] Settings for running `systemd` commands 
- [ ] Lint/Test by `systemd-analyze`
- [ ] Click and jump to unit file
- [ ] Completion for path
- [ ] View, search and edit remote unit files
