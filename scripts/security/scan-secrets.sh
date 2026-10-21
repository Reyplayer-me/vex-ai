#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
scanner="${GITLEAKS_BIN:-gitleaks}"
scratch="$(mktemp -d)"
trap 'rm -rf "$scratch"' EXIT
status=0

# Do not expose raw scanner logs, source excerpts, or credential-bearing reports.
# Ignored comments cannot suppress findings; no baseline is used.
for mode in git dir; do
  options=()
  if [[ "$mode" == git ]]; then options+=(--log-opts=--all); fi
  if "$scanner" "$mode" "$root" "${options[@]}" \
    --config "$root/.gitleaks.toml" --redact=100 --no-banner \
    --ignore-gitleaks-allow --gitleaks-ignore-path "$scratch" \
    --report-format json --report-path "$scratch/$mode.json" \
    >"$scratch/$mode.log" 2>&1; then
    echo "Credential scan ($mode): passed."
  else
    echo "Credential scan ($mode): blocked. Review securely and remove/rotate leaked credentials; scanner failures also block."
    status=1
  fi
done
exit "$status"