#!/usr/bin/env bash
set -euo pipefail

if [[ ${CI:-} == "true" ]]; then
  echo "publish.sh: refusing to run inside CI. Run this script locally." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
WORKTREE_DIR="$ROOT_DIR/.publish-gh-pages"
PUBLISH_BRANCH="${PUBLISH_BRANCH:-gh-pages}"
COMMIT_MESSAGE="${PUBLISH_COMMIT_MESSAGE:-chore: publish docs}" 

cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "publish.sh: npm is required but was not found in PATH." >&2
  exit 1
fi

npm run build

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "publish.sh: script must be run inside a Git repository." >&2
  exit 1
fi

if ! git ls-remote --exit-code --heads origin "$PUBLISH_BRANCH" >/dev/null 2>&1; then
  cat >&2 <<MSG
publish.sh: could not find remote branch '$PUBLISH_BRANCH'.
Ensure the GitHub Pages branch exists and try again.
MSG
  exit 1
fi

git fetch origin "$PUBLISH_BRANCH"

if git worktree list --porcelain | grep -q "$WORKTREE_DIR"; then
  git worktree remove "$WORKTREE_DIR" --force
fi

if git show-ref --verify --quiet "refs/heads/$PUBLISH_BRANCH"; then
  git branch -f "$PUBLISH_BRANCH" "origin/$PUBLISH_BRANCH"
else
  git branch "$PUBLISH_BRANCH" "origin/$PUBLISH_BRANCH"
fi

git worktree add "$WORKTREE_DIR" "$PUBLISH_BRANCH"
trap 'git worktree remove "$WORKTREE_DIR" --force' EXIT

rm -rf "$WORKTREE_DIR"/*
cp -R "$DIST_DIR"/. "$WORKTREE_DIR"/

pushd "$WORKTREE_DIR" >/dev/null

git add --all
if git diff --quiet --cached; then
  echo "publish.sh: no changes to publish."
else
  git commit -m "$COMMIT_MESSAGE"
  git push origin "$PUBLISH_BRANCH"
  echo "publish.sh: published updated docs to '$PUBLISH_BRANCH'."
fi

popd >/dev/null
