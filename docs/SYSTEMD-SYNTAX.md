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
