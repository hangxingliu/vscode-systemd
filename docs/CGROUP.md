---
date: 2024-03-14
category: knowledge
---
# cgroup

## Systemd version 255

> We intend to remove cgroup v1 support from a systemd release after
> the end of 2023. If you run services that make explicit use of
> cgroup v1 features (i.e. the "legacy hierarchy" with separate
> hierarchies for each controller), please implement compatibility with
> cgroup v2 (i.e. the "unified hierarchy") sooner rather than later.
> Most of Linux userspace has been ported over already.
