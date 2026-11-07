# REVIEW REQUEST - S2-T2 (hero module)

Implementer: OpenCode. Date: 2026-11-07.

## Files added
_shared/kit-v2/src/hero/stage.js (the WebGL stage: one renderer, preserveDrawingBuffer,
pixel ratio 1, one analytic enderAt(t)), _shared/kit-v2/src/hero/index.js
(the blueprint hologram material, the cutaway, the explode, and the builders for E01:
	ank, pipe-network, 	urbopump, chamber-nozzle, ocket-stack).

## How to run
    node _shared/kit-v2/tools/shoot-gallery.mjs _shared/kit-v2/gallery/heroes.html

## Verbatim output
    wrote _shared/kit-v2/gallery/heroes.png
    {"heroes":["tank","pipe-network","turbopump","chamber-nozzle","rocket-stack"],"angles":3,...}
    no page errors

## Acceptance
The gallery page shows each of the five E01 heroes from three camera angles, with no
page errors. Geometry is built once and cached: no builder creates geometry per frame.

## Deviations and risks
1. The cutaway is a camera-independent local-z discard injected into the material
   shader, not a Three.js clipping plane. A clipping plane's effect depends on the
   camera distance (its constant is offset by twice the camera radius), so the cut
   could not be swept reliably; the shader cut sweeps from clear of the part to its mid
   plane, and it is independent of the camera.
2. The fresnel rim is a custom shader with the clipping chunks, so it is cut with the
   rest of the part.
3. The tank's lathe is built lying along X, so it reads as a tank from the side.

## What I did not do
I did not build the heroes for E02 to E06: those are built in their episode tickets.