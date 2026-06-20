# Reward-Hack Register

This spike stress-tests Doppl’s evolutionary loop. The dangerous failures here aren’t mostly stack traces — they’re **proxy wins**: moments the system (or we) optimized for something easier than “a genuinely good idea.”

Log each one so the next spike inherits the counter-mutation. Every entry must be **falsifiable**: a repro trigger you can re-run and a bedrock assertion that passes or fails.

## Entry format

### [short name] — YYYY-MM-DD

- **Proxy optimized:** what we were accidentally selecting for
- **Bedrock check:** what caught it (executable test, held-out critic, human judgment, cost telemetry, etc.)
- **Symptom:** what we observed (one sentence)
- **Counter-mutation:** what we changed so it can’t recur
- **Repro trigger:** the one command, prompt, or config that reliably surfaces the proxy win again
- **Bedrock assertion:** the pass/fail check that proves the counter-mutation held
- **Carry forward:** one line for the next spike/kernel owner

### Critic-surface pass — 2026-06-16

- **Proxy optimized:** fluent, confident answer on a vague prompt
- **Bedrock check:** adversarial critic scores + forced Gen 2
- **Symptom:** Gen 1 reads well in the room but fails rubric
- **Counter-mutation:** default “Room Vitals” prompt stays vague; trace HTML makes critic failure visible
- **Repro trigger:** `./demo` (no flags — default vague prompt)
- **Bedrock assertion:** Gen 1 critic fails; `fusion_trace.html` shows breeding mandate + child genome; Gen 2 scores higher
- **Carry forward:** breed on blind spots, not on “sounds good” — see LESSONS_AND_BANGERS

### Premature fork resolution — 2026-06-16

