#!/usr/bin/env bash

#region config
BUILD=( yarn run build:ts );
PATH_REWRITE_FROM=src
PATH_REWRITE_TO=out
EXTRA_NODE_ARGS=( --enable-source-maps ) # --inspect
#endregion config


#region main
# template:    ts.sh
# version:     2024-03-07
# description: Build (npm/yarn build) and execute TypeScript file
RED="\x1b[31m";BLUE="\x1b[34m";RESET="\x1b[0m";
usage() {
  local bin; bin="$(basename "${BASH_SOURCE[0]}")";
  echo "";
  echo "  Usage: $bin [...node-args] <ts-file> [...args]";
  echo "";
  exit 0;
}

throw() { echo -e "${RED}fatal: ${1}${RESET}" >&2; exit 1; }
execute() {
  printf "${BLUE}\$${RESET} %s\n" "${*}";
  if [ "$1" == "pushd" ] || [ "$1" == "popd" ]; then
    "${@}" >/dev/null || throw "failed to execute '$1'";
  else
    "${@}" || throw "failed to execute '$1'";
  fi
}
getJsPathFromTs() {
  local envs;
  envs=(
    PATH_REWRITE_FROM="$PATH_REWRITE_FROM"
    PATH_REWRITE_TO="$PATH_REWRITE_TO"
    PATH_REWRITE="$1"
  )
  env "${envs[@]}" node -e '
    const from = process.env.PATH_REWRITE_FROM + "/";
    const to   = process.env.PATH_REWRITE_TO + "/";
    const path = process.env.PATH_REWRITE
      .replace(/\.\w+$/, "")
      .replace(from, to);
    console.log(path);
  ';
}

# check environment
command -v node >/dev/null || throw "node is not installed!";

# test config
if [ "${#BUILD[@]}" -eq 0 ]; then
    # `$NPM` existed in old config
    if [ -z "$NPM" ]; then
        command -v yarn >/dev/null && NPM=yarn || NPM=npm;
    fi
    BUILD=( "$NPM" --silent run build );
fi

tsFile=
tsArgs=()
nodeArgs=()
argForNode=1
for arg in "$@"; do
  if test -n "$argForNode"; then
    if [[ "${arg}" == "--" ]]; then     argForNode=;
    elif [[ "${arg}" == "--"* ]]; then  nodeArgs+=("${arg}");
    elif [[ "${arg}" == inspect ]] && [[ "${#nodeArgs[@]}" -eq 0 ]]; then
      nodeArgs+=("${arg}");
    else
      argForNode=;
      tsFile="${arg}";
    fi
    continue;
  fi
  if test -z "$tsFile"; then
    tsFile="$arg";
  else
    tsArgs+=("$arg");
  fi
done
[[ "${#EXTRA_NODE_ARGS[@]}" -gt 0 ]] && nodeArgs+=( "${EXTRA_NODE_ARGS[@]}" );

test -n "$tsFile" || usage;
test -f "$tsFile" || throw "'$tsFile' is not a file";

pkgDir="$(dirname "$tsFile")";
pkgJSON=;
while test -z "$pkgJSON"; do
  _pkgJSON="${pkgDir}/package.json";
  if test -f "$_pkgJSON"; then
    pkgJSON="$_pkgJSON";
    break;
  fi
  _pkgDir="$(dirname "$pkgDir")";
  [ "$_pkgDir" == "$pkgDir" ] && break;
  pkgDir="$_pkgDir";
done
test -n "$pkgJSON" || throw "the project file of the '$tsFile' can't be found";

jsFile="$(getJsPathFromTs "$tsFile")";
test -n "$jsFile" || throw "failed to get js file path";

execute pushd "$pkgDir";
execute "${BUILD[@]}";
execute popd;
execute node "${nodeArgs[@]}" "$jsFile" "${tsArgs[@]}";
#endregion main
