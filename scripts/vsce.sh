#!/usr/bin/env bash

#region config
PROJECT_ROOT=".."
ARTIFACT_DIR="../artifacts/vscode"
# ARTIFACT_DIR_NPM="../artifacts/npm";
# VSCE_PAT="$OTHE_ENV_VAR"
PREBUILD() { execute yarn build; }
INIT_EXTRA_FILES() { execute cp -- docs/CHANGELOG.md CHANGELOG.md; }
CLEAN_EXTRA_FILES() { execute rm -- CHANGELOG.md; }
VSCE_EXTRA_ARGS=( --no-yarn ); # VSCE doesn't yarn v2
#endregion config

#region main
#
# template: vsce.sh
#   author: hangxingliu
#  version: 2025-01-08
#     desc: A script for bundling extension file and publishing to the marketplace
#
throw() { echo -e "fatal: $1" >&2; exit 1; }
print_cmd() { printf "\$ %s\n" "$*"; }
execute() { print_cmd "$@"; "$@" || throw "Failed to execute '$1'"; }
gotodir() { pushd -- "$1" >/dev/null || throw "failed to go to '$1'"; }
goback() { popd >/dev/null || throw "failed to execute 'popd'"; }
has_function() { [[ "$(type -t "$1")" == "function" ]]; }
is_array() { declare -p "$1" 2> /dev/null | grep -q '^declare \-a'; }

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )";
PROJECT_DIR="${SCRIPT_DIR}/${PROJECT_ROOT}";
TEMP_INFO_FILE="${PROJECT_DIR}/.vsce-show.log";

VSCE="$(command -v vsce)";
[ -z "$VSCE" ] && VSCE="${PROJECT_DIR}/node_modules/.bin/vsce";
[ -x "$VSCE" ] || throw "vsce is not installed!";

# open-vsx.org
# https://github.com/eclipse/openvsx/wiki/Publishing-Extensions
OVSX="$(command -v ovsx)";
[ -z "$OVSX" ] && OVSX="${PROJECT_DIR}/node_modules/.bin/ovsx";
[ -x "$OVSX" ] || OVSX="";

command -v awk >/dev/null || throw "awk is not installed!";
command -v node >/dev/null || throw "Node.js is not installed!";

PKG_NAME=            # example: test-extension
PKG_VERSION=         # example: 1.0.0
PKG_PUBLISHER=       # example: hangxingliu
PKG_ID=              # example: hangxingliu.test-extension
PKG_FULL_NAME=       # example: test-extension-1.0.0
UPSTREAM_VERSION=    # example: 1.0.0

CYAN="\x1b[36m";
RESET="\x1b[0m";

_get_field() { node -e 'console.log(require("./package.json").'"$1"')'; }
_throw_field() { throw "failed to get '$1' from the package.json"; }
init_pkg_fields() {
    PKG_NAME="$(_get_field name)";
    PKG_VERSION="$(_get_field version)";
    PKG_PUBLISHER="$(_get_field publisher)";

    [ -z "$PKG_NAME" ] && _throw_field 'name';
    [ -z "$PKG_VERSION" ] && _throw_field 'version';
    [ -z "$PKG_PUBLISHER" ] && _throw_field 'publisher';

    PKG_ID="${PKG_PUBLISHER}.${PKG_NAME}";
    PKG_FULL_NAME="${PKG_NAME}-${PKG_VERSION}";
}
# dump_pkg_fields "build"|"publish"
dump_pkg_fields() {
    printf -- "%s context:\n" "$1";
    printf -- "- PKG_ID: ${CYAN}%s${RESET}\n" "$PKG_ID";
    printf -- "- PKG: ${CYAN}%s${RESET}\n" "$PKG_FULL_NAME";
}
# shellcheck disable=SC2120
get_upstream_version() {
    local mode="$1";
    [ -f "$TEMP_INFO_FILE" ] && execute rm -- "$TEMP_INFO_FILE";
    if [ "$mode" == ovsx ]; then
        echo "$ $OVSX get --metadata $PKG_ID";
        "$OVSX" get --metadata "$PKG_ID" > "$TEMP_INFO_FILE";
        UPSTREAM_VERSION="$(
            awk '/"version":/ {gsub(/[",]/, "", $2); print $2;exit;}' "$TEMP_INFO_FILE")";
    else
        echo "$ $VSCE show $PKG_ID";
        "$VSCE" show "$PKG_ID" | tee "$TEMP_INFO_FILE";
        UPSTREAM_VERSION="$(
            awk '/Version:/ {print $2;exit;}' "$TEMP_INFO_FILE")";
    fi

    printf -- "- LATEST_VERSION: ${CYAN}%s${RESET}\n" "$UPSTREAM_VERSION";
}

