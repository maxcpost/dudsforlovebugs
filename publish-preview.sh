#!/usr/bin/env bash
# Publish new-site/ to the gh-pages branch, previewed at
#   https://maxcpost.github.io/dudsforlovebugs/
#
# The site's internal URLs are root-relative (href="/consign/",
# src="/images/..."), which is correct for the production domain
# (dudsforlovebugs.com) but breaks on GitHub Pages, which serves this
# repo under the /dudsforlovebugs/ subpath. This script stages a copy
# with the subpath prefix inserted and pushes it to gh-pages.
#
# Usage: ./publish-preview.sh
set -euo pipefail

PREFIX="/dudsforlovebugs"
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

STAGE="$(mktemp -d)"
WORKTREE="$(mktemp -d -u)"
cleanup() {
  rm -rf "$STAGE"
  git -C "$REPO_ROOT" worktree remove --force "$WORKTREE" 2>/dev/null || true
}
trap cleanup EXIT

cp -R "$REPO_ROOT/new-site/." "$STAGE/"
rm -rf "$STAGE/node_modules" "$STAGE/package.json" "$STAGE/package-lock.json"
touch "$STAGE/.nojekyll"

# Prefix root-relative href/src values. Leaves absolute URLs
# (https://..., //cdn...) and fragment/relative links untouched.
find "$STAGE" -name '*.html' -print0 | xargs -0 sed -i '' -E \
  -e "s|(href=\")/([a-z0-9])|\1$PREFIX/\2|g" \
  -e "s|(src=\")/([a-z0-9])|\1$PREFIX/\2|g" \
  -e "s|href=\"/\"|href=\"$PREFIX/\"|g"

git -C "$REPO_ROOT" fetch origin gh-pages
git -C "$REPO_ROOT" worktree add -B gh-pages "$WORKTREE" origin/gh-pages
find "$WORKTREE" -mindepth 1 -maxdepth 1 -not -name .git -exec rm -rf {} +
cp -R "$STAGE/." "$WORKTREE/"
git -C "$WORKTREE" add -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "gh-pages already up to date."
else
  git -C "$WORKTREE" commit -m "Publish new-site preview ($(git -C "$REPO_ROOT" rev-parse --short HEAD))"
  git -C "$WORKTREE" push origin gh-pages
fi
echo "Preview: https://maxcpost.github.io${PREFIX}/"
