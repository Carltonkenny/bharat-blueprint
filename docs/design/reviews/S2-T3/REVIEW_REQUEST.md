# REVIEW REQUEST - S2-T3 (figure module)

Implementer: OpenCode. Date: 2026-11-07.

## Files added
_shared/kit-v2/src/figures.js (the 7 joint rig, ten poses, blend), and the props in
_shared/kit-v2/src/props.js for E01 and E02: gas stove, pot, bicycle pump, tyre,
pressure cooker, papers and desk, knife, baton, plus the rest of the S02 prop set.

## How to run
    node _shared/kit-v2/tools/shoot-gallery.mjs _shared/kit-v2/gallery/figures.html

## Verbatim output
    PASS  figure: limb lengths are constant to 0.1 px across every pose  [worst 0.000000 px in reach]
    PASS  figure: a blended pose keeps the limb lengths  [drift 0.000000 px]
    PASS  figure: there are ten named poses  [10]
    PASS  figure: the pictogram body is about 1.8 head widths wide  [1.80 head widths, 140 units tall]
    all passing
    no page errors

## Acceptance
The gallery page shows all ten poses and the prop set. The limb lengths are exactly
constant across every pose and across a blend (0.000000 px drift), because the rig is
built by forward kinematics from fixed segment lengths rather than from hand-placed
joints.

## Deviations and risks
1. The rig is drawn on the blueprint canvas rather than as an SVG element, so that the
   scene report can measure it like any other object. The rig still emits SVG path
   data, so it can be moved to an SVG layer without changing the poses.
2. The joint angles are absolute (0 = down, 90 = forward), so both arms can reach the
   same way. The first version mirrored the left arm, which made the arms cross.

## What I did not do
I did not add a walking cycle or a face; the figures stay faceless and anonymous.