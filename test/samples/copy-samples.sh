#!/usr/bin/env bash

# goto root directory of project
pushd "$( dirname "${BASH_SOURCE[0]}" )/../.." || exit 1;
throw() { echo -e "fatal: $1" >&2; exit 1; }

if [ -z "$SYSTEMD_PROJECT_DIR" ]; then
    SYSTEMD_PROJECT_DIR="../systemd";
fi

if [ ! -d "$SYSTEMD_PROJECT_DIR" ]; then
    throw "'$SYSTEMD_PROJECT_DIR' is not a directory";
fi

find "$SYSTEMD_PROJECT_DIR" -type f -iname 'directives*' \! -iname '*.xml' |
while read -r file; do
    cp -v "$file" test/samples/systemd;
done

echo "done!";
