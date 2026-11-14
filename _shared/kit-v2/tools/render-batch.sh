#!/bin/bash
# kit-v2: render episodes one after another (never in parallel), measure each against Series 1.
# usage: render-batch.sh <tag> <ep dir name> [<ep dir name> ...]
TAG=$1; shift
ROOT="C:/Users/user/OneDrive/Desktop/films and ads/BHARAT-BLUEPRINT"
HF="$LOCALAPPDATA/BharatBlueprint/render/S02/deps/node_modules/hyperframes/bin/hyperframes.mjs"
for d in "$@"; do
  n=${d:0:3}; OUT="$LOCALAPPDATA/BharatBlueprint/render/S02/$n"; mkdir -p "$OUT"
  S=$(date +%s)
  cd "$ROOT/S02_DENIED-India-Built-It-Anyway/$d"
  node "$HF" render . -o "$OUT/$n-$TAG.mp4" -q standard -w 8 --no-browser-gpu --quiet > "$OUT/$TAG.log" 2>&1
  if [ ! -s "$OUT/$n-$TAG.mp4" ]; then
    node "$HF" render . -o "$OUT/$n-$TAG.mp4" -q standard -w 4 --no-browser-gpu --quiet >> "$OUT/$TAG.log" 2>&1
  fi
  E=$(date +%s)
  echo "$n render $((E-S)) s, file $(ls -la "$OUT/$n-$TAG.mp4" 2>/dev/null | awk '{print $5}')" >> "$LOCALAPPDATA/BharatBlueprint/render/S02/batch-$TAG.txt"
  if [ -s "$OUT/$n-$TAG.mp4" ]; then
    python "$ROOT/S02_DENIED-India-Built-It-Anyway/00_SERIES/tools/parity_check.py" "$OUT/$n-$TAG.mp4" --tmp "$OUT/par" --json "$OUT/$n-$TAG.parity.json" > /dev/null 2>&1
    echo "$n parity: $(tr -d '\n ' < "$OUT/$n-$TAG.parity.json")" >> "$LOCALAPPDATA/BharatBlueprint/render/S02/batch-$TAG.txt"
  fi
done
echo "BATCH DONE" >> "$LOCALAPPDATA/BharatBlueprint/render/S02/batch-$TAG.txt"
