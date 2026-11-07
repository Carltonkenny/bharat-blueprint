# 03 Manifest spec: the files that describe an episode

Three authored data files replace the hand-edited parts of `timing.js` and `film.js`. JSON Schemas for each go in `_shared/schemas/`. All files UTF-8, LF, 2-space indent, keys in the order shown.

## `episode.json`
```json
{
  "schema": 1,
  "series": "S01",
  "seriesName": "The Machines That Protect India",
  "episode": 4,
  "slug": "How-A-Missile-Finds-Its-Target",
  "compositionId": "machines-ep04",
  "pageTitle": "The Machines That Protect India: Episode 4: How a Missile Finds Its Target",
  "timing": { "target": 293, "wps": 2.69, "leadIn": 0.8, "tailAfterQuestion": 1.4, "titleHold": 4.2, "minGap": 0.35 },
  "clipPrefix": "f",
  "voice": { "id": "htZQqY7WtacRNV7s62Iy", "model": "eleven_v4", "tempo": 1.12 },
  "scenes": [
    { "n": 1, "slot": "QUESTION",       "label": "THE QUESTION" },
    { "n": 2, "slot": "WHY_IT_MATTERS", "label": "WHY IT MATTERS" },
    { "n": 3, "slot": "IDEA",           "label": "IDEA 1 · SENSE" },
    { "n": 4, "slot": "IDEA",           "label": "IDEA 2 · DECIDE" },
    { "n": 5, "slot": "IDEA",           "label": "IDEA 3 · STEER" },
    { "n": 6, "slot": "INDIA",          "label": "INDIA" },
    { "n": 7, "slot": "FIELD",          "label": "THE FIELD" },
    { "n": 8, "slot": "WHAT_IF",        "label": "WHAT IF" },
    { "n": 9, "slot": "HABIT",          "label": "THE HABIT" },
    { "n": 10, "slot": "CLOSE",         "label": "THE CLOSE" }
  ],
  "sound": { "stampRole": "stamp-fiction", "titleRole": "title" },
  "sourcesLedger": "sources/LEDGER.md"
}
```
Rules:
- `episode` + `series` + `slug` must match the folder name (`E04_How-A-Missile-Finds-Its-Target`) and `series.json`.
- `clipPrefix` is one lower-case letter, unique across the series. Existing: Ep2 `d`, Ep3 `e`, Ep4 `f`, Ep5 `g`. Next free for new episodes is assigned by `bb new` (never copied).
- `scenes[].slot` is from the closed set: `QUESTION, WHY_IT_MATTERS, IDEA, INDIA, FIELD, WHAT_IF, HABIT, CLOSE` (required slots) plus `EXTRA` (optional slots such as THE MARUT, SUNK COST, THE LONG BUILD, PLANNING, THE NUMBERS). Order must be: QUESTION first, CLOSE last, WHY_IT_MATTERS second, exactly three `IDEA` scenes, `INDIA` after the ideas, `WHAT_IF` after `FIELD`, `HABIT` before `CLOSE`; `EXTRA` anywhere between WHY_IT_MATTERS and CLOSE. The `label` text is free (this is today's `SCENE_NAMES`).
- The HUD label `EPnn` is `"EP" + zeroPad(episode, 2)`; `SC.n · label` uses `scenes`. Nothing else may contain these strings.
- `timing.*` values default to the numbers above when omitted.

## `script.json`
```json
{
  "schema": 1,
  "clips": [
    { "id": "f01", "scene": 1, "text": "We believe a missile is something a country simply buys.", "gap": 1 },
    { "id": "f04", "scene": 1, "text": "How does a missile find its target?", "gap": 2, "role": "question" },
    { "id": "f24", "scene": 6, "text": "What it cannot yet do is finish the shield. Mission Sudarshan Chakra, announced in August twenty twenty-five, aims at a national security shield by twenty thirty-five.", "gap": 1.5, "role": "cannot-yet" },
    { "id": "f31", "scene": 8, "text": "A fictional afternoon: a radar screen shows a dot where no dot should be.", "gap": 1.2, "role": "stamp-fiction" },
    { "id": "f42", "scene": 10, "text": "India built the missiles. Now the question is the chain: which link will be finished last?", "gap": 0, "role": "callback-close" }
  ]
}
```
(The real file lists all 42 clips; this shows the shape.) Each clip is `{ id, scene, text, gap, role? }`.
- `id` = `clipPrefix` + two digits, sequential from 01, no gaps. `scene` must exist in `episode.json` and scenes must be non-decreasing.
- `text` is exactly what the voice says (numbers spelled out as spoken). Concatenated clip text equals the concatenated passages in `narration/voice-plan.json` (gate G2).
- `gap` is today's gap weight in seconds before rescale (0 only for the last clip).
- `role` is optional, from: `question` (last clip of scene 1), `cannot-yet` (in the INDIA scene), `stamp-fiction` (first clip of the WHAT_IF scene), `callback-close` (last clip), `sourced-number` (a clip that speaks the on-screen sourced number; at least one), `title` is not a clip role (it is the final beat). Roles carry the theme gates (G6) and replace hard-coded sound-cue clip ids.

## `beats.json`
```json
{
  "schema": 1,
  "beats": [
    { "id": "1.1", "anchor": "start", "frac": 0.7 },
    { "id": "1.2", "anchor": "f02", "tr": "fade", "d": 0.5 },
    { "id": "2.1", "anchor": "f05", "tr": "wipe", "d": 0.9 },
    { "id": "7.1", "anchor": "f26", "tr": "wipe", "d": 0.9,
      "keys": [["f26", 0, 0], ["f27", 0, 0.2], ["f28", 0, 0.45], ["f29", 0, 0.7], ["f29", "0.8*dur", 1]] },
    { "id": "10.3", "anchor": "title", "tr": "fade", "d": 0.6, "frac": 0.5 }
  ]
}
```
- `anchor`: a clip id, `"start"` (t = 0) or `"title"` (`TITLE_AT`). `tr`: `"fade"` or `"wipe"`, absent only for the first beat. `d`, `frac` as today (`frac` defaults 0.75).
- `keys`: list of `[clipId, offsetSeconds, progress]`; the offset may be the string `"<k>*dur"` meaning k times that clip's duration (today's `D('f29') * 0.8`). Evaluate with the same arithmetic as today's `film.js`.
- Beat id `S.P`: `S` is a scene number in `episode.json`, `P` a 1-based panel index within the scene; beats are ordered; each scene has at least one beat; the first beat of every scene after scene 1 uses `wipe`; the last beat is `anchor: "title"`.
- Every beat id must have an entry in `panels.js` `PANELS[...]` and vice versa (gate G5).

