# Episode 3 — INS Vikrant ("How do you build an airport that moves?") — PREP (research only, no script yet)

Status: research and outline. The script is NOT written. Next gate: you approve the three ideas, the behaviour idea and the open questions below, then I write the script and stop again for approval (same gates as Episode 2). Checked 2026-11-04.

## What changed in the news this week (use it, verify it again on render day)
- **Rafale M first landing on Vikrant, 29 Oct 2026.** The Indian Navy said a Rafale Marine landed on its first attempt on the carrier and described it as the first step towards operationalising the aircraft. Reported by Naval News, The Aviationist and MiGFlug. SECONDARY: the Navy's own post is the primary source and still needs to be fetched. It is a gift for the "arrested recovery" idea, and it also exposes a real limit: the Rafale M was built for catapult carriers, so deck fit (lifts, wing span) is being worked out. Those fit details are press reports only.

## Source ledger (draft)
| ID | Claim | Source | Status |
|---|---|---|---|
| E3-01 | Designed by the Navy's Warship Design Bureau; built by Cochin Shipyard Limited; largest warship built in India; commissioned 2 Sep 2022 | PIB backgrounder, 24 Oct 2025: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2182277 | VERIFIED (page read) |
| E3-02 | 262.5 m long, 61.6 m wide, about 45,000 t; four gas turbines about 88 MW; max designed speed 28 knots; about 1,600 personnel; about 2,200 compartments; STOBAR with ski-jump and arrester wires; up to 30 aircraft; electricity for about 5,000 households | same page | VERIFIED |
| E3-03 | 76% indigenous content; about 2,000 direct and 12,500 indirect jobs; over 550 OEMs and 100 MSMEs | PIB, Sept 2022: https://www.pib.gov.in/PressReleasePage.aspx?PRID=1856230 | VERIFIED (snippet). Indigenous design and build is not "every part made in India": say "76% indigenous content" with its source |
| E3-04 | "A set of three arrester wires"; STOBAR = Short Take Off But Arrested Recovery | PIB, Aug 2022: https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1854457 | VERIFIED (snippet) |
| E3-05 | Delivery after user acceptance trials Aug 2021 to Jul 2022 | PIB: https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1845871 | VERIFIED (snippet) |
| E3-06 | Cost close to ₹20,000 crore in three contract phases; India has operated all variants of launch and recovery systems since the sixties | PIB feature: https://www.pib.gov.in/FeaturesDeatils.aspx?NoteId=151135&ModuleId+=+2&reg=3&lang=1 | VERIFIED (snippet) |
| E3-07 | 26 Rafale M (22 single-seat, 4 twin-seat) ordered; IGA April 2025 | PIB review: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2210154 | VERIFIED (snippet). The twin-seat trainers are not carrier-capable: Naval News only |
| E3-08 | Rafale M landed on Vikrant 29 Oct 2026; first attempt | Naval News https://www.navalnews.com/naval-news/2026/11/rafale-m-conducts-maiden-trials-onboard-indian-aircraft-carrier-ins-vikrant ; The Aviationist https://theaviationist.com/2026/10/31/rafale-m-conducts-trials-aboard-ins-vikrant | SECONDARY: fetch the Navy post |
| E3-09 | Category comparison: CATOBAR (US Nimitz/Ford, France Charles de Gaulle), STOVL with ski-jump (UK Queen Elizabeth class, F-35B), STOBAR (India Vikrant and Vikramaditya, China Liaoning and Shandong), China's Fujian commissioned Nov 2025 with electromagnetic catapults | https://militarymachine.com/active-aircraft-carriers ; https://en.wikipedia.org/wiki/Chinese_aircraft_carrier_Fujian | SECONDARY: needs navy or government pages for each |
| E3-10 | Timeline: keel laid 2009, launched 2013, delivered 28 Jul 2022 (for the planning-fallacy idea) | not yet sourced | TO VERIFY from PIB/CSL; also the originally planned delivery date |
| E3-11 | Indigenous carrier fighter (TEDBF) still in development | not yet sourced | TO VERIFY from MoD/DRDO/ADA |

## Proposed structure (3:20, ~260-290 words, same format as Episode 2)
1. **Hook:** a runway is the one thing that stays still. Now put it on the sea. (Optional news line: a fighter landed on it last week.)
2. **Idea 1, the ramp:** a ski-jump is not a catapult; the aircraft supplies the push and the ramp turns it into a climb. (E3-02)
3. **Idea 2, the wire:** a hook, three wires, a few seconds to stop. (E3-04, E3-08)
4. **Idea 3, the city under the deck:** 88 MW, 2,200 compartments, hangar, lifts, fuel and weapons handling, all in a moving ship. (E3-02, E3-06)
5. **India, can / cannot yet:** can design and build a 45,000 t carrier and fly fixed-wing jets from it (E3-01, E3-03); cannot yet launch heavier aircraft with a catapult or field its own carrier fighter (E3-07, E3-11).
6. **Fair comparison, no rankings:** launch methods side by side (E3-09).
7. **Clearly fictional what-if:** a mobile aviation base in a crisis, high level, non-operational.
8. **One behaviour idea:** the planning fallacy (E3-10).
9. **Closing question:** who will build the aircraft that lands on it?

## Visual plan (blueprint engine, no Three.js)
Side-view deck with a ski-jump profile and an aircraft path; wire cross-section with a hook catching the second wire; a cutaway "hidden city" with hangar, two lifts, fuel and weapons routes; a launch-method comparison table like Episode 2's stage table; a timeline dimension chain 2009 to 2022 for the planning idea. New objects needed: carrier hull and island, ski-jump ramp, arrester wire and hook, lift, aircraft side view.

## Decisions I need from you
1. Open with the Rafale M landing as news, or keep the hook timeless (recommended: timeless hook, news in the India beat, so the film does not date)?
2. Planning fallacy as the behaviour idea? (Alternative: "sunk cost" again would repeat Episode 2.)
3. Keep Daniel and the scene-length directed passages for the voice?
4. Same 3:20 length?
