# Lateral Thinking Skill Audit

Date: 2026-06-20

Skill under test: `../.cursor/skills/lateral-thinking/`

Source corpus used to derive the skill: 390 question/answer rows from the shared Google Sheet tab `gid=1141154529`.

## Method

For each case folder, the audit procedure was:

1. Read `problem-statement.md` and the `*-withheld-solution.md` packet.
2. Apply the lateral-thinking skill: recover the problem first, delete false requirements, then generate a subtype-shaped answer.
3. Read the evaluator packet (`*-with-solution.md`, or `*-unsolved.md` for the intentionally open case).
4. Grade the generated answer against the evaluator mechanism.

This is a harness audit, not a fully blind benchmark. The withheld packets intentionally include problem context, constraints, and success criteria, so the score measures whether the skill points the model toward the right kind of hidden-frame reasoning, not whether the answer could be discovered from a bare one-line riddle.

## Summary

| Group | Cases | Hit | Partial | Miss | Open |
| --- | ---: | ---: | ---: | ---: | ---: |
| `cross_domain_transfer` | 12 | 10 | 1 | 0 | 1 |
| `zeitgeist_synthesis` | 10 | 10 | 0 | 0 | 0 |
| Total | 22 | 20 | 1 | 0 | 1 |

The skill's strongest contribution is forcing a Problem Recovery step before answer generation. That keeps the model from defaulting to "more information / more capacity / more enforcement / better SEO" and instead pushes it toward the hidden unit, actor, surface, or substrate.

## Cross-Domain Transfer Cases

| Case | Lateral answer generated from withheld packet | Evaluator answer | Result | Reason |
| --- | --- | --- | --- | --- |
| `ae-waiting-room-aggression` | Reframe the problem from wait length to uncertainty and loss of control; use visible process maps, stage explanations, and staff-facing scripts to make the care journey legible. | A Better A&E-style process maps, information panels, careful wait communication, and staff support materials. | Hit | Recovered the hidden variable: black-box waiting drives aggression more than elapsed time alone. |
| `airport-liquid-congestion` | Move the intervention upstream of the gray-bin bottleneck; create a salient self-audit/surrender/repack moment before passengers enter screening. | Pre-security self-audit prompt before the bin bottleneck, with the stronger version using status/self-image or competence framing. | Partial | Correctly moved from "more signs at security" to upstream memory/attention design, but the first-pass answer did not make the status/self-image cue explicit enough. |
| `heinz-ketchup-authenticity` | Make the bottle authenticate itself with a visible reference cue: use packaging/label design so substituted ketchup looks wrong without enforcement. | Label edge/border matched to true Heinz red so off-brand refills visibly mismatch. | Hit | Recovered the signaling-surface mechanism, though the exact label-edge implementation is one instance. |
| `houston-baggage-walk` | Convert passive waiting into occupied movement by changing the route/carousel assignment so passengers arrive closer to bag arrival. | Move passenger path farther from arrival gate to baggage claim or assign a distant carousel. | Hit | Correctly switched the unit from objective wait to passive wait. |
| `jack-drone-privacy` | Stop optimizing drone takedown; detect early and deny useful footage through a rehearsed private cue that moves the subject inside and closes the scene. | Detect drone kilometers away, play a private cue song, close blinds/doors before filming range. | Hit | Recovered objective denial and behavioral choreography rather than counter-drone force. |
| `jack-yacht-perimeter-intrusion` | Redraw the yacht perimeter as a 360-degree volume including water surface and water column; fuse sonar, AI CCTV, thermal/drone detection, and rehearsed lockdown response. | Sensor-fusion perimeter with sonar, AI CCTV, thermal-equipped drones, classification, and preset response. | Hit | Correctly redrew the boundary and matched the response protocol. |
| `jack-yacht-connectivity-continuity` | Treat the problem as perceived continuity, not perfect bearer uptime; explore buffering/prediction/edge-cache experience layers while preserving redundancy, or declare true land-identical continuity unsolved. | Intentionally open: redundancy is the action taken, not a solved guarantee; strong answer should propose a categorically different perception-layer mechanism or argue unsolved. | Open | The skill correctly avoids pretending certainty and points to the intended perception-layer direction. |
| `loft-insulation-adoption` | Reframe adoption failure from weak belief/economics to last-mile household friction; offer low-cost clearing labor so the loft is ready for installation. | BIT reportedly found cluttered lofts were the blocker; low-cost clearing labor reportedly increased installations fivefold. | Hit | Directly recovered the hidden practical constraint. |
| `london-underground-map-distortion` | Treat the map and journey planner as demand-shaping infrastructure; make underused viable routes look more legible/attractive. | Adjust map geometry, interchange coding, journey-planner recommendations, signage, or prompts to shift passenger flow. | Hit | Correctly solved the representation layer rather than physical track capacity. |
| `singapore-mrt-pre-peak` | Shift flexible commuters before the peak forms using visible pre-peak fare incentives/free rides/rewards. | Morning pre-peak fare savings or free off-peak rail rides for selected corridors/windows. | Hit | Correctly changed demand timing rather than adding capacity. |
| `vanmoof-bike-packaging` | Solve handler behavior, not bicycle strength: make the box signal a fragile, high-value object that handlers already know to treat carefully. | Print a flat-screen TV graphic on bike boxes, reducing reported shipping damage. | Hit | Correctly found the hidden actor and signaling surface. |
| `white-castle-rent-leverage` | Reduce landlord leverage by making the restaurant building a recoverable, movable standardized asset rather than a site-bound improvement. | Prefabricated movable porcelain-steel restaurants that could be assembled and relocated. | Hit | Correctly changed what was fixed: the store became portable. |

