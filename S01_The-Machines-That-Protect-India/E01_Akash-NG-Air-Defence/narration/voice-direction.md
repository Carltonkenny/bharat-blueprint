# Voice direction — Akash-NG Episode 01 (ElevenLabs `eleven_v4`)

Words are the locked script, unchanged. Square-bracket tags are performance directions only (not spoken).
Rule from the model guide: tags describe HOW a line is spoken; they hold until the next tag, so change them where the delivery changes.

## Overall persona
A calm, intelligent engineer-narrator. Authority without bravado. Think documentary, not trailer. Never hype, never military-recruitment energy.
- Pace: unhurried; let the picture draw while the voice waits (the film inks in over several seconds).
- Emotion arc: quiet tension → curiosity → clarity → quiet pride → reflective close.
- Keep a low, steady pitch; emphasis through pauses and a few CAPITALS, not volume.
- No sensational words added. No claims beyond the script.

## Arc by section (timestamps are the locked section windows)
| Section | Window | Emotion | Delivery notes |
|---|---|---|---|
| The Hook | 00:00–00:12 | hushed tension | slow, close, a held breath before "Not quite." |
| The Problem | 00:12–00:29 | thoughtful, building | steady; each need ("detect", "analysed", "work together") lands as its own beat |
| The Reveal | 00:29–00:45 | curious, opening up | slight lift at "Akash-NG"; "It's not just a missile." quiet and certain |
| Inside the Engineering | 00:45–01:16 | clear, explanatory, warm | teacher's clarity; "eyes" and "brain" slightly warmer; final three phrases measured, one idea each |
| Why It Matters | 01:16–01:35 | grounded, serious | fair and factual on other countries; weight on "own systems" |
| The Revelation | 01:35–01:50 | quiet pride, reflective | factual on the trials; slow, soft, final line resolved with a long pause before the title |

## Tagged script
**S1 THE HOOK**
[calm] [measured] Imagine waking up tomorrow to a red alert. [short pause] An unidentified aircraft is approaching Indian airspace. [slowly] It's moving closer. [short pause] Radar systems are watching. [pause] [quietly] But here's the question… [long pause] Does India immediately fire a missile? [pause] [softly] Not quite.

**S2 THE PROBLEM**
[thoughtful] Because protecting a country isn't as simple as shooting down an aircraft. [short pause] First, something needs to detect it. [short pause] Information needs to be analysed. [short pause] And different defence systems need to work together. [pause] [clearly] Modern air defence is an entire network, not one machine.

**S3 THE REVEAL**
[curious] One part of India's indigenous defence engineering is Akash-NG, developed by DRDO with Indian industry. [pause] And here's what makes it interesting. [short pause] [quietly] It's not just a missile. [pause] [clearly] It's an interconnected system involving radar, command and control, launch equipment and an interceptor.

**S4 INSIDE THE ENGINEERING**
[warmly] Think of the radar as its eyes. [short pause] It sends out radio waves and analyses the signals reflected by objects to help detect and track aerial targets. [pause] Next comes the Command and Control Unit. [short pause] Think of it as the brain, processing and coordinating information. [pause] And then there's the interceptor. [short pause] Its solid rocket motor produces thrust, while its indigenous radio-frequency seeker provides an important sensing capability. [pause] [slowly] Different technologies. [short pause] Different jobs. [short pause] One connected system.

**S5 WHY IT MATTERS**
[seriously] Countries such as the United States and France also develop advanced air-defence systems. [pause] But India's challenge is bigger than simply acquiring a missile. [short pause] It's about developing the engineering, radar technology, electronics and industrial capabilities to build its own systems.

**S6 THE REVELATION**
[calm] In December 2025, Akash-NG successfully completed its User Evaluation Trials. [pause] [softly] And that's the fascinating part. [long pause] The missile is only what you see. [pause] [slowly] The real engineering is everything working behind it.

## Notes
- Do not add words. Do not say the title card ("AKASH-NG / ENGINEERING AN ENTIRE DEFENCE SYSTEM.") unless the script owner asks.
- Pronunciation: "Akash-NG" = "AH-kaash en-JEE" (check on first take; use IPA replacement only if the voice misreads it). "DRDO" = letters D-R-D-O.
- Sync plan: generate per section, measure with ffprobe, then re-time BEATS (src/film.js) so each visual event lands on its word; hold the final title ≥ 2 s after the last word.
- Audio mix plan: voice on top; optional quiet blueprint/plotter SFX and a low ambient bed ducked under the voice; no music louder than -26 LUFS.
