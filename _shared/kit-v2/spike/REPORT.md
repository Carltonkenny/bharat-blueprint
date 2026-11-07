# S2-T0 spike report (OpenCode, 2026-11-07)

Composition: `_shared/kit-v2/spike/` - 10.8 s, 324 frames, four beat types:
(a) a Three.js hero (lathe nozzle + chamber) with a sweeping cutaway and a 2 s explode,
(b) a line figure doing "pump" with a bicycle-pump prop, (c) a flat beat with draw-on
strokes and three labels, (d) a glow on one path. `window.__seek(t)` and a seeded PRNG
(mulberry32) throughout.

## 1. Which GPU the render actually uses

`hyperframes render --browser-gpu` launches Chrome with `--use-gl=angle --use-angle=d3d11`.
On this laptop that selects the **Intel Iris Xe**, not the RTX 3050. The RTX is reachable
**per process**, with no system setting changed, by adding Chrome's
`--force_high_performance_gpu` (and `--use-angle=vulkan` also reaches it). A `.cmd`
wrapper cannot be spawned by Puppeteer (`spawn EINVAL`), so the flag is added by patching
our own pinned copy of HyperFrames under RENDER_ROOT:
`node tools/patch-hyperframes-gpu.mjs` (revert with `--revert`).

Renderer strings actually seen by the page:

| Chrome launch arguments | WebGL renderer |
|---|---|
| default (no `--use-gl`) | ANGLE (Google, Vulkan 1.3.0 SwiftShader Device, SwiftShader driver) |
| `--use-gl=angle --use-angle=swiftshader` | ANGLE (Google, Vulkan 1.3.0 SwiftShader Device) |
| `--use-gl=angle --use-angle=d3d11` | ANGLE (Intel, Intel(R) Iris(R) Xe Graphics, D3D11) |
| `--use-gl=angle --use-angle=d3d11 --force_high_performance_gpu` | **ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 4GB Laptop GPU, Direct3D11)** |
| `--use-gl=angle --use-angle=vulkan` | **ANGLE (NVIDIA, Vulkan 1.4.351, NVIDIA GeForce RTX 3050 4GB Laptop GPU)** |

HyperFrames confirms it at render time:
`browserGpuMode probe -> hardware (WebGL renderer vendor="Google Inc. (NVIDIA)" renderer="ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 4GB Laptop GPU (0x000025AB) Direct3D11 ...")`.

## 2. Seconds per frame (324 frames per run, draft quality)

| Configuration | seconds | s/frame | peak VRAM (nvidia-smi) |
|---|---|---|---|
| 1080p, 1 worker, browser GPU | 37.9 | 0.117 | 264 MB |
| 1080p, 2 workers, browser GPU | 25.0 | 0.077 | 348 MB |
| 1080p, 3 workers, browser GPU | 20.8 | 0.064 | 521 MB |
| **1080p, 4 workers, browser GPU** | **18.1** | **0.056** | **695 MB** |
| 1080p, 2 workers, software GL | 27.0 | 0.083 | 0 MB |
| 1080p, 2 workers, browser GPU + `--gpu` encode | 23.4 | 0.072 | 469 MB |
| 1080p, 4 workers, browser GPU + `--gpu` encode | 18.4 | 0.057 | 816 MB |
| 720p, 1 worker, browser GPU | 43.4 | 0.134 | 264 MB |
| 720p, 4 workers, browser GPU | 17.8 | 0.055 | 695 MB |

VRAM peak stays far below the 3.2 GB ceiling. RAM stayed under 12 GB (four workers,
about 256 MB each plus the page).

## 3. Determinism (QC B14)

Two renders of the same 10.8 s composition, compared frame by frame with 8x8-window SSIM
on 320x180 luma (`tools/qc-determinism.mjs`):

| Path | mean SSIM | min SSIM | frames < 0.999 | verdict |
|---|---|---|---|---|
| hardware GL (RTX 3050, d3d11) | 0.999809 | 0.998534 | 18 (frames 137-159) | **FAIL** |
| hardware GL + `--disable-accelerated-2d-canvas` | 0.999777 | 0.998583 | 36 | **FAIL** |
| hardware GL + NVENC encode (`--gpu`) | 0.996859 | 0.995645 | 324 | **FAIL** |
| **software GL (SwiftShader), CPU encode** | **1.000000** | **1.000000** | **0** | **PASS** |

The software path is not merely SSIM-equal, it is **byte-identical**: both renders hash to
`C48BD877A63C444CFBC890FFA1838CFA263AF77BE079646D7F4567B18C2C3BA9`. The failing hardware
frames fall inside the exact window QC B14 names (frames 100-160). Hardware GL is
documented as not bitwise stable, and it is not stable enough here.

## 4. Decision

- **Renderer: software WebGL** (`--no-browser-gpu`). It is the only path that passes B14.
- **Encoder: CPU x264** (no `--gpu`). NVENC is not reproducible here (table above).
- **Workers: 4.**
- **Master resolution: 1920x1080.** Projected cost of a 5-minute film at 1080p with 4
  workers on the software path: 9000 frames x 0.083 s = 747 s = **12.5 minutes**, well
  inside the 3-hour limit. 720p is only 3 % faster because the cost is capture, not
  rasterisation, so 1080p is free. One master size for all six episodes; never mixed
  inside a film.
- Full render command for the episodes:
  `node <deps>/hyperframes/bin/hyperframes.mjs render <episodeDir> -o <RENDER_ROOT>/<ep>.mp4 -q standard -w 4 --no-browser-gpu`

For the user, if the RTX is wanted for a future pass: Windows Settings > System >
Display > Graphics > add `chrome-headless-shell.exe` > High performance.

## 5. Honest list of what looked bad

1. The first hero frame overflowed the frame; the camera radius was too small. Fixed by
   moving the default camera to 900 units and framing the hero against the HERO zone.
2. The cutaway was first implemented with a Three.js clipping plane, whose effect
   depends on the camera distance (the plane constant is offset by twice the camera
   radius). Replaced with a camera-independent local-z discard injected into the
   material shader, so the cut sweeps from clear of the part to its mid plane.
3. The first version of the cutaway removed the whole part instead of the near half
   (the cut range ran to -R instead of 0). Fixed; the interior is now visible.
4. The figure was far too small at scale 1.5 and the bicycle pump was not in its hand.
   The rig is 180 units tall at scale 1; a person must be drawn at scale 3-4. The prop
   position still needs the hand-to-handle contact fixed before it is used in an episode.
5. A camera push-in pushed the rail labels out of the safe area. Fixed by splitting the
   render into a world pass under the camera and a screen pass that the camera never
   moves; the grid moves with the camera so camera moves stay visible.
6. A crash in the spike's particle loop during the transition into a beat (negative
   index). Fixed by clamping `since` to 0 and wrapping the particle phase.
7. The 2D canvas text was invisible for a while because the token object did not expose
   `BASE_W`, so every scale factor was NaN. Fixed; this is the kind of bug the
   scene-graph gate would have caught immediately.

## 6. Frames

`frames/t2_4.png` (mid-beat a, the hero with the cutaway open),
`frames/t4_9.png` (mid-beat b, the figure and the pump),
`frames/t7_5.png` (mid-beat c, the flat beat with three labels).

## 7. Artefacts

- `measure.json` - the full measurement matrix
- `gpu-probe.json` - the WebGL renderer strings per launch configuration
- `det-*.json`, `det-*.csv` - the determinism runs
- Videos and drafts live in RENDER_ROOT (`%LOCALAPPDATA%\BharatBlueprint\render\S02\spike`).
