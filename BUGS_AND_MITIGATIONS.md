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

- **Proxy optimized:** design coherence — picking genotype *or* crucible early because resolving the fork *feels* like progress
- **Bedrock check:** parallel spawner race on same prompts + held-out suite (not yet built); human witness review of whether closed fork foreclosed better topology
- **Symptom:** MEMORY entry reads like final truth; crucible never gets a fair run; “genotype over transcript” becomes dogma instead of competing hypothesis
- **Counter-mutation:** [Parallel spawners, not fork resolution](./MEMORY.md#parallel-spawners-not-fork-resolution--2026-06-16); link genotype lesson to revisit condition; log bangers from chaos discussion before building
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
- **Counter-mutation (candidate, not yet built):** judge must *justify* an empty `unresolved_tension` or be penalized; reward preserved-tension-with-sharper-args over convergence; held-out judge separate from debate; force one debater to hold (Transfer Hunter already logged honest `changed: nothing` — good signal)
- **Repro trigger:** `cd spikes/crucible && ./demo --turns 1` (default Room Vitals prompt)
- **Bedrock assertion:** over N runs, if `unresolved_tension` is usually empty AND score usually ≥8, the judge is a consensus-grader — fails; counter-mutation holds when honest non-revision and real tension survive to the verdict
- **Carry forward:** crucible's value is *earned belief revision + preserved tension*, not agreement; compare against genotype on the SAME prompt before trusting either — see [TREATISE.md § II](./TREATISE.md), [Belief-revision crucible](./LESSONS_AND_BANGERS.md#belief-revision-crucible--2026-06-16)

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
