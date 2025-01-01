---
date: 2025-01-02
last_check: 2025-01-02
---
# Syntax

## General syntax of systemd configuration files

<https://www.freedesktop.org/software/systemd/man/systemd.syntax.html#>

> Each file is a plain text file divided into sections, with configuration entries in the style key=value. 
> Empty lines and lines starting with "#" or ";" are ignored, which may be used for commenting.

> Lines ending in a backslash are concatenated with the following line while reading and the backslash is replaced by a space character. 
> This may be used to wrap long lines. The limit on line length is very large (currently 1 MB), 
> but it is recommended to avoid such long lines and use multiple directives, variable substitution, 
> or other mechanism as appropriate for the given file type.

## Mkosi syntax

<https://github.com/systemd/mkosi/blob/23b17713f4446ca5a9c78eb3e7c99e17afaff408/mkosi/config.py#L2114>

The difference from systemd configuration syntax is as follows:

1. In-line comment is supported (`line = line[:comment]`)
2. Multiple lines of value are implemented through indentation rather than an escape character at the end of each line.

```
[SECTION NAME] # Comment
Key=line1
 line2
Key2=val # Comment
```

### Deprecated `@` "Default Value" Syntax

Old:

> <https://github.com/systemd/mkosi/blob/8aefea6923dd049d060eea7e88f9054b674b432e/mkosi/resources/mkosi.md>
>
> If a setting's name in the configuration file is prefixed with `@`, 
> it configures the default value used for that setting if no explicit default value is set. 
> This can be used to set custom default values in configuration files that can still be overridden by
> specifying the setting explicitly via the CLI.


They removed it in the commit [1b8f7f240dfdc85bc7bdf2b3aea3c590d2203eba](https://github.com/systemd/mkosi/commit/1b8f7f240dfdc85bc7bdf2b3aea3c590d2203eba):

> Note that settings configured via the command line always override
> settings configured via configuration files. If the same setting is
> configured more than once via configuration files, later assignments
> override earlier assignments except for settings that take a collection
> of values. Also, settings read from `mkosi.local.conf` will override
> settings from configuration files that are parsed later but not settings
> specified on the CLI.

