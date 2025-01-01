#!/usr/bin/env bash

throw() { printf "fatal: %s\n" "$1" >&2; exit 1; }
print_cmd() { printf "\$ %s\n" "$*"; }
execute() { print_cmd "$@"; "$@" || throw "Failed to execute '$1'"; }

command -v cspell >/dev/null || throw "cspell is not installed! (https://cspell.org/)";

# change the current directory to the project directory
pushd "$( dirname -- "${BASH_SOURCE[0]}" )/.." >/dev/null || exit 1;

git_log_cmd=( git log --graph --decorate -n 10 );
print_cmd "${git_log_cmd[@]}"
"${git_log_cmd[@]}" > git-recent-history.log;

check_files=(
    docs
    scripts
    src
    git-recent-history.log
    README.md
)
execute cspell "${check_files[@]}";
execute rm -- git-recent-history.log;
