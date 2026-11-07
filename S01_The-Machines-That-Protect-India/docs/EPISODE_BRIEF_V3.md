# Episode brief v3 (optimised prompt) — THE MACHINES THAT PROTECT INDIA

Use this brief for every episode. It replaces the long chat prompt. The loop is: **Images → Storyboard → Video → Strict QA**, and nothing is shown to the user until QA passes.

## 1. Why the episode exists (the pretext, written before the script)
Answer in three lines, and put them in the script's first 25 seconds:
1. **The everyday question** a non-engineer already has ("Why is the engine so hard?", "How can an airport float?").
2. **Why the answer matters to a citizen**: money, time, dependence, safety, jobs.
3. **What the viewer will know at the end that they did not know before**: at least three non-engineering facts (dates, numbers, how decisions are made, one human habit).

## 2. Theme rules (reference: the Episode 1 style and the video the user linked)
- Narrator: The Old Observer. Unseen, never named. Plain, brisk, informative. Sceptical of claims, not of India.
- Voice: Daniel (`htZQqY7WtacRNV7s62Iy`), `eleven_v4`, tag `[calm]` only, 1.12x tempo, about 2.7 words per second.
- Every idea: **before** (what is the problem), **during** (what the machine does), **after** (what changes), and **one example a 5-year-old knows** (pump, door, stove, kite, cake).
- Structure: question hook, pretext, 3 engineering ideas, India can / cannot yet, fair comparison with no ranking, a clearly fictional what-if, one behaviour idea, closing question.
- Length: 4:00 to 4:45. About 600 to 680 spoken words.
- Every number: spoken in words, said in plain units, and shown on screen with a source line.

## 3. Loop and gates
| Step | Output | Gate (all must pass) |
|---|---|---|
| 1 Research | `SOURCE_LEDGER.md` | each fact VERIFIED, PARTLY, SECONDARY or TO VERIFY; unverified facts are worded as "announced", "reported" or dropped |
| 2 Script | `narration_vN.txt`, one sentence per clip | word count in range; each idea has before / during / after / example; pretext and takeaways present |
| 3 Images | one panel per sentence group, code-drawn | `test-engine`, `qc-frames`: 0 issues; every PNG viewed by me |
| 4 Storyboard | `STORYBOARD.md` (frame + narration per beat) | no beat under 2 s; each beat shows what is being said |
| 5 Voice | passages with `[calm]`, split to clips, tempo 1.12 | each clip 1.2 to 3.6 words per second; user listens |
| 6 Video | render 30 fps, mux, loudnorm about -16 LUFS | `qc-sweep` clean; contact sheets cut from the final MP4 viewed; no black or silent span; duration in range |
| 7 Rate | written score out of 10 per axis | any axis under 8 is fixed and the gate re-run |

## 4. Strict QA checklist (theme conformance)
Look-and-feel: blueprint blue, one pen, hand-drawn wobble only on non-circles, circles exact, leaders attached to named points, text whole words only, nothing outside the safe area, no ghost or doubled labels in crossfades.
Content: no ranking of countries, fiction is stamped FICTIONAL SCENARIO, no operational detail, each claim has a source line, crore explained as money in plain numbers.
Sound: no clipped word, no gap over 2.5 s, effects below the voice, final true peak under -1 dBFS.
Honesty: the report to the user says what was not checked (I cannot hear audio) and what was not verified.

## 5. Why a Navy episode (Episode 3) is worth making
The first two episodes are about the sky. Most Indian trade (about 95% by volume is commonly cited, to verify) moves by sea, and the Navy is what keeps those routes open. A carrier is the easiest naval machine to explain, because it is an airport, a power station and a town in one hull. The non-engineering takeaways, each to be sourced: how many years a big ship takes from keel to commissioning and why; how many people live aboard; what it takes to keep a floating town fed and fuelled; and the planning fallacy (we always plan for the day nothing goes wrong).
