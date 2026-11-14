#!/bin/bash
# kit-v2 / S03: render, measure and mux episodes one after another (never in parallel).
# usage: s03-render-batch.sh <tag> <E01_Chenab-Bridge> [<E02_...> ...]
TAG=$1; shift
WS="C:/Users/user/OneDrive/Desktop/films and ads/BHARAT-BLUEPRINT"
ROOT="$WS/S03_India-Megaprojects"
K="$WS/_shared/kit-v2/tools"
HF="$LOCALAPPDATA/BharatBlueprint/render/S02/deps/node_modules/hyperframes/bin/hyperframes.mjs"
P="$WS/S02_DENIED-India-Built-It-Anyway/00_SERIES/tools/parity_check.py"
LOG="$ROOT/batch-$TAG.txt"
for d in "$@"; do
  n=${d:0:3}; slug=${d:4}
  OUT="$LOCALAPPDATA/BharatBlueprint/render/S03/$n"; mkdir -p "$OUT"
  cd "$ROOT/$d" || continue
  S=$(date +%s)
  node "$K/build-episode.mjs" . --size 1920x1080 --timing measured > /dev/null 2>&1
  node "$HF" render . -o "$OUT/$n-$TAG.mp4" -q standard -w 8 --no-browser-gpu --quiet > "$OUT/$TAG.log" 2>&1
  E=$(date +%s)
  if [ -s "$OUT/$n-$TAG.mp4" ]; then
    python "$P" "$OUT/$n-$TAG.mp4" --tmp "$OUT/par" --json "qc/parity_$TAG.json" > /dev/null 2>&1
    node "$K/s03-mux.mjs" . "$OUT/$n-$TAG.mp4" "Bharat-Blueprint_S03${n}_${slug}_JUPITER-VOICE.mp4" > /dev/null 2>&1
    node "$K/qc-frames.mjs" . "$OUT/$n-$TAG.mp4" --out qc > "qc/frames_$TAG.txt" 2>&1
    echo "$n render $((E-S)) s | parity $(tr -d '\n ' < qc/parity_$TAG.json | cut -c1-200) | $(tail -1 qc/frames_$TAG.txt)" >> "$LOG"
  else
    echo "$n render FAILED after $((E-S)) s" >> "$LOG"
  fi
done
echo "BATCH DONE $(date +%H:%M)" >> "$LOG"
