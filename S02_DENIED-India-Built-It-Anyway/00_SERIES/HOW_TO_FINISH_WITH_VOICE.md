# How to finish Series 2 with your voice

The six films are rendered and every gate passes, but they run on **estimated timing**
(words / 1.8 per second) and they have **no sound**. This page is the last step: record
your voice, and the pipeline re-times the film, re-renders it and muxes it in.

You do not need to render anything yourself. One command per episode does the lot.

---

## 1. Record the voice

Put the recording in the episode folder:

```
S02_DENIED-India-Built-It-Anyway/E01_Cryogenic-Engine/audio/voice/
```

Two ways, both supported:

**A. One file per passage (recommended).**
The passage ids and their order are in `passages.md` (`P01` ... `P10`).
Save each as `P01.wav`, `P02.wav`, ... `P10.wav`.
Read the text of each passage from `passages.md`; it is identical to `script.md`.
Leave a short gap (about 0.4 s) at the end of each file. The pipeline uses the silence
between the files to place the passage boundaries.

**B. One file for the whole narration.**
Save it as `full.wav`, in one continuous take that follows `passages.md` in order.
The pipeline finds the pauses between the passages by itself (silencedetect at -35 dB,
minimum 0.35 s) and proposes the boundaries for you to check.

Either way: **16-bit mono WAV at 44.1 or 48 kHz.** Do not add music or effects to the
voice file; the film adds its own sound bed later.

## 2. Run the finishing command

From the workspace root:

```
node _shared/kit-v2/tools/finalize-with-voice.mjs --episode S02_DENIED-India-Built-It-Anyway/E01_Cryogenic-Engine
```

For every episode:

```
node _shared/kit-v2/tools/finalize-with-voice.mjs --episode S02_DENIED-India-Built-It-Anyway/E02_PARAM-Supercomputer
node _shared/kit-v2/tools/finalize-with-voice.mjs --episode S02_DENIED-India-Built-It-Anyway/E03_NavIC-Signal
node _shared/kit-v2/tools/finalize-with-voice.mjs --episode S02_DENIED-India-Built-It-Anyway/E04_Three-Stage-Nuclear
node _shared/kit-v2/tools/finalize-with-voice.mjs --episode S02_DENIED-India-Built-It-Anyway/E05_Semiconductors
node _shared/kit-v2/tools/finalize-with-voice.mjs --episode S02_DENIED-India-Built-It-Anyway/E06_Tunnel-Boring
```

What it does, in order:

1. `retime` measures the passages from the recording (exact durations, or the silence
   boundaries for one file). It prints the boundaries it proposes.
2. The beats are rebuilt on the measured timing and the page is regenerated.
3. The scene-graph gates (B1-B17) run. **If they fail, stop and read the report** -
   a text that no longer fits its label is the usual cause, and the label needs a shorter
   wording.
4. The film is re-rendered at 1920x1080, 30 fps.
5. The frame gates run on the new render.
6. The contact sheets are regenerated for a quick look.
7. The voice is muxed in, normalised to -16 LUFS integrated with a true peak of
   -1.5 dBTP. The video stream is copied, so there is no second generation loss.

The result lands in the episode folder and in `S02_DENIED-India-Built-It-Anyway/FINAL/`:

```
Bharat-Blueprint_S02E01_Cryogenic-Engine_FINAL.mp4
```

The `_NOVOICE.mp4` file stays next to it as the silent master.

## 3. Check it

- Watch the `_FINAL.mp4` once end to end.
- Look at `qc/sheet_*.png` for the new timing: if a headline now sits under a different
  drawing, that is the thing to fix.
- The captions are written to `captions/<ep>.srt` and `.vtt` from the same passage text;
  if you want them burned into the picture, that is a separate decision for the reviewer.

## If something goes wrong

| symptom | what to do |
|---|---|
| `retime` refuses (exit 3) | the number of pauses does not match the number of passages: record with clearer gaps, or use one file per passage |
| B1 or B2 fails after re-timing | a label no longer fits: shorten the wording in `src/scene-ops.json` and run `build-episode` + `qc-scene` again |
| the render fails | check the disk space and that no other Chrome is running; then run the same command again |
| the voice is out of sync | the passage order in `audio/voice/` must follow `passages.md`; check the boundaries `retime` printed |

## What the finished film will sound like

The voice sits on a quiet blueprint-room bed (a low room tone, pen strokes on the
draw-on beats, a pump hum under the turbopump, the sound of the tunnel at the end). The
bed is generated locally and ducks under the voice. Nothing is uploaded anywhere.
