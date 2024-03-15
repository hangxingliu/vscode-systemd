#!/usr/bin/env bash

syscalls=("_llseek" "_newselect" "_sysctl" "accept" "accept4" "access" "acct" "add_key" "adjtimex" "alarm" "alloc_hugepages" "arc_gettls" "arc_settls" "arc_usr_cmpxchg" "arch_prctl" "atomic_barrier" "atomic_cmpxchg_32" "bdflush" "bind" "bpf" "brk" "breakpoint" "cacheflush" "capget" "capset" "chdir" "chmod" "chown" "chown32" "chroot" "clock_adjtime" "clock_getres" "clock_gettime" "clock_nanosleep" "clock_settime" "clone2" "clone" "clone3" "close" "close_range" "connect" "copy_file_range" "creat" "create_module" "delete_module" "dup" "dup2" "dup3" "epoll_create" "epoll_create1" "epoll_ctl" "epoll_pwait" "epoll_pwait2" "epoll_wait" "eventfd" "eventfd2" "execv" "execve" "execveat" "exit" "exit_group" "faccessat" "faccessat2" "fadvise64" "fadvise64_64" "fallocate" "fanotify_init" "fanotify_mark" "fchdir" "fchmod" "fchmodat" "fchown" "fchown32" "fchownat" "fcntl" "fcntl64" "fdatasync" "fgetxattr" "finit_module" "flistxattr" "flock" "fork" "free_hugepages" "fremovexattr" "fsconfig" "fsetxattr" "fsmount" "fsopen" "fspick" "fstat" "fstat64" "fstatat64" "fstatfs" "fstatfs64" "fsync" "ftruncate" "ftruncate64" "futex" "futimesat" "get_kernel_syms" "get_mempolicy" "get_robust_list" "get_thread_area" "get_tls" "getcpu" "getcwd" "getdents" "getdents64" "getdomainname" "getdtablesize" "getegid" "getegid32" "geteuid" "geteuid32" "getgid" "getgid32" "getgroups" "getgroups32" "gethostname" "getitimer" "getpeername" "getpagesize" "getpgid" "getpgrp" "getpid" "getppid" "getpriority" "getrandom" "getresgid" "getresgid32" "getresuid" "getresuid32" "getrlimit" "getrusage" "getsid" "getsockname" "getsockopt" "gettid" "gettimeofday" "getuid" "getuid32" "getunwind" "getxattr" "getxgid" "getxpid" "getxuid" "init_module" "inotify_add_watch" "inotify_init" "inotify_init1" "inotify_rm_watch" "io_cancel" "io_destroy" "io_getevents" "io_pgetevents" "io_setup" "io_submit" "io_uring_enter" "io_uring_register" "io_uring_setup" "ioctl" "ioperm" "iopl" "ioprio_get" "ioprio_set" "ipc" "kcmp" "kern_features" "kexec_file_load" "kexec_load" "keyctl" "kill" "landlock_add_rule" "landlock_create_ruleset" "landlock_restrict_self" "lchown" "lchown32" "lgetxattr" "link" "linkat" "listen" "listxattr" "llistxattr" "lookup_dcookie" "lremovexattr" "lseek" "lsetxattr" "lstat" "lstat64" "madvise" "mbind" "memory_ordering" "membarrier" "memfd_create" "memfd_secret" "migrate_pages" "mincore" "mkdir" "mkdirat" "mknod" "mknodat" "mlock" "mlock2" "mlockall" "mmap" "mmap2" "modify_ldt" "mount" "move_mount" "move_pages" "mprotect" "mq_getsetattr" "mq_notify" "mq_open" "mq_timedreceive" "mq_timedsend" "mq_unlink" "mremap" "msgctl" "msgget" "msgrcv" "msgsnd" "msync" "munlock" "munlockall" "munmap" "name_to_handle_at" "nanosleep" "newfstatat" "nfsservctl" "nice" "old_adjtimex" "old_getrlimit" "oldfstat" "oldlstat" "oldolduname" "oldstat" "oldumount" "olduname" "open" "open_by_handle_at" "open_tree" "openat" "openat2" "or1k_atomic" "pause" "pciconfig_iobase" "pciconfig_read" "pciconfig_write" "perf_event_open" "personality" "perfctr" "perfmonctl" "pidfd_getfd" "pidfd_send_signal" "pidfd_open" "pipe" "pipe2" "pivot_root" "pkey_alloc" "pkey_free" "pkey_mprotect" "poll" "ppoll" "prctl" "pread64" "preadv" "preadv2" "prlimit64" "process_madvise" "process_vm_readv" "process_vm_writev" "pselect6" "ptrace" "pwrite64" "pwritev" "pwritev2" "query_module" "quotactl" "quotactl_fd" "read" "readahead" "readdir" "readlink" "readlinkat" "readv" "reboot" "recv" "recvfrom" "recvmsg" "recvmmsg" "remap_file_pages" "removexattr" "rename" "renameat" "renameat2" "request_key" "restart_syscall" "riscv_flush_icache" "rmdir" "rseq" "rt_sigaction" "rt_sigpending" "rt_sigprocmask" "rt_sigqueueinfo" "rt_sigreturn" "rt_sigsuspend" "rt_sigtimedwait" "rt_tgsigqueueinfo" "rtas" "s390_runtime_instr" "s390_pci_mmio_read" "s390_pci_mmio_write" "s390_sthyi" "s390_guarded_storage" "sched_get_affinity" "sched_get_priority_max" "sched_get_priority_min" "sched_getaffinity" "sched_getattr" "sched_getparam" "sched_getscheduler" "sched_rr_get_interval" "sched_set_affinity" "sched_setaffinity" "sched_setattr" "sched_setparam" "sched_setscheduler" "sched_yield" "seccomp" "select" "semctl" "semget" "semop" "semtimedop" "send" "sendfile" "sendfile64" "sendmmsg" "sendmsg" "sendto" "set_mempolicy" "set_robust_list" "set_thread_area" "set_tid_address" "set_tls" "setdomainname" "setfsgid" "setfsgid32" "setfsuid" "setfsuid32" "setgid" "setgid32" "setgroups" "setgroups32" "sethae" "sethostname" "setitimer" "setns" "setpgid" "setpgrp" "setpriority" "setregid" "setregid32" "setresgid" "setresgid32" "setresuid" "setresuid32" "setreuid" "setreuid32" "setrlimit" "setsid" "setsockopt" "settimeofday" "setuid" "setuid32" "setup" "setxattr" "sgetmask" "shmat" "shmctl" "shmdt" "shmget" "shutdown" "sigaction" "sigaltstack" "signal" "signalfd" "signalfd4" "sigpending" "sigprocmask" "sigreturn" "sigsuspend" "socket" "socketcall" "socketpair" "spill" "splice" "spu_create" "spu_run" "ssetmask" "stat" "stat64" "statfs" "statfs64" "statx" "stime" "subpage_prot" "swapcontext" "switch_endian" "swapoff" "swapon" "symlink" "symlinkat" "sync" "sync_file_range" "sync_file_range2" "syncfs" "sys_debug_setcontext" "syscall" "sysfs" "sysinfo" "syslog" "sysmips" "tee" "tgkill" "time" "timer_create" "timer_delete" "timer_getoverrun" "timer_gettime" "timer_settime" "timerfd_create" "timerfd_gettime" "timerfd_settime" "times" "tkill" "truncate" "truncate64" "ugetrlimit" "umask" "umount" "umount2" "uname" "unlink" "unlinkat" "unshare" "uselib" "ustat" "userfaultfd" "usr26" "usr32" "utime" "utimensat" "utimes" "utrap_install" "vfork" "vhangup" "vm86old" "vm86" "vmsplice" "wait4" "waitid" "waitpid" "write" "writev" "xtensa");

