#!/usr/bin/env bash
# Publish dflb/ to the gh-pages branch of maxcpost/dflb-fresh, previewed at
#   https://maxcpost.github.io/dflb-fresh/
#
# Stages a copy with the /dflb-fresh/ subpath prefix inserted into
# root-relative URLs, and injects a noindex meta into every page so the
# preview never competes with dudsforlovebugs.com in search.
#
# Usage: ./publish-dflb-preview.sh
set -euo pipefail

PREFIX="/dflb-fresh"
REMOTE="https://github.com/maxcpost/dflb-fresh.git"
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

STAGE="$(mktemp -d)"
CLONE="$(mktemp -d)"
cleanup() { rm -rf "$STAGE" "$CLONE"; }
trap cleanup EXIT

cp -R "$REPO_ROOT/dflb/." "$STAGE/"
touch "$STAGE/.nojekyll"

# Prefix root-relative href/src values (absolute and fragment links are
# untouched) and add the preview-only noindex right after the viewport meta.
find "$STAGE" -name '*.html' -print0 | xargs -0 sed -i '' -E \
  -e "s|(href=\")/([a-z0-9])|\1$PREFIX/\2|g" \
  -e "s|(src=\")/([a-z0-9])|\1$PREFIX/\2|g" \
  -e "s|href=\"/\"|href=\"$PREFIX/\"|g" \
  -e "s|(<meta name=\"viewport\"[^>]*>)|\1\\
  <meta name=\"robots\" content=\"noindex\">|"

git clone --depth 1 --branch gh-pages "$REMOTE" "$CLONE"
find "$CLONE" -mindepth 1 -maxdepth 1 -not -name .git -exec rm -rf {} +
cp -R "$STAGE/." "$CLONE/"
git -C "$CLONE" add -A
if git -C "$CLONE" diff --cached --quiet; then
  echo "gh-pages already up to date."
else
  git -C "$CLONE" commit -m "Publish dflb preview ($(git -C "$REPO_ROOT" rev-parse --short HEAD))"
  git -C "$CLONE" push origin gh-pages
fi
echo "Preview: https://maxcpost.github.io${PREFIX}/"
