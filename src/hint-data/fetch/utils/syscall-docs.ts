/**
 * This is generated from analyzer/syscall-docs.sh,
 * and it will be used by fetch/linux-syscalls
 */
export default [
    {
        names: ["_llseek"],
        docs: "reposition read/write file offset",
    },
    {
        names: ["select", "pselect", "FD_CLR", "FD_ISSET", "FD_SET", "FD_ZERO"],
        docs: "synchronous I/O multiplexing",
    },
    {
        names: ["sysctl"],
        docs: "read/write system parameters",
    },
    {
        names: ["accept", "accept4"],
        docs: "accept a connection on a socket",
    },
    {
        names: ["access", "faccessat", "faccessat2"],
        docs: "check user's permissions for a file",
    },
    {
        names: ["acct"],
        docs: "switch process accounting on or off",
    },
    {
        names: ["add_key"],
        docs: "add a key to the kernel's key management facility",
    },
    {
        names: ["adjtimex", "clock_adjtime", "ntp_adjtime"],
        docs: "tune kernel clock",
    },
    {
        names: ["alarm"],
        docs: "set an alarm clock for delivery of a signal",
    },
    {
        names: ["alloc_hugepages", "free_hugepages"],
        docs: "allocate or free huge pages",
    },
    {
        names: ["arch_prctl"],
        docs: "set architecture-specific thread state",
    },
    {
        names: ["bdflush"],
        docs: "start, flush, or tune buffer-dirty-flush daemon",
    },
    {
        names: ["bind"],
        docs: "bind a name to a socket",
    },
    {
        names: ["bpf"],
        docs: "perform a command on an extended BPF map or program",
    },
    {
        names: ["brk", "sbrk"],
        docs: "change data segment size",
    },
    {
        names: ["cacheflush"],
        docs: "flush contents of instruction and/or data cache",
    },
    {
        names: ["capget", "capset"],
        docs: "set/get capabilities of thread(s)",
    },
    {
        names: ["chdir", "fchdir"],
        docs: "change working directory",
    },
    {
        names: ["chmod", "fchmod", "fchmodat"],
        docs: "change permissions of a file",
    },
    {
        names: ["chown", "fchown", "lchown", "fchownat"],
        docs: "change ownership of a file",
    },
    {
        names: ["chroot"],
        docs: "change root directory",
    },
    {
        names: ["clock_getres", "clock_gettime", "clock_settime"],
        docs: "clock and time functions",
    },
    {
        names: ["clock_nanosleep"],
        docs: "high-resolution sleep with specifiable clock",
    },
    {
        names: ["clone", "__clone2", "clone3"],
        docs: "create a child process",
    },
    {
        names: ["close"],
        docs: "close a file descriptor",
    },
    {
        names: ["connect"],
        docs: "initiate a connection on a socket",
    },
    {
        names: ["copy_file_range"],
        docs: "Copy a range of data from one file to another",
    },
    {
        names: ["open", "openat", "creat"],
        docs: "open and possibly create a file",
    },
    {
        names: ["create_module"],
        docs: "create a loadable module entry",
    },
    {
        names: ["delete_module"],
        docs: "unload a kernel module",
    },
    {
        names: ["dup", "dup2", "dup3"],
        docs: "duplicate a file descriptor",
    },
    {
        names: ["epoll_create", "epoll_create1"],
        docs: "open an epoll file descriptor",
    },
    {
        names: ["epoll_ctl"],
        docs: "control interface for an epoll file descriptor",
    },
    {
        names: ["epoll_wait", "epoll_pwait"],
        docs: "wait for an I/O event on an epoll file descriptor",
    },
    {
        names: ["eventfd"],
        docs: "create a file descriptor for event notification",
    },
    {
        names: ["execve"],
        docs: "execute program",
    },
    {
        names: ["execveat"],
        docs: "execute program relative to a directory file descriptor",
    },
    {
        names: ["_exit", "_Exit"],
        docs: "terminate the calling process",
    },
    {
        names: ["exit_group"],
        docs: "exit all threads in a process",
    },
    {
        names: ["posix_fadvise"],
        docs: "predeclare an access pattern for file data",
    },
    {
        names: ["fallocate"],
        docs: "manipulate file space",
    },
    {
        names: ["fanotify_init"],
        docs: "create and initialize fanotify group",
    },
    {
        names: ["fanotify_mark"],
        docs: "add, remove, or modify an fanotify mark on a filesystem object",
    },
    {
        names: ["fcntl"],
        docs: "manipulate file descriptor",
    },
    {
        names: ["fsync", "fdatasync"],
        docs: "synchronize a file's in-core state with storage device",
    },
    {
        names: ["getxattr", "lgetxattr", "fgetxattr"],
        docs: "retrieve an extended attribute value",
    },
    {
        names: ["init_module", "finit_module"],
        docs: "load a kernel module",
    },
    {
        names: ["listxattr", "llistxattr", "flistxattr"],
        docs: "list extended attribute names",
    },
    {
        names: ["flock"],
        docs: "apply or remove an advisory lock on an open file",
    },
    {
        names: ["fork"],
        docs: "create a child process",
    },
    {
        names: ["removexattr", "lremovexattr", "fremovexattr"],
        docs: "remove an extended attribute",
    },
    {
        names: ["setxattr", "lsetxattr", "fsetxattr"],
        docs: "set an extended attribute value",
    },
    {
        names: ["stat", "fstat", "lstat", "fstatat"],
        docs: "get file status",
    },
    {
        names: ["statfs", "fstatfs"],
        docs: "get filesystem statistics",
    },
    {
        names: ["truncate", "ftruncate"],
        docs: "truncate a file to a specified length",
    },
    {
        names: ["futex"],
        docs: "fast user-space locking",
    },
    {
        names: ["futimesat"],
        docs: "change timestamps of a file relative to a directory file descriptor",
    },
    {
        names: ["get_kernel_syms"],
        docs: "retrieve exported kernel and module symbols",
    },
    {
        names: ["get_mempolicy"],
        docs: "retrieve NUMA memory policy for a thread",
    },
    {
        names: ["get_robust_list", "set_robust_list"],
        docs: "get/set list of robust futexes",
    },
    {
        names: ["get_thread_area", "set_thread_area"],
        docs: "manipulate thread-local storage information",
    },
    {
        names: ["getcpu"],
        docs: "determine CPU and NUMA node on which the calling thread is running",
    },
    {
        names: ["getcwd", "getwd", "get_current_dir_name"],
        docs: "get current working directory",
    },
    {
        names: ["getdents", "getdents64"],
        docs: "get directory entries",
    },
    {
        names: ["getdomainname", "setdomainname"],
        docs: "get/set NIS domain name",
    },
    {
        names: ["getgid", "getegid"],
        docs: "get group identity",
    },
    {
        names: ["getuid", "geteuid"],
        docs: "get user identity",
    },
    {
        names: ["getgroups", "setgroups"],
        docs: "get/set list of supplementary group IDs",
    },
    {
        names: ["gethostname", "sethostname"],
        docs: "get/set hostname",
    },
    {
        names: ["getitimer", "setitimer"],
        docs: "get or set value of an interval timer",
    },
    {
        names: ["getpeername"],
        docs: "get name of connected peer socket",
    },
    {
        names: ["getpagesize"],
        docs: "get memory page size",
    },
    {
        names: ["setpgid", "getpgid", "setpgrp", "getpgrp"],
        docs: "set/get process group",
    },
    {
        names: ["getpid", "getppid"],
        docs: "get process identification",
    },
    {
        names: ["getpriority", "setpriority"],
        docs: "get/set program scheduling priority",
    },
    {
        names: ["getrandom"],
        docs: "obtain a series of random bytes",
    },
    {
        names: ["getresuid", "getresgid"],
        docs: "get real, effective and saved user/group IDs",
    },
    {
        names: ["getrlimit", "setrlimit", "prlimit"],
        docs: "get/set resource limits",
    },
    {
        names: ["getrusage"],
        docs: "get resource usage",
    },
    {
        names: ["getsid"],
        docs: "get session ID",
    },
    {
        names: ["getsockname"],
        docs: "get socket name",
    },
    {
        names: ["getsockopt", "setsockopt"],
        docs: "get and set options on sockets",
    },
    {
        names: ["gettid"],
        docs: "get thread identification",
    },
    {
        names: ["gettimeofday", "settimeofday"],
        docs: "get / set time",
    },
    {
        names: ["getunwind"],
        docs: "copy the unwind data to caller's buffer",
    },
    {
        names: ["inotify_add_watch"],
        docs: "add a watch to an initialized inotify instance",
    },
    {
        names: ["inotify_init", "inotify_init1"],
        docs: "initialize an inotify instance",
    },
    {
        names: ["inotify_rm_watch"],
        docs: "remove an existing watch from an inotify instance",
    },
    {
        names: ["io_cancel"],
        docs: "cancel an outstanding asynchronous I/O operation",
    },
    {
        names: ["io_destroy"],
        docs: "destroy an asynchronous I/O context",
    },
    {
        names: ["io_getevents"],
        docs: "read asynchronous I/O events from the completion queue",
    },
    {
        names: ["io_setup"],
        docs: "create an asynchronous I/O context",
    },
    {
        names: ["io_submit"],
        docs: "submit asynchronous I/O blocks for processing",
    },
    {
        names: ["ioctl"],
        docs: "control device",
    },
    {
        names: ["ioperm"],
        docs: "set port input/output permissions",
    },
    {
        names: ["iopl"],
        docs: "change I/O privilege level",
    },
    {
        names: ["ioprio_get", "ioprio_set"],
        docs: "get/set I/O scheduling class and priority",
    },
    {
        names: ["ipc"],
        docs: "System V IPC system calls",
    },
    {
        names: ["kcmp"],
        docs: "compare two processes to determine if they share a kernel resource",
    },
    {
        names: ["kexec_load", "kexec_file_load"],
        docs: "load a new kernel for later execution",
    },
    {
        names: ["keyctl"],
        docs: "manipulate the kernel's key management facility",
    },
    {
        names: ["kill"],
        docs: "send signal to a process",
    },
    {
        names: ["link", "linkat"],
        docs: "make a new name for a file",
    },
    {
        names: ["listen"],
        docs: "listen for connections on a socket",
    },
    {
        names: ["lookup_dcookie"],
        docs: "return a directory entry's path",
    },
    {
        names: ["lseek"],
        docs: "reposition read/write file offset",
    },
    {
        names: ["madvise"],
        docs: "give advice about use of memory",
    },
    {
        names: ["mbind"],
        docs: "set memory policy for a memory range",
    },
    {
        names: ["membarrier"],
        docs: "issue memory barriers on a set of threads",
    },
    {
        names: ["memfd_create"],
        docs: "create an anonymous file",
    },
    {
        names: ["migrate_pages"],
        docs: "move all pages in a process to another set of nodes",
    },
    {
        names: ["mincore"],
        docs: "determine whether pages are resident in memory",
    },
    {
        names: ["mkdir", "mkdirat"],
        docs: "create a directory",
    },
    {
        names: ["mknod", "mknodat"],
        docs: "create a special or ordinary file",
    },
    {
        names: ["mlock", "mlock2", "munlock", "mlockall", "munlockall"],
        docs: "lock and unlock memory",
    },
    {
        names: ["mmap", "munmap"],
        docs: "map or unmap files or devices into memory",
    },
    {
        names: ["mmap2"],
        docs: "map files or devices into memory",
    },
    {
        names: ["modify_ldt"],
        docs: "get or set a per-process LDT entry",
    },
    {
        names: ["mount"],
        docs: "mount filesystem",
    },
    {
        names: ["move_pages"],
        docs: "move individual pages of a process to another node",
    },
    {
        names: ["mprotect", "pkey_mprotect"],
        docs: "set protection on a region of memory",
    },
    {
        names: ["mq_getsetattr"],
        docs: "get/set message queue attributes",
    },
    {
        names: ["mq_notify"],
        docs: "register for notification when a message is available",
    },
    {
        names: ["mq_open"],
        docs: "open a message queue",
    },
    {
        names: ["mq_receive", "mq_timedreceive"],
        docs: "receive a message from a message queue",
    },
    {
        names: ["mq_send", "mq_timedsend"],
        docs: "send a message to a message queue",
    },
    {
        names: ["mq_unlink"],
        docs: "remove a message queue",
    },
    {
        names: ["mremap"],
        docs: "remap a virtual memory address",
    },
    {
        names: ["msgctl"],
        docs: "System V message control operations",
    },
    {
        names: ["msgget"],
        docs: "get a System V message queue identifier",
    },
    {
        names: ["msgrcv", "msgsnd"],
        docs: "System V message queue operations",
    },
    {
        names: ["msync"],
        docs: "synchronize a file with a memory map",
    },
    {
        names: ["name_to_handle_at", "open_by_handle_at"],
        docs: "obtain handle for a pathname and open file via a handle",
    },
    {
        names: ["nanosleep"],
        docs: "high-resolution sleep",
    },
    {
        names: ["nfsservctl"],
        docs: "syscall interface to kernel nfs daemon",
    },
    {
        names: ["nice"],
        docs: "change process priority",
    },
    {
        names: ["uname"],
        docs: "get name and information about current kernel",
    },
    {
        names: ["openat2"],
        docs: "open and possibly create a file (extended)",
    },
    {
        names: ["pause"],
        docs: "wait for signal",
    },
    {
        names: ["pciconfig_read", "pciconfig_write", "pciconfig_iobase"],
        docs: "pci device information handling",
    },
    {
        names: ["perf_event_open"],
        docs: "set up performance monitoring",
    },
    {
        names: ["personality"],
        docs: "set the process execution domain",
    },
    {
        names: ["perfmonctl"],
        docs: "interface to IA-64 performance monitoring unit",
    },
    {
        names: ["pidfd_getfd"],
        docs: "obtain a duplicate of another process's file descriptor",
    },
    {
        names: ["pidfd_send_signal"],
        docs: "send a signal to a process specified by a file descriptor",
    },
    {
        names: ["pidfd_open"],
        docs: "obtain a file descriptor that refers to a process",
    },
    {
        names: ["pipe", "pipe2"],
        docs: "create pipe",
    },
    {
        names: ["pivot_root"],
        docs: "change the root mount",
    },
    {
        names: ["pkey_alloc", "pkey_free"],
        docs: "allocate or free a protection key",
    },
    {
        names: ["poll", "ppoll"],
        docs: "wait for some event on a file descriptor",
    },
    {
        names: ["prctl"],
        docs: "operations on a process or thread",
    },
    {
        names: ["pread", "pwrite"],
        docs: "read from or write to a file descriptor at a given offset",
    },
    {
        names: ["readv", "writev", "preadv", "pwritev", "preadv2", "pwritev2"],
        docs: "read or write data into multiple buffers",
    },
    {
        names: ["process_vm_readv", "process_vm_writev"],
        docs: "transfer data between process address spaces",
    },
    {
        names: ["ptrace"],
        docs: "process trace",
    },
    {
        names: ["query_module"],
        docs: "query the kernel for various bits pertaining to modules",
    },
    {
        names: ["quotactl"],
        docs: "manipulate disk quotas",
    },
    {
        names: ["read"],
        docs: "read from a file descriptor",
    },
    {
        names: ["readahead"],
        docs: "initiate file readahead into page cache",
    },
    {
        names: ["readdir"],
        docs: "read directory entry",
    },
    {
        names: ["readlink", "readlinkat"],
        docs: "read value of a symbolic link",
    },
    {
        names: ["reboot"],
        docs: "reboot or enable/disable Ctrl-Alt-Del",
    },
    {
        names: ["recv", "recvfrom", "recvmsg"],
        docs: "receive a message from a socket",
    },
    {
        names: ["recvmmsg"],
        docs: "receive multiple messages on a socket",
    },
    {
        names: ["remap_file_pages"],
        docs: "create a nonlinear file mapping",
    },
    {
        names: ["rename", "renameat", "renameat2"],
        docs: "change the name or location of a file",
    },
    {
        names: ["request_key"],
        docs: "request a key from the kernel's key management facility",
    },
    {
        names: ["restart_syscall"],
        docs: "restart a system call after interruption by a stop signal",
    },
    {
        names: ["rmdir"],
        docs: "delete a directory",
    },
    {
        names: ["sigaction", "rt_sigaction"],
        docs: "examine and change a signal action",
    },
    {
        names: ["sigpending", "rt_sigpending"],
        docs: "examine pending signals",
    },
    {
        names: ["sigprocmask", "rt_sigprocmask"],
        docs: "examine and change blocked signals",
    },
    {
        names: ["rt_sigqueueinfo", "rt_tgsigqueueinfo"],
        docs: "queue a signal and data",
    },
    {
        names: ["sigreturn", "rt_sigreturn"],
        docs: "return from signal handler and cleanup stack frame",
    },
    {
        names: ["sigsuspend", "rt_sigsuspend"],
        docs: "wait for a signal",
    },
    {
        names: ["sigwaitinfo", "sigtimedwait", "rt_sigtimedwait"],
        docs: "synchronously wait for queued signals",
    },
    {
        names: ["s390_runtime_instr"],
        docs: "enable/disable s390 CPU run-time instrumentation",
    },
    {
        names: ["s390_pci_mmio_write", "s390_pci_mmio_read"],
        docs: "transfer data to/from PCI MMIO memory page",
    },
    {
        names: ["s390_sthyi"],
        docs: "emulate STHYI instruction",
    },
    {
        names: ["s390_guarded_storage"],
        docs: "operations with z/Architecture guarded storage facility",
    },
    {
        names: ["sched_get_priority_max", "sched_get_priority_min"],
        docs: "get static priority range",
    },
    {
        names: ["sched_setaffinity", "sched_getaffinity"],
        docs: "set and get a thread's CPU affinity mask",
    },
    {
        names: ["sched_setattr", "sched_getattr"],
        docs: "set and get scheduling policy and attributes",
    },
    {
        names: ["sched_setparam", "sched_getparam"],
        docs: "set and get scheduling parameters",
    },
    {
        names: ["sched_setscheduler", "sched_getscheduler"],
        docs: "set and get scheduling policy/parameters",
    },
    {
        names: ["sched_rr_get_interval"],
        docs: "get the SCHED_RR interval for the named process",
    },
    {
        names: ["sched_yield"],
        docs: "yield the processor",
    },
    {
        names: ["seccomp"],
        docs: "operate on Secure Computing state of the process",
    },
    {
        names: ["semctl"],
        docs: "System V semaphore control operations",
    },
    {
        names: ["semget"],
        docs: "get a System V semaphore set identifier",
    },
    {
        names: ["semop", "semtimedop"],
        docs: "System V semaphore operations",
    },
    {
        names: ["send", "sendto", "sendmsg"],
        docs: "send a message on a socket",
    },
    {
        names: ["sendfile"],
        docs: "transfer data between file descriptors",
    },
    {
        names: ["sendmmsg"],
        docs: "send multiple messages on a socket",
    },
    {
        names: ["set_mempolicy"],
        docs: "set default NUMA memory policy for a thread and its children",
    },
    {
        names: ["set_tid_address"],
        docs: "set pointer to thread ID",
    },
    {
        names: ["setfsgid"],
        docs: "set group identity used for filesystem checks",
    },
    {
        names: ["setfsuid"],
        docs: "set user identity used for filesystem checks",
    },
    {
        names: ["setgid"],
        docs: "set group identity",
    },
    {
        names: ["setns"],
        docs: "reassociate thread with a namespace",
    },
    {
        names: ["setreuid", "setregid"],
        docs: "set real and/or effective user or group ID",
    },
    {
        names: ["setresuid", "setresgid"],
        docs: "set real, effective and saved user or group ID",
    },
    {
        names: ["setsid"],
        docs: "creates a session and sets the process group ID",
    },
    {
        names: ["setuid"],
        docs: "set user identity",
    },
    {
        names: ["setup"],
        docs: "setup devices and filesystems, mount root filesystem",
    },
    {
        names: ["sgetmask", "ssetmask"],
        docs: "manipulation of signal mask (obsolete)",
    },
    {
        names: ["shmat", "shmdt"],
        docs: "System V shared memory operations",
    },
    {
        names: ["shmctl"],
        docs: "System V shared memory control",
    },
    {
        names: ["shmget"],
        docs: "allocates a System V shared memory segment",
    },
    {
        names: ["shutdown"],
        docs: "shut down part of a full-duplex connection",
    },
    {
        names: ["sigaltstack"],
        docs: "set and/or get signal stack context",
    },
    {
        names: ["signal"],
        docs: "ANSI C signal handling",
    },
    {
        names: ["signalfd"],
        docs: "create a file descriptor for accepting signals",
    },
    {
        names: ["socket"],
        docs: "create an endpoint for communication",
    },
    {
        names: ["socketcall"],
        docs: "socket system calls",
    },
    {
        names: ["socketpair"],
        docs: "create a pair of connected sockets",
    },
    {
        names: ["splice"],
        docs: "splice data to/from a pipe",
    },
    {
        names: ["spu_create"],
        docs: "create a new spu context",
    },
    {
        names: ["spu_run"],
        docs: "execute an SPU context",
    },
    {
        names: ["statx"],
        docs: "get file status (extended)",
    },
    {
        names: ["stime"],
        docs: "set time",
    },
    {
        names: ["subpage_prot"],
        docs: "define a subpage protection for an address range",
    },
    {
        names: ["swapon", "swapoff"],
        docs: "start/stop swapping to file/device",
    },
    {
        names: ["symlink", "symlinkat"],
        docs: "make a new name for a file",
    },
    {
        names: ["sync", "syncfs"],
        docs: "commit filesystem caches to disk",
    },
    {
        names: ["sync_file_range"],
        docs: "sync a file segment with disk",
    },
    {
        names: ["syscall"],
        docs: "indirect system call",
    },
    {
        names: ["sysfs"],
        docs: "get filesystem type information",
    },
    {
        names: ["sysinfo"],
        docs: "return system information",
    },
    {
        names: ["syslog", "klogctl"],
        docs: "read and/or clear kernel message ring buffer; set console_loglevel",
    },
    {
        names: ["tee"],
        docs: "duplicating pipe content",
    },
    {
        names: ["tkill", "tgkill"],
        docs: "send a signal to a thread",
    },
    {
        names: ["time"],
        docs: "get time in seconds",
    },
    {
        names: ["timer_create"],
        docs: "create a POSIX per-process timer",
    },
    {
        names: ["timer_delete"],
        docs: "delete a POSIX per-process timer",
    },
    {
        names: ["timer_getoverrun"],
        docs: "get overrun count for a POSIX per-process timer",
    },
    {
        names: ["timer_settime", "timer_gettime"],
        docs: "arm/disarm and fetch state of POSIX per-process timer",
    },
    {
        names: ["timerfd_create", "timerfd_settime", "timerfd_gettime"],
        docs: "timers that notify via file descriptors",
    },
    {
        names: ["times"],
        docs: "get process times",
    },
    {
        names: ["umask"],
        docs: "set file mode creation mask",
    },
    {
        names: ["umount", "umount2"],
        docs: "unmount filesystem",
    },
    {
        names: ["unlink", "unlinkat"],
        docs: "delete a name and possibly the file it refers to",
    },
    {
        names: ["unshare"],
        docs: "disassociate parts of the process execution context",
    },
    {
        names: ["uselib"],
        docs: "load shared library",
    },
    {
        names: ["ustat"],
        docs: "get filesystem statistics",
    },
    {
        names: ["userfaultfd"],
        docs: "create a file descriptor for handling page faults in user space",
    },
    {
        names: ["utime", "utimes"],
        docs: "change file last access and modification times",
    },
    {
        names: ["utimensat", "futimens"],
        docs: "change file timestamps with nanosecond precision",
    },
    {
        names: ["vfork"],
        docs: "create a child process and block parent",
    },
    {
        names: ["vhangup"],
        docs: "virtually hangup the current terminal",
    },
    {
        names: ["vm86old", "vm86"],
        docs: "enter virtual 8086 mode",
    },
    {
        names: ["vmsplice"],
        docs: "splice user pages to/from a pipe",
    },
    {
        names: ["wait3", "wait4"],
        docs: "wait for process to change state, BSD style",
    },
    {
        names: ["wait", "waitpid", "waitid"],
        docs: "wait for process to change state",
    },
    {
        names: ["write"],
        docs: "write to a file descriptor",
    },
];
