# General syntax of systemd configuration files

> <https://www.freedesktop.org/software/systemd/man/systemd.syntax.html#>

> Each file is a plain text file divided into sections, with configuration entries in the style key=value. 
> Empty lines and lines starting with "#" or ";" are ignored, which may be used for commenting.

> Lines ending in a backslash are concatenated with the following line while reading and the backslash is replaced by a space character. 
> This may be used to wrap long lines. The limit on line length is very large (currently 1 MB), 
> but it is recommended to avoid such long lines and use multiple directives, variable substitution, 
> or other mechanism as appropriate for the given file type.
