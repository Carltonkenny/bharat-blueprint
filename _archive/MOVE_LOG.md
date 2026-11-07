# Move log, 2026-11-05 (folders reorganised under BHARAT-BLUEPRINT)

Nothing was deleted or renamed inside any project. Folders were moved as whole units. Old root: `C:\Users\user\OneDrive\Desktop\films and ads\`.

| Old path | New path (under `BHARAT-BLUEPRINT\`) |
|---|---|
| akash-ng-episode-01\ | S01_The-Machines-That-Protect-India\E01_Akash-NG-Air-Defence\ |
| india-defence-series\ep02-fighter-engine\ | S01_...\E02_The-Fighter-Engine\ |
| india-defence-series\ep03-ins-vikrant\ | S01_...\E03_INS-Vikrant-The-Floating-Airport\ |
| india-defence-series\ep04-missile-shield\ | S01_...\E04_How-A-Missile-Finds-Its-Target\ |
| india-defence-series\ep05-from-buying-to-building\ | S01_...\E05_From-Buying-To-Building\ |
| india-defence-series\FINAL\ | S01_...\FINAL\ |
| india-defence-series\{MASTER_REFERENCE, EPISODES, EPISODE_BRIEF_V3, EP4_EP5_REVIEW, VOICE_PLAN_EP4_EP5}.md | S01_...\docs\ |
| india-defence-series\PIPELINE_V2.md | _shared\pipeline\PIPELINE_V2.md |
| india-defence-series\{CHANNEL_PLAN, REELS_PLAN}.md | 00_CHANNEL\ |
| india-defence-series\HANDOFF_PROMPT.md | _archive\HANDOFF_PROMPT_v1.md (superseded by 00_CHANNEL\AGENT_BRIEF_OPENCODE.md) |
| india-defence-series\render_chain.done | _archive\render_chain.done (stray marker) |

Fixed after the move: the shared `node_modules` links in E02 to E05 pointed at the old paths. They are now Windows junctions to `E01_Akash-NG-Air-Defence\node_modules` (the one real install).

Still mentioning old names (harmless, history only): `package.json` name fields, `.hyperframes\*.json` render history, and three one-off E03 helper scripts (`build\fix3.cjs`, `gen3.cjs`, `fix3b.cjs`). Older notes and chat logs may quote the old paths; use this table.

Not moved: `COMFY_AI_INTELLIGENCE\` (a different project), `.venv\`, `.claude\`.
Not yet re-tested after the move: a full test-engine / render run per episode. The first task in the agent brief is to run `node build/test-engine.mjs` in each episode folder.