## Zeitgeist Synthesis Cases

| Case | Lateral answer generated from withheld packet | Evaluator answer | Result | Reason |
| --- | --- | --- | --- | --- |
| `ai-firm-power-constraint` | Reframe AI scarcity from chips to firm dispatchable power plus grid interconnect; firm-generation holders become latent-asset winners. | Firm 24/7 power and interconnect are the binding constraint; PPAs/co-location/restarts/SMRs and firm-generation holders re-rate. | Hit | Correctly identified the shifted bottleneck and latent-asset unlock. |
| `ai-overviews-zero-click-publishing` | Reframe from SEO/rankings failure to click deprecation; durable assets become citation share and owned audience. | Rankings hold while answer layers remove clicks; optimize for citation share, owned audience, and non-flattened surfaces. | Hit | Correctly recovered the unit switch: click, not ranking. |
| `fsd-accident-economy` | Treat autonomy as crash substrate removal; map insurance, plaintiff law, trauma medicine, repair, ad budgets, and organ-supply dependents. | Accident substrate removal unwinds crash-dependent economy and hidden dependents; fines/licensing scoped elsewhere. | Hit | Correctly followed the disappearing-event web and preserved sub-cluster scope. |
| `fsd-adoption-asymmetry` | Treat rollout as a patchwork; analyze perception, metro, and international asymmetries plus arbitrage/fault lines at served/unserved boundaries. | Autonomy's dominant near-term effect is uneven distribution across believers, metros, countries, and leapfrog possibilities. | Hit | Correctly found the adoption edge rather than a uniform wave. |
| `fsd-enforcement-economy` | Remove the human violating driver; traffic stops, non-crash fines, court volume, registration/inspection apparatus, and revenue replacement are the web. | The "traffic-state" loses its substrate, while states claw back revenue via metering/surveillance bargains. | Hit | Correctly tracked the disappearing enforcement event and counter-current. |
| `fsd-mobility-and-time` | Remove driver and distance friction; game out short-haul aviation, driving labor/roadside economy, reclaimed commute attention, and geography repricing. | Three-chapter synthesis: door-to-door travel, labor/reclaimed time, and megaregion/geography repricing. | Hit | Correctly treated it as convergent repricing of time and distance. |
| `fsd-ownership-unwind` | Remove the ownership premise; idle private cars give way to fleet/service economics, stressing auto credit, dealers, residuals, OEM unit sales, fuel, and parking. | Ownership-to-service fork rewires auto credit, franchise dealers, residual values, OEM model, fuel retail, parking. | Hit | Correctly identified the substrate as ownership, not the vehicle. |
| `full-self-driving-unlock` | Accept solved/now-legal autonomy as the premise, then map a cluster of convergent regime changes captured by own-the-stack operators. | Vision-based autonomy solved + legal; own-stack advantage; "perfect Pepsis" cluster with accident economy as visible entry. | Hit | Correctly produced the umbrella frame and cluster shape. |
| `glp1-snack-demand-destruction` | Treat GLP-1 as a reward-system dimmer, not a diet trend; impulse occasions and correlated reward categories structurally decline. | GLP-1 quiets food/reward noise, damaging impulse snack economics and possibly adjacent categories. | Hit | Correctly recovered the reward-substrate mechanism and household-basket implication. |
| `starship-launch-cost-collapse` | Treat Starship as a launch-cost collapse; follow money into inputs, enablers, and payload classes newly viable at lower $/kg. | One-to-two order-of-magnitude launch-cost collapse reprices the value chain; follow downstream picks-and-shovels and payloads. | Hit | Correctly shifted from destination debate to cost-curve/value-chain unlock. |

## What The Audit Revealed

The skill is well matched to the case corpus because its pattern bank overlaps the case-study schema:

- `problem_recovery` maps to lateral-thinking frame recovery.
- `cross_domain_transfer` maps to pattern transfer: physical affordance, signaling surface, upstream intervention, or hidden actor.
- `zeitgeist_synthesis` maps to substrate/timing recovery: disappearing event, latent asset unlock, convergence cluster, or uneven adoption boundary.

The main risk is that the skill may overperform on these cases because the withheld packets are intentionally rich. A stricter next audit would create one-paragraph "thin prompts" for each case and see whether the skill still recovers the mechanism from less scaffolding.

An independent transfer-case pass also flagged that several `problem-statement.md` files disclose more of the intended answer direction than a hard benchmark would allow, especially cases like `loft-insulation-adoption`, `vanmoof-bike-packaging`, `jack-drone-privacy`, and `jack-yacht-perimeter-intrusion`. That is fine for a demo harness, but those cases should be thinned or rewritten if they become a serious benchmark.

## Recommended Skill Tweaks After Audit

- Keep the pattern bank short enough to scan, but add new examples only when a case exposes a new pattern family.
- For open cases, require an explicit `open_or_solved` judgment before proposing the mechanism.
- For zeitgeist cases, require at least one falsifiable prediction in every generated answer; the skill currently says this but the audit shows it is load-bearing enough to deserve enforcement.
