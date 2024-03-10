#!/usr/bin/env bash

copy_files() {
    execute cp -- docs/CHANGELOG.md CHANGELOG.md;
}
clean_files() {
    execute rm -- CHANGELOG.md;
}

#
# Update: 2024-03-08
#
throw() { echo -e "fatal: $1" >&2; exit 1; }
execute() { echo "$ $*"; "$@" || throw "Failed to execute '$1'"; }
command -v jq >/dev/null || throw "jq is not installed! (https://jqlang.github.io/jq/)";

# change the current directory to the project directory
pushd "$( dirname -- "${BASH_SOURCE[0]}" )/.." >/dev/null || exit 1;

PKG="$(jq -r '.name+"-"+.version' ./package.json)";
TARGET_DIR="./artifacts/vscode";
LIST_FILE="./artifacts/vscode/${PKG}.list";
echo "PKG=${PKG}";

execute mkdir -p "$TARGET_DIR";

[[ "$(type -t "copy_files")" == "function" ]] && copy_files;
[[ "$(type -t "clean_files")" == "function" ]] && trap clean_files EXIT;

echo "$ ./scripts/vsce.sh ls | tee $LIST_FILE";
bash ./scripts/vsce.sh ls |
	awk '!/Detected presence of yarn.lock/' |
	tee "$LIST_FILE";

execute bash ./scripts/vsce.sh package --out "${TARGET_DIR}/${PKG}.vsix";
