# Bharat Blueprint: story bible

The single source of truth for what every film on this channel is, sounds like and refuses to do. Read it before writing anything.

## The channel
**Bharat Blueprint** (working name; handle unchecked). Calm, sourced explainers on how India builds big machines, drawn entirely in code in a blueprint style, narrated by an unseen voice. Series are named folders `S01`, `S02`... under this workspace.

## The narrator: "The Old Observer"
- Unseen. Never on screen, never says "I", never a named person. Daniel voice on ElevenLabs (`htZQqY7WtacRNV7s62Iy`, model `eleven_v4`), tempo about 1.12, directed with tags such as `[calm]`, `[serious]`, `[long pause]`.
- Neutral, informative, brisk, with feeling: documentary weight, plain words. Episode 1 uses an older narrator (Ranbir Merchant); re-voicing it is optional and not approved.
- Skill: `unseen-narration` (copy into the project's `.claude/skills/` or the agent's skill folder).

## The format every episode follows
1. **Hook** in the first 15 seconds: a concrete question the viewer can picture.
2. **Then / Now / Next**: denial or past, what is built and working, what is announced or still missing. Always say what India cannot yet do.
3. **Ideas** (usually three): each is a plain everyday example first (a bus, a bicycle pump, catching a ball), then the machine, in before / during / after order.
4. **One honest number** drawn on a dimension chain, with its source on screen.
5. **FICTIONAL SCENARIO** beat: a clearly stamped what-if, never presented as real.
6. **Close**: a callback line and the series title. Series callback: "The missile is only what you see. The real engineering is everything working behind it."
Length target: 2:15 to 5:15 (today's films run 2:16 to 5:14).

## Look and motion
- Blueprint blue paper with grid, white line work, cyan highlights, orange only for heat or the key accent. 1280x720, 30 fps, built with HyperFrames (HTML/JS timeline) and rendered with `npx hyperframes render`.
- Constant motion: pen-drawn strokes, dimension chains, exploded and three-view drawings. Detailed vehicles. No stock footage. No real photos of weapons.
- Known weak spots to improve: 720p only, some sparse beats, sound effects too quiet in Ep2, Ep3 still has older jets.

## Hard content rules
- Every fact needs a source, PIB first. Mark each claim VERIFIED / SECONDARY / TO VERIFY in the episode's source ledger. Say "reported" or "announced" for anything not primary.
- No invented quotes, numbers or proof. No rankings ("first", "best", "#1") unless a source says so.
- No named hostile countries. No weapon schematics, ranges, speeds, warhead or seeker detail: concept level only.
- Fiction is always stamped FICTIONAL SCENARIO. Nothing implies government endorsement.
- Plain everyday examples. A viewer with no engineering background must follow it.

## Series map
| Folder | Series | Status |
|---|---|---|
| S01_The-Machines-That-Protect-India | Five films: air defence, fighter engine, aircraft carrier, missile guidance, buying to building | DONE, approved final, not yet posted |
| S02_DENIED-India-Built-It-Anyway | Cryogenic engine, Kaveri follow-up, supercomputing, the Akash arc. Same template: denial, decision, build, what is still missing | planned (ranked first) |
| S03_India-Megaprojects | Tunnels, trains, bridges, ports, giant machines (civilian) | planned |
| S04_Indias-Own | NavIC (India's own navigation), ISRO engines, Gaganyaan | planned |
| S05_Made-In-India-The-Numbers | Chips, factories, exports, lakh crore explained, with sourced numbers | planned |
| S06_Old-Observer-Checks | 60-second Shorts that check a viral number or claim within a day of an official release | planned (Shorts first) |
Research behind the ranking is in `CHANNEL_PLAN.md` (VidIQ, Nov 2026).

## Naming conventions
- Series folder `S##_Title-Case-With-Hyphens`; episode folder `E##_Title-Case`; finals in `S##_*/FINAL/` named `<Series-Name>_E##_<Title>.mp4` (existing) or `Bharat-Blueprint_S##E##_<Title>.mp4` (new series).
- Per episode: `src/` (drawing and timing code), `narration/` (voice plan, raw takes, measured lengths), `audio/`, `build/` (tests, QC, audio, split), `renders/`, `sources/` (source ledger), `index.html`.
- Packaging per series: `upload/` (titles, descriptions, thumbnails).

## Tone examples (do and do not)
- Do: "A country that was denied the parts built the programme anyway. Here is what is still missing."
- Do not: "India just humiliated the West." (hype, ranking, a named rival.)
