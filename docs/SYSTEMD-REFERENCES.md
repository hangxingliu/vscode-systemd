# Systemd Releated References

> **systemd**  is a suite of basic building blocks for a Linux system. It provides a system and service manager that runs as PID 1 and starts the rest of the system.
>
> from <https://systemd.io/>



> The basic object that `systemd` manages and acts upon is a “unit”. Units can be of many types, but the most common type is a “service” (indicated by a unit file ending in `.service`). To manage services on a `systemd` enabled server, our main tool is the `systemctl` command.
>
> from <https://www.digitalocean.com/community/tutorials/systemd-essentials-working-with-services-units-and-the-journal>



> A unit file is a plain text ini-style file that encodes information about
>
> - a service
> - a socket
> - a device
> - a mount point
> - an automount point
> - a swap file or partition
> - a start-up target
> - a watched file system path
> - a timer controlled and supervised by [systemd(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd.html#)
> - a resource management slice 
> - or a group of externally created processes
>   
> The unit type suffix must be one of "`.service`", "`.socket`", "`.device`", "`.mount`", "`.automount`", "`.swap`", "`.target`", "`.path`", "`.timer`", "`.slice`", or "`.scope`".
>
> from <https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html#Description>


> Boolean arguments used in configuration files can be written in various formats. For positive settings the strings `1`, `yes`, `true` and `on` are equivalent. For negative settings, the strings `0`, `no`, `false` and `off` are equivalent.



<https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html#>

> ## String Escaping for Inclusion in Unit Names
>
> Sometimes it is useful to convert arbitrary strings into unit names. To facilitate this, a method of string escaping is used, in order to map strings containing arbitrary byte values (except `NUL`) into valid unit names and their restricted character set. A common special case are unit names that reflect paths to objects in the file system hierarchy. Example: a device unit `dev-sda.device` refers to a device with the device node `/dev/sda` in the file system.
>
> The escaping algorithm operates as follows: given a string, any "`/`" character is replaced by "`-`", and all other characters which are not ASCII alphanumerics, "`:`", "`_`" or "`.`" are replaced by C-style "`\x2d`" escapes. In addition, "`.`" is replaced with such a C-style escape when it would appear as the first character in the escaped string.
>
> When the input qualifies as absolute file system path, this algorithm is extended slightly: the path to the root directory "`/`" is encoded as single dash "`-`". In addition, any leading, trailing or duplicate "`/`" characters are removed from the string before transformation. Example: `/foo//bar/baz/` becomes "`foo-bar-baz`".
>
> This escaping is fully reversible, as long as it is known whether the escaped string was a path (the unescaping results are different for paths and non-path strings). The [systemd-escape(1)](https://www.freedesktop.org/software/systemd/man/latest/systemd-escape.html#) command may be used to apply and reverse escaping on arbitrary strings. Use **systemd-escape --path** to escape path strings, and **systemd-escape** without `--path` otherwise.

