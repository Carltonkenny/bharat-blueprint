# REVIEW REQUEST - S2-T0 (spike)

Implementer: OpenCode. Date: 2026-11-07. Ticket: `docs/design/09_S02_TICKETS.md` S2-T0.

## Files changed / added
- `_shared/kit-v2/` (new): the kit-v2 source tree. Browser modules `src/*.js`, the 3D hero
  module `src/hero/`, the vendored Three.js `vendor/three/three.iife.js`, the page template
  `templates/index.template.html`, Node tools `tools/`, the engine `engine/beats.mjs`,
  the spike `spike/`.
- `_shared/kit-v2/spike/REPORT.md` - the spike report (measurements, GPU probe, determinism,
  the decision, and an honest list of what looked bad).
- `_shared/kit-v2/spike/frames/` - three frames (mid-beat of a, b and c).
- The pinned build dependencies are installed **outside OneDrive**, in
  `%LOCALAPPDATA%\BharatBlueprint\render\S02\deps` (`hyperframes 0.9.9`, `three 0.187.0`,
  `puppeteer-core 25.16.0`), so OneDrive never syncs thousands of node_modules files.

## How to run
```
node _shared/kit-v2/tools/build-episode.mjs _shared/kit-v2/spike --size 1920x1080
node _shared/kit-v2/tools/smoke.mjs _shared/kit-v2/spike --times 2.4,4.9,7.5
node _shared/kit-v2/tools/measure-spike.mjs _shared/kit-v2/spike
node _shared/kit-v2/tools/qc-determinism.mjs <videoA> <videoB>
```

## Verbatim output (the decision lines)
```
name                     ok    seconds  s/frame  peakVRAM
1080p-w1                 yes    37.9    0.117     264 MB
1080p-w2                 yes    25      0.077     348 MB
1080p-w3                 yes    20.8    0.064     521 MB
1080p-w4                 yes    18.1    0.056     695 MB
1080p-w2-software        yes    27      0.083     0 MB
1080p-w2-gpuencode       yes    23.4    0.072     469 MB
1080p-w4-gpuencode       yes    18.4    0.057     816 MB
720p-w1                 yes    43.4    0.134     264 MB
720p-w2                 yes    26      0.080     348 MB
720p-w3                 yes    21.6    0.067     521 MB
720p-w4                 yes    17.8    0.055     695 MB
720p-w2-gpuencode       yes    24.5    0.076     469 MB

hardware GL (RTX 3050):   mean SSIM 0.999809  min 0.998534  18 frames < 0.999   FAIL
software GL:             mean SSIM 1.000000  min 1.000000   0 frames < 0.999   PASS
both software renders hash to C48BD877A63C444CFBC890FFA1838CFA263AF77BE079646D7F4567B18C2C3BA9
```

## Decision (as the ticket and 08 section 8 require)
- Master at **1920x1080**: projected 12.5 minutes for a 5-minute film, inside the 3-hour rule.
- Render with **`--no-browser-gpu`** (software WebGL) and **4 workers**, CPU x264 encode.
  Hardware GL is reachable on the RTX 3050 but is not reproducible enough for QC B14 here.
- A one-line Windows Graphics instruction for the user is in the final report.

## Risks
1. The render path is the software rasteriser, so the GPU is not used for the picture.
   This is a deliberate trade for determinism (B14 is a hard gate) and it is affordable.
2. `_shared/kit-v2/vendor/three/three.iife.js` is a bundled copy of three 0.187.0 built
   with the pinned esbuild, because ES modules cannot be loaded from `file://`.
3. Our pinned HyperFrames copy carries a one-line local patch that adds
   `--force_high_performance_gpu` and `--disable-accelerated-2d-canvas` to the Windows
   GPU launch arguments. It changes no system setting and can be reverted with
   `node tools/patch-hyperframes-gpu.mjs --revert`. With the software path chosen for the
   films it has no effect on the output.

## What I did not do
- I did not change any Windows setting (no Graphics settings, no power plan, no drivers).
- I did not install anything globally; the dependencies live in RENDER_ROOT.
- I did not render anything outside the S02 spike, and nothing was posted or uploaded.
- I did not touch S01, the scripts, the ledgers, the briefs or any APPROVED.txt.
