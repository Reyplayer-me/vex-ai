#!/usr/bin/env bash
set -euo pipefail

destination="${1:?Provide an installation directory}"
mkdir -p "$destination"
archive="$(mktemp)"
trap 'rm -f "$archive"' EXIT
curl --fail --silent --show-error --location \
  https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz \
  --output "$archive"
printf '%s  %s\n' '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb' "$archive" | sha256sum --check --status
tar -xzf "$archive" -C "$destination" gitleaks