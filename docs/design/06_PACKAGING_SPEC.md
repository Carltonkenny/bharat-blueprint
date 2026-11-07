# 06 Packaging spec: thumbnails, titles, descriptions, tags

This is the second reusable template (the first is the film). It was done by hand for S01 on 2026-11-05/06; this spec captures what worked and what failed so it can be repeated. Current hand-made assets: `S01_*/upload/build_thumbnails.mjs`, `build_thumbnails_v2.mjs`, `UPLOAD_PACKAGE.md`, `UPLOAD_READY_E02-E05.md`.

## Inputs per episode: `packaging/packaging.json` (authored, small)
```json
{
  "schema": 1,
  "keyword": { "primary": "how a jet engine works", "related": ["fighter jet engine", "jet engine animation"], "source": "vidiq 2026-11-06", "volume": 27491, "competition": 38 },
  "titleHook": "Why India Still Chases Its Own Fighter Engine",
  "thumbnail": {
    "frame": { "t": 107, "reason": "engine glows; gas bar exceeds metal limit" },
    "headline": [ { "text": "HOTTER THAN", "style": "white" }, { "text": "MELTING", "style": "red-box" } ],
    "zoom": 1.2, "shift": [-110, -20], "glow": [766, 450],
    "mark": { "type": "ellipse", "cx": 766, "cy": 448, "rx": 222, "ry": 74 },
    "hookCheck": { "question": "Does the text say what the video is about?", "answer": "yes", "by": "human", "date": "2026-11-06" }
  },
  "hashtags": ["#howitworks", "#jetengine", "#IndianDefence"],
  "pinnedComment": "..."
}
```
Frame `t` is chosen by a human from the contact sheet that `bb package --frames` writes (candidate frames at the end of each beat, mid-transition frames excluded). The scene labels, ledger and script are read for the description.

## Thumbnail builder (generalise `build_thumbnails_v2.mjs`)
- Output 1280x720 PNG under 2 MB (currently about 0.9 MB), written to `packaging/thumbnail.png`; also a 160 px preview `packaging/thumbnail-160.png`.
- Look (fixed, from the posted S01 v2): brightened and contrast-boosted film frame, cyan edge glow, orange/red radial glow behind the hero, vignette, headline in Impact with dark outline, one word on a red box, red episode badge top right (`EP n`), series tag top left, `BHARAT BLUEPRINT` bottom left, optional one-line sub. Red marker (ellipse or circle) around the hero.
- Right-edge shade hides stray film text. Headline left, hero right.
- Fonts: Impact or Arial Black on Windows; the builder must fail clearly if neither exists.
- **Rules learned the hard way:** (1) the headline must say what: "CANNOT YET" was rejected by the user because it did not say what; "HOTTER THAN MELTING" was accepted. (2) At most 4 words total and 22 characters per line. (3) Headline must come from the film itself (a spoken line, an on-screen number or beat), never a claim the film does not make. (4) No hype about a named rival or an attack ("INDIA UNDER ATTACK?" was used by the user on Ep1; it conflicts with the channel's rules and should not be generated). (5) Never use a mid-transition frame (double text).
- Gates T1: headline word count and length; hero luminance and headline contrast ratio at least 7:1 against the local background (sample the pixels behind the text); 160 px preview readable (OCR of the preview must recover the headline's longest word; skip if no OCR available and require human sign-off); file size; `hookCheck.answer == "yes"` with a human name and date.

## Title
- At most 70 characters; the primary keyword (exact phrase people type) in the first 40; then the hook. Pattern: `<primary keyword phrase>: <hook>` or `<Hook question>? <series/keyword phrase>`.
- Every number in the title must appear in the ledger or script. No rankings. No named hostile countries.
- Candidates (3) written to `packaging/titles.md` with VidIQ keyword volume and competition; the human picks one. Optional VidIQ title score may be stored but is not a gate (the scorer saturated at 91 to 96 for all five S01 titles).
- Keyword research is a human-approved step using VidIQ (research mode) and is saved to `packaging/keywords.json`; the CLI never calls VidIQ by itself (credits are limited).

## Description template (fill from script, scene labels, ledger)
```
{line1: the question, same words as the thumbnail}. {line2: one sentence on what the viewer will understand}. {optional: one sentence of everyday analogy list}

In this video:
• {one bullet per scene label, in plain words, taken from the script}
• What India can do, and what it cannot yet do, is stated in the film. A fictional scenario is clearly labelled.

THE MACHINES THAT PROTECT INDIA is a five-part series, drawn in code and narrated by an unseen observer.
Playlist: {playlist link, filled by the human}

Sources:
• {ledger rows tagged VERIFIED or PARTLY, as "<Owner> / PIB, <what>, <date>: <url>"; max 5}
{if any SECONDARY figure appears in the film: one line saying it is reported}

Concept level only. Narration is a synthetic voice. Animations are original illustrations made for this channel. Not affiliated with any government body.

{three hashtags}
```
Gate: every figure in the description (digits, ₹, %, years) must be found in the ledger or the script text; every source URL must be present in the ledger; description under 5,000 characters; first 150 characters contain the primary keyword.

## Tags
8 to 15 tags, lower case, comma separated, total under 450 characters; include the primary keyword, the related keywords, `how it works`, `engineering explained`, `bharat blueprint`, the series name. Never tags for a topic the film does not cover (S01 example: BrahMos has large search volume but Episode 4 does not cover it, so it is excluded).

## Pinned comment
One question for viewers plus "Sources are in the description." No claims beyond the film.

## Output of `bb package --run`
`packaging/thumbnail.png`, `thumbnail-160.png`, `titles.md`, `description.txt`, `tags.txt`, `pinned-comment.txt`, `UPLOAD_READY.md` (everything above in copy-paste blocks, with `[paste ...]` placeholders for the playlist link and any unverified link), `packaging/report.md` (gates). It never uploads.

## Posting-side facts to keep in the checklist (not automated)
Answer YouTube's altered or synthetic content question honestly (synthetic narrator); open every source link once; check the thumbnail at about 160 px; the user clicks upload.
