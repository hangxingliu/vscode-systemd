#!/usr/bin/env bash

#region config
PROJECT_ROOT=".."
# VSCE_PAT="$OTHE_ENV_VAR"
#endregion config

#region main
#
# template: vsce.sh
#   author: hangxingliu
#  version: 2023-11-29
#
throw() { echo -e "fatal: $1" >&2; exit 1; }
execute() { echo "$ $*"; "$@" || throw "Failed to execute '$1'"; }

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )";
PROJECT_DIR="${SCRIPT_DIR}/${PROJECT_ROOT}";
TEMP_INFO_FILE="${PROJECT_DIR}/.vsce-show.log";

VSCE="$(command -v vsce)";
[ -z "$VSCE" ] && VSCE="${PROJECT_DIR}/node_modules/.bin/vsce";
[ -x "$VSCE" ] || throw "vsce is not installed!";
command -v awk >/dev/null || throw "awk is not installed!";

get_pkg_field() { node -e 'console.log(require("./package.json").'"$1"')'; }
publish() {
    pushd -- "$PROJECT_DIR" >/dev/null || throw "failed to go to the project directory";

    PKG_NAME="$(get_pkg_field name)";
    PKG_VERSION="$(get_pkg_field version)";
    PKG_PUBLISHER="$(get_pkg_field publisher)";
    [ -z "$PKG_NAME" ] && throw 'failed to get name from package.json';
    [ -z "$PKG_VERSION" ] && throw 'failed to get version from package.json';
    [ -z "$PKG_PUBLISHER" ] && throw 'failed to get publisher from package.json';

    PKG_ID="${PKG_PUBLISHER}.${PKG_NAME}";
    printf -- "publish context:\n";
    printf -- "- PKG_ID: %s\n" "$PKG_ID";
    printf -- "- PKG_VERSION: %s\n" "$PKG_VERSION";

    echo "$ $VSCE show $PKG_ID";
    [ -f "$TEMP_INFO_FILE" ] && execute rm -- "$TEMP_INFO_FILE";
    "$VSCE" show "$PKG_ID" | tee "$TEMP_INFO_FILE";

    LATEST_VERSION="$(awk '/Version:/ {print $2}' "$TEMP_INFO_FILE")";
    printf -- "- LATEST_VERSION: %s\n" "$LATEST_VERSION";
    if [ "$LATEST_VERSION" == "$PKG_VERSION" ]; then
        echo "+ skip: already published";
        return 0;
    fi

    export VSCE_PAT="$VSCE_PAT"
    execute "$VSCE" verify-pat "$PKG_PUBLISHER";
    execute "$VSCE" publish "${@}" "$PKG_VERSION";
    echo "+ published";
}

if [ "$1" == "publish" ]; then
    shift;
    publish "${@}";
    exit "$?";
fi
execute "$VSCE" "${@}";
#endregion main