## `panels.js` (authored)
Unchanged contract from today: `PANELS['S.P'] = { draw(ix, p), cam?(pc) }`, written against `BP`, `objects`, `motion`, `vehicles`, `kit`. Headlines at least 44 px, labels at least 28 px. Leaders and links attach to anchors; nothing positioned by hand. Optional `PANELS_META['S.P'] = { numbers: [...], source: "SOURCE: PIB" }` declares on-screen sourced numbers for gate G7.

## `narration/voice-plan.json` (authored text, existing format kept)
Unchanged keys: `voice, model, tempo, status, words, passages, estimatedCredits, takesPerPassage, passagesDetail`. The `bb` tools read it; they never rewrite a passage that already has a raw take.

## `series.json`
```json
{ "schema": 1, "series": "S01", "name": "The Machines That Protect India", "playlist": "The Machines That Protect India",
  "episodes": [ { "episode": 2, "slug": "The-Fighter-Engine", "clipPrefix": "d" } ] }
```
The registry that makes clip prefixes unique and episode numbers sequential.

## Equivalence requirement
For a migrated episode, the data files plus kit core must reproduce the old `timing.js` and `film.js` results exactly: same `TIMING.clips` (id, start, dur), same `BEATS` (id, t0, t1, tr, d, frac, keys evaluated), same `DURATION`. Test T2 compares these and the rendered frames.