do_build_vsix() {
    gotodir "$SCRIPT_DIR";
    execute mkdir -p "$ARTIFACT_DIR";

    gotodir "$ARTIFACT_DIR";
    ARTIFACT_DIR="$(pwd)";
    goback;
    if [ -n "$ARTIFACT_DIR_NPM" ]; then
        execute mkdir -p "$ARTIFACT_DIR_NPM";
        gotodir "$ARTIFACT_DIR_NPM";
        ARTIFACT_DIR_NPM="$(pwd)";
        goback;
    fi

    gotodir "$PROJECT_DIR";

    init_pkg_fields;
    dump_pkg_fields build;
    has_function "INIT_EXTRA_FILES" && INIT_EXTRA_FILES;
    has_function "CLEAN_EXTRA_FILES" && trap CLEAN_EXTRA_FILES EXIT;
    has_function "PREBUILD" && PREBUILD;

    local list_file vsix_file npm_tgz_file;
    if [ -n "$ARTIFACT_DIR_NPM" ]; then
        list_file="${ARTIFACT_DIR_NPM}/${PKG_FULL_NAME}.list";
        npm_tgz_file="${ARTIFACT_DIR_NPM}/${PKG_FULL_NAME}.tgz";

        echo "$ npm pack --dryrun | tee $list_file";
        npm pack --dryrun 2>&1 | sed 's/npm notice//' | tee "$list_file";
        execute npm pack;
        execute mv -f "${PKG_FULL_NAME}.tgz" "$npm_tgz_file";
    fi

    list_file="${ARTIFACT_DIR}/${PKG_FULL_NAME}.list";
    vsix_file="${ARTIFACT_DIR}/${PKG_FULL_NAME}.vsix";

    is_array VSCE_EXTRA_ARGS || VSCE_EXTRA_ARGS=();

    echo "$ vsce ls ${VSCE_EXTRA_ARGS[*]} | tee $list_file";
    "$VSCE" ls "${VSCE_EXTRA_ARGS[@]}" |
        awk '!/Detected presence of yarn.lock/' | tee "$list_file";

    execute "$VSCE" package "${VSCE_EXTRA_ARGS[@]}" --out "${vsix_file}" "${@}";
    printf "+ created ${CYAN}%s${RESET}\n" "$vsix_file";
}

do_publish() {
    mode="$1";
    gotodir "$PROJECT_DIR";

    init_pkg_fields;
    dump_pkg_fields publish;
    get_upstream_version "$mode";
    if [ "$UPSTREAM_VERSION" == "$PKG_VERSION" ]; then
        echo "+ failed: the version '$PKG_VERSION' has been already published";
        return 1;
    fi

    has_function "PREBUILD" && PREBUILD;

    if [ "$mode" == ovsx ]; then
        # https://github.com/eclipse/openvsx/wiki/Publishing-Extensions;
        local vsix_file
        vsix_file="${ARTIFACT_DIR}/${PKG_FULL_NAME}.vsix";
        [ -f "$vsix_file" ] || throw "The vsix file $vsix_file is missing";

        [ -n "$OVSX_PAT" ] || throw "The required \$OVSX_PAT env variable is missing";

        print_cmd "$OVSX" verify-pat -p '****' "$PKG_PUBLISHER";
        "$OVSX" verify-pat -p "$OVSX_PAT" "$PKG_PUBLISHER" || throw "Invalid OVSX_PAT";

        print_cmd "$OVSX" publish "$vsix_file" -p '****';
        "$OVSX" publish "$vsix_file" -p "$OVSX_PAT" || throw "Failed to publish to open-vsx.org";
    else
        export VSCE_PAT="$VSCE_PAT"
        execute "$VSCE" verify-pat "$PKG_PUBLISHER";
        execute "$VSCE" publish --yarn "${@}" "$PKG_VERSION";
        printf "+ published ${CYAN}%s${RESET}\n" "$PKG_FULL_NAME";
    fi
}

do_get_upstream() {
    gotodir "$PROJECT_DIR";

    init_pkg_fields;
    dump_pkg_fields publish;
    get_upstream_version;
    [ -n "$OVSX" ] && get_upstream_version ovsx;
}

case "$1" in
    publish)
        shift;
        do_publish vsce "${@}";;
    publish-ovsx)
        shift;
        do_build_vsix;
        do_publish ovsx "${@}";;
    vsix|build-vsix-and-list)
        shift;
        do_build_vsix "${@}";;
    get)
        shift;
        do_get_upstream;;
    --)
        shift;
        execute "$VSCE" "${@}";;
    *)
        execute "$VSCE" "${@}";;
esac
#endregion main
