#!/usr/bin/env bash
#
# Runs the request-api-client test suite across the Node versions used by CI,
# optionally toggling Vitest coverage output.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

NODE_MATRIX_DEFAULT=("20" "22" "24" "25")

NODE_MATRIX_ENV="${NODE_MATRIX:-}"
declare -a NODE_MATRIX
if [[ -n "$NODE_MATRIX_ENV" ]]; then
  read -r -a NODE_MATRIX <<<"$NODE_MATRIX_ENV"
else
  NODE_MATRIX=("${NODE_MATRIX_DEFAULT[@]}")
fi

NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "❌ nvm is required to run the matrix tests (missing $NVM_DIR/nvm.sh)." >&2
  echo "   Install nvm or adjust NODE_MATRIX to an empty value to skip the run." >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$NVM_DIR/nvm.sh"

if ! command -v nvm >/dev/null 2>&1; then
  echo "❌ nvm is not available on PATH even after initialization." >&2
  exit 1
fi

if ((${#NODE_MATRIX[@]} == 0)); then
  echo "⚠️  NODE_MATRIX is empty; skipping multi-version suite run."
  exit 0
fi

cd "$PACKAGE_DIR"

MODE_ARG="${1:-test}"
case "$MODE_ARG" in
  test|coverage) ;;
  *)
    echo "❌ Unknown matrix mode '${MODE_ARG}'. Expected 'test' or 'coverage'." >&2
    exit 1
    ;;
esac

PNPM_SCRIPT="$MODE_ARG"

echo "🧪 Running request-api-client ${PNPM_SCRIPT} suite across Node versions: ${NODE_MATRIX[*]}"

FAILED=0
for version in "${NODE_MATRIX[@]}"; do
  resolved="$(nvm version "$version" 2>/dev/null || true)"
  if [[ "$resolved" == "N/A" ]]; then
    echo "❌ Node ${version} is not installed via nvm. Install it and retry." >&2
    FAILED=1
    break
  fi

  echo ""
  echo "=== 🚀 Node ${version} (resolved: ${resolved}) — pnpm run ${PNPM_SCRIPT} ==="
  if ! PNPM_WORKSPACE_ROOT="$REPO_ROOT" nvm exec "$resolved" pnpm run "$PNPM_SCRIPT"; then
    echo "❌ Matrix run failed under Node ${resolved} (${PNPM_SCRIPT} suite)." >&2
    FAILED=1
    break
  fi
done

if [[ $FAILED -eq 0 ]]; then
  echo ""
  echo "✅ Matrix ${PNPM_SCRIPT} suite succeeded for request-api-client."
else
  echo ""
  echo "❌ Matrix ${PNPM_SCRIPT} suite failed."
fi

exit "$FAILED"
