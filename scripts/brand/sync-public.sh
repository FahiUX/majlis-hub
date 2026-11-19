#!/usr/bin/env sh
# Copy approved brand files from preview/logos/final/ into public/brand/ byte-for-byte,
# then prove each copy matches LOGO.sha256. Never edit public/brand/ by hand; re-run this.
#   sh scripts/brand/sync-public.sh            copy + verify
#   sh scripts/brand/sync-public.sh --check    verify only (pre-commit hook + CI)
#   sh scripts/brand/sync-public.sh --check DIR   verify a checkout at DIR (used by the hook)
set -e
ROOT="${2:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$ROOT"
F=preview/logos/final; D=public/brand
FILES="svg/weev-wordmark.svg svg/weev-wordmark-white.svg svg/weev-w-mark.svg svg/weev-w-mark-white.svg
png/weev-tempa.png favicon/favicon.svg favicon/favicon.ico favicon/favicon-32.png
app-icons/web/apple-touch-icon.png app-icons/web/icon-192.png app-icons/web/icon-512.png
animation/weev-logo-animation-1080p.mp4"

[ "$1" = "--check" ] || mkdir -p "$D"
n=0
for f in $FILES; do
  out="$D/$(basename "$f")"
  [ "$1" = "--check" ] || cp "$F/$f" "$out"
  want=$(tr -d '\r' < docs/brand/LOGO.sha256 | grep -F " *$f" | cut -d' ' -f1)
  got=$(sha256sum "$out" 2>/dev/null | cut -d' ' -f1)
  [ -n "$want" ] && [ "$want" = "$got" ] || { echo "🔒 public/brand MISMATCH: $out is not the approved $F/$f (re-run scripts/brand/sync-public.sh)"; exit 1; }
  n=$((n+1))
done
# nothing else may live in public/brand/ (no unapproved artwork)
extra=$(ls "$D" | while read -r x; do echo "$FILES" | tr ' ' '\n' | grep -q "/$x\$" || echo "$x"; done)
[ -z "$extra" ] || { echo "🔒 public/brand has files that are not approved copies: $extra"; exit 1; }
echo "public/brand: $n files, all match LOGO.sha256"