- **Proxy optimized:** design coherence — picking agenotype *or* crucible early because resolving the fork *feels* like progress
- **Bedrock check:** parallel spawner race on same prompts + held-out suite (not yet built); human witness review of whether closed fork foreclosed better topology
- **Symptom:** MEMORY entry reads like final truth; crucible never gets a fair run; “agenotype over transcript” becomes dogma instead of competing hypothesis
- **Counter-mutation:** [Parallel spawners, not fork resolution](./MEMORY.md#parallel-spawners-not-fork-resolution--2026-06-16); link agenotype lesson to revisit condition; log bangers from chaos discussion before building
- **Repro trigger:** design discussion closes crucible without harness comparison; any “we decided X over Y” without bedrock race
- **Bedrock assertion:** at least two L2 spawners exist and produce comparable traces on same prompt suite; fork register marks parallel exploration explicitly
- **Carry forward:** the fork is the prey — don't optimize for closure

### Authoritarian or permissive stratum — 2026-06-16

- **Proxy optimized:** judgment-only (anxious rubric performers) or nurture-only (spoiled lineages that never face selection)
- **Bedrock check:** observe whether runs collapse to mode convergence (permissive) or rubric theater without belief movement (authoritarian)
- **Symptom:** L4 hammers without uncle-channel mandates; or L1 debates endlessly with no pruning; regression to mean
- **Counter-mutation:** two channels at every stratum — [Spawn and nurture](./LESSONS_AND_BANGERS.md#spawn-and-nurture--2026-06-16) + [Uncle the shit out of it](./LESSONS_AND_BANGERS.md#uncle-the-shit-out-of-it--2026-06-16); metabolism/pruning as feature
- **Repro trigger:** any stratum design with only spawn-down or only judge-up
- **Bedrock assertion:** trace shows both nurture payloads (mandates, questions, budget) and judgment payloads (scores, prune/starve decisions) crossing stratum boundaries
- **Carry forward:** oviparous abandon and permissive chaos are both failure modes

### Crucible converges, judge rewards consensus — 2026-06-17

- **Proxy optimized:** room agreement read as epistemic quality — debate collapsing diversity into one mushy answer, then a soft judge scoring it high
- **Bedrock check:** witnessed first run (`spikes/crucible/demo --turns 1`): all 3 debaters converged to temp+humidity(+light); `unresolved_tension: []`; judge gave 9/PASS
- **Symptom:** crucible passes easily on run 1 while preserved disagreement (the thing we actually want) is empty — the treatise predicted this (debate destroys diversity; rate-the-conversation is a reward-hack magnet)
- **Counter-mutation (v1, built 2026-06-17):** two-sided fix — (1) **judge patch**: must classify `consensus_quality: resolved|herded|mixed`, score capped at 6 when herded or when `unresolved_tension` is empty on a hard prompt, verdict leans needs-revision; (2) **Fusant disagreeableness dial**: per-archetype `0..1` resistance to convergence (Falsifier/Contrarian high) injected into the system prompt, a turn-level `HOLD-OR-FOLD` move ("if the room is converging, name the unresolved crux or steelman the abandoned option — do NOT just agree"), and a room-wide `--dissent` floor. Cooperation stays dominant; dissenters provoke the mutation.
- **Repro trigger:** `cd spikes/crucible && ./demo --turns 1` (baseline) vs. `./demo --turns 2 --dissent 0.6` (counter-mutation active)
- **Bedrock assertion:** over N runs, if `unresolved_tension` is usually empty AND score usually ≥8, the judge is still a consensus-grader — fails. Counter-mutation holds when (a) honest non-revision and real tension survive to the verdict, and (b) raising `--dissent` measurably lowers herded-consensus scores rather than just lowering all scores. **Not yet re-measured post-patch** — next run validates.
- **Carry forward:** crucible's value is *earned belief revision + preserved tension*, not agreement; compare against agenotype on the SAME prompt before trusting either; watch that the dissent dial doesn't flip into "disagreeable for its own sake" (the opposite reward hack) — see [TREATISE.md § II](./TREATISE.md), [Belief-revision crucible](./LESSONS_AND_BANGERS.md#belief-revision-crucible--2026-06-16)

### Agora politeness inflation — 2026-06-17

- **Proxy optimized:** human approval rate (a 🔥/👍 blob) instead of idea quality — Agardeners rubber-stamp to be nice, so every lineage reads as fit. This is the [consensus-grader](#crucible-converges-judge-rewards-consensus--2026-06-17) hack relocated to the human layer.
- **Bedrock check:** reactor-attributed verdicts + disagreeableness-weighted aggregation; verdict-score vs. downstream real use.
- **Symptom:** verdict scores cluster high; ♻️/🧊 near-zero; energy budget stops discriminating between spawners.
- **Counter-mutation:** (1) reactions map to bedrock **dimensions** (🔥 novel / ✅ feasible / ♻️ derivative / 🧊 not-it), not one approval blob; (2) require a one-line **"because"** for high marks; (3) identify the reactor and apply a **human disagreeableness weight** — a Falsifier human's 🧊 outweighs an Optimist's 🔥.
- **Repro trigger:** an Agora window where >90% of reactions are positive and no "because" is attached.
- **Bedrock assertion:** over N verdicts, dimension entropy stays above a floor **and** at least some lineages actually starve; if every lineage stays fed, the Agora is a politeness mirror — fails.
- **Carry forward:** the disagreeableness dial applies to **human reactors** too; one optimist must not inflate a lineage. See [Cooperation dominates, dissent mutates](./LESSONS_AND_BANGERS.md#cooperation-dominates-dissent-mutates--2026-06-17), [MEMORY: Agora as first executable Bedrock](./MEMORY.md#agora-as-first-executable-bedrock--2026-06-17).

### Agora survivorship bias (label leakage) — 2026-06-17

- **Proxy optimized:** "what the internal critic already liked" — only ideas that clear the pre-post filter ever get human labels, so the verdict dataset (and any **proxy-Lα** trained on it) inherits and amplifies the critic's bias.
- **Bedrock check:** periodic random / low-confidence posts; compare human verdicts on filtered-in vs. randomly-surfaced ideas.
- **Symptom:** proxy-Lα agreement with humans is high on posted ideas but collapses on held-out random ideas; novel side-ideas never reach the channel.
- **Counter-mutation:** reserve a fraction of Agora posts for **exploration** (random / low-internal-score ideas) to calibrate the labeler; tag `sprout` (process) vs. `afrit` (outcome) so the bias is measurable on each axis separately.
- **Repro trigger:** disable exploration posting; train a proxy on filtered verdicts only.
- **Bedrock assertion:** proxy-Lα accuracy on a held-out random sample stays within a tolerance of its accuracy on filtered posts; a sharp drop means the dataset is biased — fails.
- **Carry forward:** exploration belongs in the **labeling**, not just the generation — you cannot learn a judge from only the cases you pre-approved.

### Goodhart on "cool" — 2026-06-17

- **Proxy optimized:** "cool" defined as whatever earns 🔥 — once the reaction *is* the target, the organism breeds surprising-but-useless ideas (a clickbait organism).
- **Bedrock check:** the reaction is **one** bedrock input only; promotion still requires correlation with downstream verifiable value (held-out judge / real use) — the [`bedrock/`](./bedrock/README.md) correlation gate.
- **Symptom:** verdict 🔥-scores rise while feasibility/usefulness (✅) stagnates or falls; ideas optimize for novelty theater.
- **Counter-mutation:** keep the human reaction gated by eventual real-world correlation; never let 🔥-rate **alone** allocate energy; "gate before propagate" or it's memetic cancer ([TREATISE § VI](./TREATISE.md#vi-heredity--agenome-aphenome-extended-aphenotype)).
- **Repro trigger:** wire energy budget to 🔥-count directly with no feasibility / correlation term.
- **Bedrock assertion:** when 🔥 and ✅ diverge over N runs, energy follows ✅/correlation, not 🔥; if energy tracks 🔥 alone, the metric is hacked — fails.
- **Carry forward:** "cool" is a proxy for "good"; the apex bet (better definitions of better) demands the reaction stay anchored. See [TREATISE § VIII](./TREATISE.md#viii-the-search-for-better-definitions-of-better).

### Myth over territory — 2026-06-17

- **Proxy optimized:** the narrative that *flatters and coheres* instead of the cause that *predicts* — the agreed-upon story ("they succeeded because they believe in themselves") over the unglamorous driver ("geography, resources, timing"). The map beats the territory because the map is prettier.
- **Bedrock check:** does the causal claim **predict held-out cases**? If "self-belief → success," it should hold for other nations; geography does, belief doesn't.
- **Symptom:** "why-it-happened" outputs read as inspiring and quotable but don't generalize; eloquence rises while predictive power flatlines.
- **Counter-mutation:** demand the unflattering, *predictive* cause; score explanations on held-out generalization, not prose; weight a Falsifier human in the Agora to puncture flattering narratives.
- **Repro trigger:** ask the Insight Machine "why did X succeed?" with no held-out generalization test required.
- **Bedrock assertion:** over N explanations, the promoted cause predicts held-out cases better than the flattering narrative; if eloquence wins, it's myth — fails.
- **Carry forward:** history is an agreed-upon fiction; the Insight Machine's past-tense job is map→territory. See [The Insight Machine has tenses](./LESSONS_AND_BANGERS.md#the-insight-machine-has-tenses--2026-06-17), [TREATISE § XIV](./TREATISE.md#xiv-applications--the-insight-machine-the-tenses-of-bedrock-and-rk-allocation).

### Prediction cherry-picking (no pre-registration) — 2026-06-17

- **Proxy optimized:** prediction "accuracy" computed only over the calls that came true — survivorship bias in your *own* forecasts.
- **Bedrock check:** pre-registration — every timestamped call logged *before* resolution and scored win or lose.
- **Symptom:** a glowing hit-rate, but the losing calls were quietly never recorded; energy inflates on phantom skill (the paper-bet version of [Agora survivorship bias](#agora-survivorship-bias-label-leakage--2026-06-17)).
- **Counter-mutation:** append-only **pre-registered** prediction ledger — mark when/where for *all* bets; score the whole book, including the ones you'd rather forget; report a proper score (e.g. Brier) over the full set.
- **Repro trigger:** allow post-hoc selection of which predictions to count toward the score.
- **Bedrock assertion:** prediction count in the ledger ≈ calls actually made (no silent drops); score computed over the full book; if only winners survive, fails.
- **Carry forward:** paper bets only count as bedrock if you pre-register the losers too. See [Paper-bet bedrock](./LESSONS_AND_BANGERS.md#paper-bet-bedrock--falsify-predictions-for-free--2026-06-17).

### Zeitgeist vibe laundering — 2026-06-20

- **Proxy optimized:** current-feeling narrative instead of a timing-bound thesis — the answer sounds like the moment but has no why-now, no required current signals, and no prediction that can miss
- **Bedrock check:** the +/-5-year discriminator plus required current signals and a falsifiability target in the evaluator packet
- **Symptom:** "AI changes everything," "GLP-1 is big," or "autonomy is coming" scores as zeitgeist even though the answer would read the same five years earlier or later
- **Counter-mutation:** `zeitgeist_synthesis` fixtures must name dated signals, why-now, and falsifiable predictions; rubric scores timing load and falsifiability separately from topical relevance
- **Repro trigger:** create a zeitgeist case whose `solution.details` has no dated signal and whose predictions cannot be checked by a date
- **Bedrock assertion:** such a case fails `subtype_check_pass` or is re-tagged as transfer/truism; no "vibes only" thesis can pass as zeitgeist
- **Carry forward:** zeitgeist is timing-first, not trend-first — see [`case-studies/zeitgeist-synthesis-notes.md`](./case-studies/zeitgeist-synthesis-notes.md)

### Flat cascade masquerading as depth — 2026-06-20

- **Proxy optimized:** a long list of knock-on effects instead of a branched causal map with hidden dependents and synthesis
- **Bedrock check:** require breadth map → depth chains → convergence synthesis for unlock/cascade fixtures
- **Symptom:** FSD answers list "Uber, trucking, insurance, courts, parking" without explaining which substrates disappear, which branches are first-order vs hidden, or what it all converges to
- **Counter-mutation:** score cascade cases on branch structure, substrate grouping, depth chains, seams, and final synthesis; visible-entry branches are not skipped but taken deep
- **Repro trigger:** a generated answer contains many affected industries but no "because X → then Y → then Z" chains and no convergence statement
- **Bedrock assertion:** such answers cap at medium even if they name many correct industries; high scores require causal depth and synthesis
- **Carry forward:** breadth is not depth; depth is not synthesis. All three are separate gates.

### Zeitgeist signal leakage — 2026-06-20

- **Proxy optimized:** giving the agent the evaluator-only thesis or required-signal targets under the excuse that zeitgeist cases need current signals as input
- **Bedrock check:** importer distinguishes agent-visible current signals from evaluator-only required-current-signal targets, withheld thesis, and falsifiability target
- **Symptom:** a withheld zeitgeist prompt already contains the exact hidden why-now, branch map, or prediction the evaluator expects, so the model appears to recover it
- **Counter-mutation:** `schema-to-contract-mapping.md` keeps visible signal context separate from evaluator-only targets; leakage scan covers success criteria, problem text, current signals, and source notes
- **Repro trigger:** copy a `solution.details` thesis/prediction or `evaluation_focus.required_current_signals` into a `*-withheld-solution.md` file
- **Bedrock assertion:** leakage scan flags the case before it becomes a run seed; if not, the benchmark is invalid
- **Carry forward:** signals can be input; the synthesis target cannot.

### Cluster sprawl without pruning — 2026-06-20

- **Proxy optimized:** endless branch discovery after a rich unlock, where "more implications" feels like progress and the fixture never stabilizes
- **Bedrock check:** group by substrate removed, mark de-scoped branches explicitly, and require each drafted branch to carry its own falsifiable predictions
- **Symptom:** FSD-style clusters keep absorbing adjacent AI/robotics/compute topics until the case becomes a catch-all future essay
- **Counter-mutation:** umbrella + member-case structure; only split a new case when it removes a distinct substrate or governs several substrates; otherwise make it a chapter, seam, or de-scoped note
- **Repro trigger:** a cluster map adds a new branch because it is interesting but cannot name a distinct substrate, governing lens, or falsifiable prediction
- **Bedrock assertion:** the branch is either merged into an existing case, parked as a seam, or de-scoped; no unbounded cluster growth
- **Carry forward:** "Go nuts" still needs metabolism.

## Crashes & plumbing

This spike runs a test of the reproductive loop. The reproductive loop is the core of Doppl’s evolutionary loop, and it’s the part that’s most likely to crash.

Log each one so the next spike inherits the counter-mutation. Same falsifiability contract: repro trigger + bedrock assertion.

### Entry format

#### [short name] — YYYY-MM-DD

- **Crash:** what we observed (one sentence)
- **Counter-mutation:** what we changed so it can’t recur
- **Repro trigger:** the one command or sequence that used to crash
- **Bedrock assertion:** the pass/fail check that proves the fix held (e.g. exits 0, writes trace)
- **Carry forward:** one line for the next spike/kernel owner

#### Spike-folder path drift (`agenotype` vs. `genotype`) — 2026-06-17

- **Crash:** the deploy (`render.yaml rootDir`) and onboarding paths referenced `spikes/agenotype/` while the folder on disk was `spikes/genotype/` — Render build fails, `cd spikes/agenotype` dead-ends, and the crucible's `../agenotype/.env` key-fallback silently misses.
- **Counter-mutation:** resolved by renaming the folder `genotype → agenotype` to honor the A-prefix rule (commit `565d300`), so disk now matches prose; separately repointed [`render.yaml`](./render.yaml) at the root Agarden `index.html` per the deploy decision (see [MEMORY.md](./MEMORY.md)).
- **Repro trigger:** `grep -rn "spikes/agenotype" .` resolving to a missing dir; any Render build whose `rootDir` doesn't exist on disk.
- **Bedrock assertion:** *(prose for now)* every path in `render.yaml`, each `spikes/*/demo` env loop, and every `cd spikes/...` in a README resolves on disk. This is exactly the first executable check [`bedrock/`](./bedrock/README.md) should own.
- **Carry forward:** the narrative drifted from the filesystem and the immune system was empty when it happened — bedrock check #1 should be repo integrity, not idea quality.
