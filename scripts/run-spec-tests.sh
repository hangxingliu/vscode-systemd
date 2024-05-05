#!/usr/bin/env bash

throw() { echo -e "fatal: $1" >&2; exit 1; }
execute() { echo "$ $*"; "$@" || throw "Failed to execute '$1'"; }
RED="\x1b[31m"; BOLD="\x1b[1m"; RESET="\x1b[0m";

# change the current directory to the script directory
pushd "$( dirname -- "${BASH_SOURCE[0]}" )/.." >/dev/null || exit 1;

execute yarn run build:ts

spec_tests="$(find ./out/parser-v2/tests -iname '*.spec.js' -type f)";
log_file="scripts/spec-test-output.log";

ok=1
while read -r file; do
    cmd=( node --enable-source-maps "$file" );
    printf "$ %s\n" "${cmd[*]}";
    "${cmd[@]}" >"$log_file" 2>&1
    exitcode="$?";
    if [ $exitcode -ne 0 ]; then
        printf "${RED}${BOLD}Error: failed to run spec test, exitcode: %s\n" "$exitcode";
        printf "output:\n${RESET}${RED}%s${RESET}\n\n" "$(cat "$log_file")";
        ok=0
    fi
done <<< "$spec_tests";
[ "$ok" -eq 1 ] || throw "some spec tests failed";
