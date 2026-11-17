#!/usr/bin/env bash
# Fails if any Flick embed wrapper or the set of Flick ids differs from locks/flick-tags.lock.
# To change a Flick tag on purpose: make the change, run `locks/verify.sh --print > locks/flick-tags.lock`, and get Ari's approval.
set -euo pipefail
cd "$(dirname "$0")/.."
state() {
  sha256sum instagram/flick-frame.html meta/flick-frame.html source/instagram/public/flick-frame.html source/meta/public/flick-frame.html
  for app in instagram meta; do
    echo "ids $app: $(grep -oh 'flickId: "[a-z0-9]*"' source/$app/src/data/feed.ts | sort -u | cut -d'"' -f2 | tr '\n' ' ')"
    echo "tags $app: $(grep -oh "https://[a-z0-9.-]*/[A-Za-z0-9_'+/ ]*ad\.js" source/$app/public/flick-frame.html | sort -u | tr '\n' ' ')"
  done
}
if [ "${1:-}" = "--print" ]; then state; exit 0; fi
if diff <(state) locks/flick-tags.lock; then echo "Flick tags match the lock."; else echo "FLICK TAGS CHANGED: the embed wrapper or Flick ids differ from locks/flick-tags.lock" >&2; exit 1; fi
