# Audit of the Series 3 drafts (Claude, 2026-11-14; verification pass done the same day). Read before approving anything.

## What this audit is not
Scripts were written by Claude from web research; no independent reviewer has checked them. The verification pass below re-read primary sources (PIB, JICA, MMRDA) for every item that was TO VERIFY, and changed the scripts where the sources disagreed with the first draft. Links were read through a search tool, not opened in a browser: open each URL once before posting.

## Verification pass result
| Item | Result | Script change |
|---|---|---|
| E02 opening date, start date | PIB: decision 3 Jun 2000, access-road foundation 26 May 2002, breakthrough 15 Oct 2017, dedicated 3 Oct 2020. "May 2010 start" and "4 Oct" were Wikipedia-only and wrong or unsupported | P03 now "decision June 2000, dedicated 3 Oct 2020: twenty years"; P10 uses 2000 and 2017 |
| E02 winter closure | PIB: closed for six months each winter | P01 says about six months |
| E02 emergency tunnel, contractor, 1860 | no primary source | removed; P06 rebuilt on PIB's factsheet safety systems; P07 now BRO built it, 587 m Seri Nalah fault zone, breakthrough 2017 |
| E02 drill and blast, ventilation | only the designer's page (SMEC) | kept, tagged SECONDARY |
| E03 travel time | JICA's own statements conflict: 120 min before (2022) and 60 min before (2024), 20 min after in both | P03 now says the "before" time was given two ways; no "two hours to twenty minutes" |
| E03 Japanese deck and finance | JICA confirms: loan about Rs 13,658 crore, Japanese expert recommended the deck, first use of OSD in India; MMRDA confirms steel made in 5 countries | P07 rewritten with these; "reports say" removed |
| E04 date, length, 1914 | PIB: inaugurated 6 Apr 2025; 2.08 km (another release 2.07 km); original built 1914, "no longer suitable for modern rail demands"; "110-year-old" | P03 and P10 reworded; decommission date dropped |
| E04 counterweights, 5.5 min, 58 km/h | still Railway Gazette only (PIB mentions counterweights only for launching the span) | kept as "reports say"; consider dropping the 58 km/h figure if you want zero secondary claims |
| E05 130% figure | PIB PRID 2218315 confirmed in full; release precedes 5 Feb 2026; the minister's line on dependence on foreign transshipment hubs is PIB | P03 adds the minister's statement, attributed |
| E06 2,843 km, "all commissioned" | PIB PRID 2295944 read in full: EDFC 1,337 km, WDFC 1,506 km, both commissioned; about 443 trains a day (data to Mar 2026) | P02 and P07 use PIB's separate figures and 443 trains a day |
| E01 erection method | script already hedged ("often", not claimed for Chenab) | none |

## Still open before approval
1. **E04**: counterweight lift, 5.5 minute opening and 58 km/h wind rule rest on one trade source (Railway Gazette). Either find an RVNL or Railways statement or accept "reports say".
2. **E02**: ventilation and drill-and-blast rest on the designer's page (SMEC). Acceptable if worded as it is; a BRO source would be better.
3. **E06**: the 2019 PIB figures (4x container units, 81 t at 100 km/h) are old and may be superseded; the speed expectation (26 to 70 km/h) is a trade-press figure.
4. **Concept citations**: E03 denominator neglect (Reyna and Brainerd 2008) and E05 induced demand (Duranton and Turner 2011) were cited from memory and need a one-minute DOI check; E06's "averages hide bottlenecks" is a book idea (Goldratt, The Goal), not a study.
5. **E01 length**: 678 words, the longest. Trim or accept about 5:10.
6. **Links**: open every URL in the ledgers once; the PIB pages were read through a search tool.

## Claims removed or refused (all episodes)
Numeric wind and quake limits for Chenab; any natural-depth figure for Vizhinjam; conflicting MTHL lengths; "first and only country" rankings; steel tonnage and design-life figures; designer lists; the "May 2010" start; the emergency tunnel; the Indian-Austrian JV; the 1860 date; the "two hours to twenty minutes" saving.

## Date-sensitive (re-check on the day of posting)
Vizhinjam capacity and phase dates; Pamban second track; DFC commissioning and the Dankuni-Surat DPR; any Atal Tunnel traffic restrictions.

## Wording checks
No "denied/denial". Records attributed ("the PIB says ... recognised as ..."). Secondary figures introduced with "reports say" or "a trade publication reported". Dependence notes (E03, E05) are written as facts of the project, now carried by JICA and MMRDA statements rather than press reports. Concept level only; nothing operational or military shown.

## Approval protocol
You approve each script by telling Claude, or by creating `E0n/APPROVED.txt` yourself. OpenCode must not build an episode without that file.
