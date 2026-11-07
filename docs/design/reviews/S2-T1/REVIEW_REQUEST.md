# REVIEW REQUEST - S2-T1 (kit-v2 foundations)

Implementer: OpenCode. Date: 2026-11-07.

## Files added
_shared/kit-v2/: src/prng.js, src/tokens.js, src/scenereport.js, src/draw.js,
src/labels.js, src/fx.js, src/camera.js, src/panels.js, src/props.js,
src/figures.js, src/charts.js, src/maps.js, src/scenes.js, src/film.js,
src/hero/stage.js, src/hero/index.js, 	emplates/index.template.html,
	ools/sync-kit.mjs, 	ools/build-episode.mjs, 	ools/smoke.mjs,
	ools/shoot-gallery.mjs, 	ools/dbg-scene.mjs, 	est/run.mjs.

## How to run
    node _shared/kit-v2/test/run.mjs
    node _shared/kit-v2/tools/shoot-gallery.mjs _shared/kit-v2/gallery/labels.html

## Verbatim output
    PASS  tokens: the safe zone matches CAMERA_AND_ZONES_S02.md
    PASS  labels: a deliberate overlap is detected
    PASS  prng: the same seed gives the same sequence
    PASS  camera: a push-in scales up
    PASS  fx: the counter ends exactly on the value
    PASS  scene report: items are collected with their box
    all passing
    no page errors

## Acceptance
- 
ode _shared/kit-v2/test/run.mjs prints ll passing.
- The demo page opens from ile:// with no console errors.
- __sceneReport returns the boxes for the five test labels, and the collision test
  flags the deliberate overlap.

## Deviations and risks
1. The browser modules are classic scripts, not ES modules: ES modules cannot be loaded
   from ile:// under Chrome's CORS rules, and 08 section 9 requires the page to open
   from ile://. Three.js is therefore vendored as a bundled IIFE
   (endor/three/three.iife.js, built from the pinned three 0.187.0 with the pinned
   esbuild).
2. The type scale was raised after the tests: the smallest size is now 34 authoring
   units (a 23.1 px cap height at 1080p) because the earlier 22 unit size gave a
   16.3 px cap height, under the QC B3 floor of 2.0% of the frame height.
3. Text is never moved by the camera: the render is split into a world pass under the
   camera and a screen pass that the camera does not touch. A push-in otherwise pushed
   the rail labels outside the safe area.

## What I did not do
I did not change any system setting, install anything globally, or touch Series 1.