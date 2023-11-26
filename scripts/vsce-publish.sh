#!/usr/bin/env bash

throw() { echo -e "fatal: $1" >&2; exit 1; }
execute() { echo "$ $*"; "$@" || throw "Failed to execute '$1'"; }
command -v node >/dev/null || throw "'node' is not found!";

# change the current directory to the project directory
pushd "$( dirname -- "${BASH_SOURCE[0]}" )/.." >/dev/null || exit 1;

[ -z "$VSCE_PAT" ] && throw "environment variable 'VSCE_PAT' is empty!";

get_pkg() { node -e 'console.log(require("./package.json").'"$1"')'; }
PKG_VERSION="$(get_pkg version)";
PKG_PUBLISHER="$(get_pkg publisher)";
[ -z "$PKG_VERSION" ] && throw 'get version from package.json failed!';
[ -z "$PKG_PUBLISHER" ] && throw 'get publisher from package.json failed!';

execute ./scripts/vsce.sh verify-pat "$PKG_PUBLISHER" || throw 'verify failed!';
execute ./scripts/vsce.sh publish "$PKG_VERSION" || throw 'publish failed!';
echo "[+] vsce-publish.sh done";