resolved=();
is_resolved() {
    for r in "${resolved[@]}"; do
        [ "$r" == "$1" ] && return 0;
    done
    return 1;
}
trim() { echo "$1" | awk '{ gsub(/[ \t]+$/, "", $0); gsub(/^[ \t]+/, "", $0); print $0; }'; }

json='[]';
SECONDS=0;
for syscall in "${syscalls[@]}"; do
    docs="$(man "${syscall}.2" 2>/dev/null | awk '/^NAME$/{found=1;next;}found{print $0;exit}')";
    [ -n "$docs" ] || continue;

    names=();
    _names="${docs%%-*}";
    while true; do
        name="${_names%%\,*}"
        _names="${_names#*\,}"
        if [ "$name" != "$_names" ]; then
            names+=( "$(trim "$name")" );
        else
            names+=( "$(trim "$_names")" );
            break;
        fi
    done

    docs="${docs#*-}"
    docs="$(trim "$docs")";

    do_insert=
    names_str=""
    for name in "${names[@]}"; do
        is_resolved "$name" && continue;
        do_insert=1
        resolved+=( "$name" );

        if [ -n "$names_str" ]; then names_str="${names_str},${name}";
        else names_str="$name";
        fi
    done
    [ -n "$do_insert" ] || continue;

    echo "[.] ${names_str} ...";
    json="$(echo "$json" |
        jq --arg names "${names_str}" --arg docs "${docs}" \
            '. += [{
                "names": $names | split(","),
                "docs": $docs,
            }]')";
    # [ "$SECONDS" -gt 1 ] && break; # debug
done

file='syscall-docs.json'
echo "${json}" >"$file";
echo "[~] +${SECONDS}s '$file'";
