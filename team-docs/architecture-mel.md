# Doppl — Architecture Proposal

**Companion to:** `doppl_prd.md` — the PRD defines *what* to build; this doc defines *how*.

**Scope:** Stack picks, six frozen contracts in code-level Pydantic, module layout across the four PRD ownership surfaces, resolutions for all 14 PRD Section 13 open questions, invariant traceability and anti-reward-hacking enforcement, 4-engineer parallel work breakdown (Day 0 spike → Day 3 contracts freeze → Day 7 MVP cut), week-by-week sequencing through the Jun 29 demo, demo dashboard specification with component states and accessibility commitments, security requirements (sandbox, secrets, network), risks, and 8 deferred product / architecture decisions for the team to settle.

---

## Summary

Python 3.12 kernel/ML/verifier + Next.js 15 dashboard, Anthropic-first LLMs, custom async generational scheduler with first-class budget enforcement, hybrid Agenome (YAML frontmatter + markdown body mirroring Rule of Cool), hybrid energy metering with per-call token reconciliation and explicit overspend policy, SQLite live state, FastAPI+SSE between backend and dashboard (JSONL event log deferred to Week 2). Six frozen contracts (Agenome, ProblemInstance, IdeaCandidate, CritiqueResult, GenerationRecord, CheckResult). Module boundaries align to the four PRD ownership surfaces. Day 1 is a **contracts draft**; freeze on Day 3 after each owner has built a thin slice against the draft. End-of-week-1 integration smoke test runs the smallest end-to-end slice; Day 12 (Week 2) is the headline-claim full-scale run for the demo dataset.

---

## 1. Decisions at a glance

| Dimension | Pick | Why |
|---|---|---|
| Backend language | Python 3.12 | LLM + ML ecosystem; pydantic v2 for contracts |
| Dashboard | Next.js 15 + TypeScript | Demo is load-bearing; SSR + native SSE |
| LLM provider | Anthropic (Claude Sonnet 4.6 + Haiku 4.5) | Single family = clean budgeting; Sonnet for ideation/critics, Haiku for utility |
| Rubric model | Claude Opus 4.7 for final demo; Sonnet for dev iteration | Configurable via `--rubric-model` CLI flag; cost-controlled per run |
| Orchestration | Custom async Python scheduler | Generational loop is mechanically simple; budget enforcement must be first-class |
| Persistence (MVP) | SQLite WAL mode | Single-file, crash-safe, zero-ops; SSE serves from SQLite queries |
| Persistence (Week 2) | Append-only JSONL event log | Demo replay polish; not required for MVP acceptance criteria |
| Backend transport | FastAPI + SSE; bound to localhost by default | Push-based, browser-native; bearer-token gate required for non-local deployment |
| Embedding | Voyage 3 (`voyage-3-large`) | Strong on technical text; Anthropic-aligned |
| Novelty (MVP) | Cosine NN distance over rolling archive | Cheap, interpretable; MAP-Elites is Week-2 if time |
| Retrieval (critic grounding) | Exa | Designed for research/prior-art surfacing |
| Spawn allocator (week 1) | UCB1 bandit over lineages | Cheap, well-understood, easy to replace |
| Spawn allocator (week 2) | Learned value model + UCB exploration | Behind same `Allocator` interface; features enumerated at contract freeze |
| Concurrency | asyncio + bounded semaphore (single process) | No GPU; trivial budget enforcement |
| Energy metering | Virtual currency + per-call token reconciliation + max_tokens cap | One unit for all actions; unfakeable anchor; overspend is structurally impossible |
| Agenome serialization | YAML frontmatter + markdown body | Mirrors Rule of Cool; ML operates on vectors, verifier on prose |
| Fitness aggregation | Partial-credit gate + weighted sum + re-run for flaky checks | Unfakeable signal dominates without single-failure lineage collapse |
| Held-out judges | Critic pool from structurally different prior; frozen at gen-0; never feeds breeding | PRD invariant 2 anchor with shared-prior failure mode addressed |
| Critic sampling | Stratified one-per-mandate + random fill | Guarantees FR-7 distinct mandate coverage |
| Frozen contracts | 6 (Agenome, ProblemInstance, IdeaCandidate, CritiqueResult, GenerationRecord, CheckResult) | Includes objective check result type that Verifier produces and Selection consumes |

---

## 2. Invariant traceability

Every PRD Section 3 invariant has a load-bearing architectural commitment:

| Invariant | Architectural enforcement |
|---|---|
| 1. Selection is real | Energy ledger reconciled against actual token usage every call. **Overspend is structurally prevented**: each LLM call sets `max_tokens` to the agenome's remaining EU (converted via the EU↔token rate); streaming aborts at budget breach; negative-balance agenomes are excluded from the next generation's `live` set in `kernel/loop.py`. |
| 2. Fitness anchors to unfakeable signal | Partial-credit gate uses real check pass rates; council scores cannot override a check that scored below the gate threshold. Held-out judging-half (`verifier/anti_hack.py`) is seeded from a structurally different prior and never feeds selection. Held-out rubric correlation tracked per generation. |
| 3. Two-parent fusion | `Agenome.parent_ids` typed as a 0/1/2 list with a Pydantic validator: `len(parent_ids) >= 2 when generation > 0`. `kernel/fusion.py:cross()` requires two distinct parent_ids. The type contract is the enforcement boundary — not just prose. |
| 4. Scaffold is under selection | The Agenome IS the unit of state — no fixed agent class. All behavioral surface (prompt, persona, decomposition, tool perms) lives on the Agenome |
| 5. Tree terminates | Global budget cap, per-agenome cap, depth cap enforced at the `metabolism.py` boundary. Breach raises `EnergyExhausted`, ending that branch cleanly |

---

## 3. Module layout

```
doppl/
├── pyproject.toml
├── architecture.md
├── doppl_prd.md
├── doppl/                           # Python package
│   ├── contracts/                   # SHARED — drafted Day 1, frozen Day 3
│   │   ├── agenome.py
│   │   ├── problem.py
│   │   ├── idea.py
│   │   ├── critique.py
│   │   ├── check.py                 # NEW: CheckResult (verifier→selection seam)
│   │   ├── generation.py
│   │   └── events.py                # Demo event stream types
│   ├── kernel/                      # Owner 1
│   │   ├── loop.py                  # Generation scheduler
│   │   ├── metabolism.py            # Energy ledger + reconciliation + overspend policy
│   │   ├── fusion.py                # Crossover + LLM-mediated splice + validation
│   │   ├── mutation.py              # Persona jitter, prompt edits
│   │   ├── seed.py                  # Rule of Cool ingestion
│   │   └── llm.py                   # LLMClient interface
│   ├── selection/                   # Owner 2
│   │   ├── allocator.py             # UCB1 (week 1); week-2 extension point for learned value model
│   │   ├── embeddings.py            # Voyage client + on-disk cache
│   │   ├── novelty.py               # NN distance over archive
│   │   └── fitness.py               # Aggregation rule (partial-credit gate)
│   ├── verifier/                    # Owner 3
│   │   ├── council.py               # Critic orchestration with stratified sampling
│   │   ├── critics/                 # Per-mandate prompts
│   │   │   ├── grounding.py
│   │   │   ├── novelty.py
│   │   │   ├── feasibility.py
│   │   │   └── falsification.py
│   │   ├── retrieval.py             # Exa client + cache
│   │   ├── checks/                  # Objective checks per domain
│   │   │   ├── code_transfer.py     # MVP
│   │   │   └── math_puzzle.py       # Week-0 Plan B candidate
│   │   ├── sandbox.py               # AST-enforced allowlist + resource limits
│   │   └── anti_hack.py             # Held-out partition + rotation (structurally different prior)
│   ├── demo/                        # Owner 4 (Python side)
│   │   ├── server.py                # FastAPI app, localhost-bound by default
│   │   ├── stream.py                # SSE event broadcaster (SQLite-backed for MVP)
│   │   └── replay.py                # Best-idea gauntlet replay
│   ├── persistence/                 # SHARED (lead-owned)
│   │   ├── db.py                    # SQLite schema + WAL setup
│   │   └── store.py                 # Repository pattern over Pydantic types
│   └── cli.py                       # `doppl run`, `doppl serve`, `doppl replay`
├── dashboard/                       # Owner 4 (TS side)
│   ├── package.json
│   ├── app/
│   │   ├── page.tsx                 # Live tree view
│   │   └── api/sse/route.ts         # Proxy to FastAPI SSE
│   └── components/
│       ├── PopulationTree.tsx
│       ├── FitnessChart.tsx
│       └── EnergyMeter.tsx
├── seeds/
│   └── rule_of_cool.md              # Gen-0 seed
├── problems/                        # ProblemInstance fixtures
│   ├── code_transfer/               # MVP checkable domain
│   │   ├── instances/
│   │   │   ├── <instance_id>/
│   │   │   │   ├── prompt.md
│   │   │   │   ├── tests.py         # Hidden test suite
│   │   │   │   └── fixtures/
│   │   │   └── ...
│   │   ├── instances.jsonl          # Index of instance ids + metadata
│   │   └── rubric.py
│   └── math_puzzle/                 # Week-0 Plan B candidate (parallel structure)
│       ├── instances/
│       ├── instances.jsonl
│       └── rubric.py
├── runs/                            # Per-run output (sqlite + retrieval cache)
└── tests/
    ├── unit/
    └── integration/
        └── test_smoke_loop.py       # End-to-end smoke test
```

`contracts/` and `persistence/` are lead-owned but everyone imports from them. Every other owner directory is self-contained. Week-2-only modules (`selection/value_model.py`, `verifier/checks/forecasting.py`, `persistence/eventlog.py`) are deliberately absent from the MVP layout; their extension points are noted in the surviving Week-1 modules (e.g., `selection/allocator.py` carries a comment marking the value-model swap site).

---

## 4. Frozen contracts (the seams)

These six Pydantic models are **drafted Day 1 morning** for owners to start building thin slices against, and **frozen Day 3** after the cross-owner sync confirms the draft survives contact with real use. Every cross-team interaction goes through them.

### 4.1 Agenome

```python
# doppl/contracts/agenome.py
from typing import Literal
from pydantic import BaseModel, Field, model_validator

class PersonaWeights(BaseModel):
    """Normalized scalar trait axes — ML operates on these."""
    novelty_bias: float = Field(0.5, ge=0, le=1)
    feasibility_bias: float = Field(0.5, ge=0, le=1)
    contrarian_bias: float = Field(0.5, ge=0, le=1)
    rigor_bias: float = Field(0.5, ge=0, le=1)
    breadth_bias: float = Field(0.5, ge=0, le=1)
    persona_note: str = ""  # free-text additive context

class DecompositionPolicy(BaseModel):
    strategy: Literal["single_shot", "rank_then_pick", "tree_search", "debate"]
    prompt_fragment: str = ""

class AgenomeMetadata(BaseModel):
    created_at: float
    mutation_log: list[str] = []
    fitness_history: list[float] = []
    cause_of_death: str | None = None

class Agenome(BaseModel):
    id: str                                    # uuid4
    generation: int
    parent_ids: list[str] = Field(default_factory=list, max_length=2)
    lineage_tag: str                           # e.g. "L7"

    # Structured (ML domain)
    persona: PersonaWeights
    tool_permissions: set[str]
    decomposition: DecompositionPolicy
    spawn_budget: int
    energy: int                                # current allowance (normalized units)

    # Free-text (LLM domain, crossover via LLM splice)
    system_prompt: str

    metadata: AgenomeMetadata

    @model_validator(mode="after")
    def _enforce_two_parent_invariant(self):
        # Invariant 3 (PRD Section 3): generation > 0 requires two distinct parents
        if self.generation > 0:
            if len(self.parent_ids) < 2:
                raise ValueError(
                    f"Agenome {self.id} at generation {self.generation} requires "
                    f"two parent_ids; got {len(self.parent_ids)}"
                )
            if len(set(self.parent_ids)) != len(self.parent_ids):
                raise ValueError(
                    f"Agenome {self.id} has duplicate parent_ids; "
                    "invariant 3 requires two distinct parents"
                )
        return self
```

**On-disk format:** YAML frontmatter (structured fields) + markdown body (`system_prompt`). Same shape as Rule of Cool, so the seed ingests as-is.

### 4.2 ProblemInstance

```python
# doppl/contracts/problem.py
from typing import Literal
from pydantic import BaseModel

class ObjectiveCheckRef(BaseModel):
    domain: str                                # e.g. "code_transfer"
    check_id: str                              # selector within the domain
    fixtures_path: str                         # relative to problems/

class HeldOutRubricRef(BaseModel):
    rubric_id: str
    held_out_judge_pool: list[str]            # judge agenome ids; never bred

class ProblemInstance(BaseModel):
    id: str
    # MVP domain set: code_transfer plus the fuzzy demo domains.
    # forecasting and math_puzzle are added to the Literal at Week 2 contract
    # extension after the Week-0 spike picks the actual second checkable domain.
    domain: Literal["code_transfer", "zeitgeist", "research"]
    prompt: str
    objective_check: ObjectiveCheckRef | None = None
    held_out_rubric: HeldOutRubricRef | None = None
```

### 4.3 IdeaCandidate

```python
# doppl/contracts/idea.py
from pydantic import BaseModel

class ReasoningStep(BaseModel):
    kind: str                                  # "reasoning" | "tool_call" | "spawn"
    content: str
    tokens_in: int
    tokens_out: int

class IdeaCandidate(BaseModel):
    id: str
    agenome_id: str
    problem_instance_id: str
    content: str                               # the idea itself
    reasoning_trace: list[ReasoningStep]
    energy_spent: int                          # post-reconciliation, normalized units
```

### 4.4 CritiqueResult

```python
# doppl/contracts/critique.py
from typing import Literal
from pydantic import BaseModel

class CriticEvidence(BaseModel):
    kind: Literal["retrieval_hit", "check_output", "citation"]
    source: str
    snippet: str

class CritiqueResult(BaseModel):
    idea_id: str
    critic_id: str                             # agenome id of the critic
    mandate: Literal["grounding", "novelty", "feasibility", "falsification"]
    score: float                               # [0, 1]
    rationale: str
    evidence: list[CriticEvidence] = []
    held_out: bool                             # if True, score never feeds selection
```

### 4.5 GenerationRecord

```python
# doppl/contracts/generation.py
from pydantic import BaseModel

class FitnessBreakdown(BaseModel):
    agenome_id: str
    council_score: float
    check_passed: bool | None                  # null when no objective check
    check_partial_score: float | None          # 0.0-1.0; null when no check
    held_out_rubric_score: float | None
    aggregate: float

class ValueModelFeatures(BaseModel):
    """Captured per-agenome from gen-0 so the Week-2 value model has training data
    matching its inference-time feature schema. Schema is frozen at contract freeze
    (Day 3) alongside the rest of the contracts."""
    persona_axes: dict[str, float]             # five scalar persona weights
    lineage_age: int                           # generations since lineage_tag origin
    critic_disagreement_variance: float        # variance of council_score across critics
    parent_fitness_mean: float | None          # mean of two parents' fitness; null at gen-0
    tool_permission_count: int

class GenerationRecord(BaseModel):
    generation: int
    population: list[str]
    fitness: list[FitnessBreakdown]
    value_features: list[ValueModelFeatures]   # parallel to fitness, indexed by agenome_id
    survivors: list[str]
    offspring: list[str]
    aggregate_metrics: dict[str, float]        # mean fitness, diversity, energy spent, etc.
```

### 4.6 Event stream (dashboard contract)

```python
# doppl/contracts/events.py
from typing import Literal
from pydantic import BaseModel

class Event(BaseModel):
    seq: int                                   # monotonic per-run
    ts: float
    kind: Literal[
        "agenome_spawned", "agenome_died",
        "idea_emitted", "critique_received",
        "fusion_started", "fusion_completed",
        "generation_started", "generation_completed",
        "energy_debited", "energy_credited",
    ]
    payload: dict                              # kind-specific
```

### 4.7 CheckResult

The Verifier produces this; Selection consumes it for fitness. Without it the verifier→selection seam isn't typed and Day-5 integration would have to invent it.

```python
# doppl/contracts/check.py
from pydantic import BaseModel
from .problem import ObjectiveCheckRef

class CheckResult(BaseModel):
    idea_id: str
    check_ref: ObjectiveCheckRef
    passed: bool                               # binary: all tests passed
    partial_score: float                       # 0.0-1.0; fraction of tests passed
    output: str                                # stdout from execution (truncated)
    error: str | None                          # stderr or sandbox-abort reason
    runs: int                                  # how many times re-run (flaky-test policy)
    runtime_ms: int
```

---

## 5. Resolutions of PRD open questions

### Q1. Orchestration
**Resolution:** Custom async Python scheduler in `kernel/loop.py`. The `Generation` class owns one generation's lifecycle: `ideate() → critique() → score() → cull() → reproduce()`. Parallel agenome execution within each phase via `asyncio.gather()` bounded by a `Semaphore` sized to the per-second token budget.
**Tradeoff:** No checkpoint/resume primitives that LangGraph gives free — a crash means restart from the last GenerationRecord. Acceptable for the 2-week scope; the SQLite source of truth makes restart deterministic.

### Q2. Energy metering
**Resolution:** Virtual currency in `metabolism.py`. 1 energy unit (EU) ≈ 100 output tokens of Sonnet equivalent. Every action has an a-priori estimate; post-call reconciliation debits the delta against the agenome's balance.
- **Spawn:** flat 50 EU (membership cost) + spawned agenome's starting energy
- **Tool call:** 10 EU + actual tokens consumed
- **Reasoning:** actual_tokens / 100
- **Verified value credits:** passing a critic mandate = +5 EU; passing the objective check = +50 EU (partial credit pro-rated)

**Overspend policy (invariant 1 enforcement):** Reconciliation alone doesn't prevent overspend mid-call — a 100-EU agenome could spend 800 EU on one long Sonnet completion before the post-call ledger update notices. To make Invariant 1 structural, not aspirational:

- Every LLM call sets `max_tokens` to `(agenome.energy * tokens_per_EU)`. Sonnet won't return more than the agenome can pay for.
- Streaming calls abort when committed tokens × per-token cost ≥ remaining EU.
- An agenome whose post-call balance is negative (possible only on the cost-estimation last-mile delta) is excluded from the next generation's `live` set in `kernel/loop.py`. The exclusion is logged as `cause_of_death: "energy_exhausted"`.

**Tradeoff:** Estimate-then-reconcile + max_tokens cap adds two phases per action and may cap legitimately long reasoning chains for high-energy agenomes. The cap is what keeps the meter honest (anti-hack invariant 1).

### Q3. Persistence
**Resolution:**
- **MVP live state:** SQLite (`runs/<run_id>/state.db`) WAL mode. Tables: `agenomes`, `generations`, `ideas`, `critiques`, `checks`, `energy_ledger`. Pydantic ↔ rows via `persistence/store.py` repository pattern.
- **MVP dashboard SSE:** FastAPI tails SQLite state changes (poll-based or LISTEN/NOTIFY via in-process pubsub) and pushes Events on the SSE stream. No separate JSONL store for MVP.
- **Week 2 (optional):** append-only JSONL event log for richer demo replay and post-hoc analysis. Scoped to Week 2 because no MVP acceptance criterion requires it; SSE already serves DR-2.

**Survives crash:** every committed SQLite transaction. Worst case: lose mid-generation in-flight ideas.
**Tradeoff:** SQLite-only MVP means demo replay is reconstructed from SQLite (slower than tailing JSONL), and AC-6 dashboard liveness depends on the SSE poll/notify implementation rather than a dedicated event stream.

### Q4. Agenome representation
**Resolution:** Hybrid. Structured fields in YAML frontmatter (`PersonaWeights`, `DecompositionPolicy`, scalars, sets); free-text in markdown body (`system_prompt`). Same file shape as Rule of Cool.
**Tradeoff:** Mixed serialization (`yaml` + raw markdown). Negligible cost vs the gain of mirroring the seed.

### Q5. Crossover semantics
**Resolution:** Per-field rules in `kernel/fusion.py`:
- **PersonaWeights scalars:** uniform crossover with blend, `child = α·A + (1-α)·B`, `α ~ U(0.3, 0.7)`.
- **tool_permissions (set):** union by default; intersection when parents disagree on a permission flagged "critical" in config.
- **DecompositionPolicy.strategy:** random pick between parents.
- **DecompositionPolicy.prompt_fragment:** LLM-mediated splice (small Sonnet call).
- **system_prompt:** LLM-mediated splice with Sonnet. Prompt: *"Compose a system prompt that inherits the strongest traits of both parents. Parent A: ... Parent B: ..."*
- **lineage_tag:** new tag minted from both parent tags (`L7+L3 → L11`).

**Splice quality guard (anti-degeneracy):** Risk row "LLM-mediated fusion splices produce garbage prompts" is High likelihood with lineage-collapse impact. The guard is not "retry once":

1. After each splice, the child agenome runs a **validation prompt** drawn from a fixed gen-0 probe set: `K = 3` short ProblemInstance prompts with known-good and known-bad reference responses, scored by a held-out Sonnet critic.
2. The child must score within 1 standard deviation of `mean(parent_A_score, parent_B_score)` on at least 2 of 3 probes.
3. If failed, the splice retries once with a different temperature seed.
4. If failed twice, fall back to **deterministic structured composition**: concat parent_A's intro paragraph + parent_B's middle + parent_A's close, dedupe, no LLM call. This produces a legible — if blander — child that still satisfies the two-parent invariant.
5. Validation cost (K × Sonnet calls × probe length) is debited from the offspring's starting energy as a "birth cost," budgeted at ~30 EU per splice.

**Tradeoff:** Validation calls cost tokens. The deterministic fallback is less expressive than LLM splice; lineage diversity may suffer when splice fails frequently. Both are measurable on the dashboard (splice failure rate, fallback rate).

### Q6. Critic grounding
**Resolution:** Exa (`verifier/retrieval.py`) for grounding + novelty mandates. Wrapped behind a `RetrievalTool` interface; local-corpus alternative noted as swap target.
**Tradeoff:** External paid API + rate limits. Caching aggressive at `runs/<run_id>/retrieval_cache/` (keyed by query hash).

### Q7. Objective checks
**Resolution:** **Code/algorithmic transfer** is the primary MVP checkable domain. A ProblemInstance presents *"this problem in domain X — find a technique from domain Y that solves it."* The IdeaCandidate's proposed transfer is executed as Python against a hidden test suite at `problems/code_transfer/instances/<instance_id>/tests.py`. Pass/fail reported per test; partial credit = passed_tests / total_tests.

**Two-domain Day-0 spike (Plan B):** `math_puzzle` transfer is built in parallel as a Plan B candidate. The Day-0 spike validates BOTH domains independently; if `code_transfer` shows no gradient, `math_puzzle` substitutes without delaying Day 1. Forecasting was evaluated and dismissed (needs held-out historical data the model wasn't trained on — fragile to pin down in a week).

**Sandbox specification (`verifier/sandbox.py`):**

- **Allowed stdlib modules (enumerated allowlist):** `math`, `itertools`, `collections`, `heapq`, `bisect`, `functools`, `operator`, `numbers`, `decimal`, `fractions`, `random`, `re`, `string`, `array`, `dataclasses`, `typing`, `enum`.
- **Blocked modules (denylist, redundant with allowlist for defense-in-depth):** `os`, `sys`, `subprocess`, `socket`, `urllib`, `requests`, `http`, `ctypes`, `multiprocessing`, `importlib`, `__builtin__`, `pickle`, `marshal`.
- **Enforcement mechanism:** AST analysis of the generated code BEFORE execution. Reject any `Import`, `ImportFrom`, `Call` to `__import__`, `getattr(__builtins__, ...)`, `exec`, `eval`, `compile`, `globals`, `locals`, or attribute access matching `__*__` outside dunder declarations. String-match enforcement is insufficient and not used.
- **Resource controls:** wall-clock timeout 10s per test; memory ceiling 256MB via `resource.setrlimit(RLIMIT_AS)`; no filesystem writes outside a per-execution scratch directory at `/tmp/doppl-sandbox-<uuid>` (read-only bind everywhere else); no child processes (`RLIMIT_NPROC=0`); no network (loopback blocked via the host's user firewall during demo).
- **Bypass behavior:** AST-rejected code aborts execution and is recorded as `error: "ast_violation: <node_type>"` in CheckResult; the idea scores 0.0 on partial credit, not "missing check."

**Live-prompt routing constraint:** DR-1's live unseen audience prompt is restricted at the API layer to non-code-execution domains (`zeitgeist`, `research`) when MVP-grade sandbox is in use. Code-transfer execution is reserved for pre-vetted instances bundled with the run. This constraint is configurable when production-grade isolation (Modal) ships.

**Tradeoff:** The allowlist is tight enough that some legitimate transfer ideas (e.g., ones needing `numpy`) won't execute. The fix is to expand the allowlist deliberately per domain, not relax enforcement.

### Q8. Idea-space embedding
**Resolution:** `voyage-3-large` on each `IdeaCandidate.content`. Novelty score = mean cosine distance to k=10 nearest neighbors in a rolling archive (FIFO of last N=500 ideas, per domain).
**Tradeoff:** Voyage is paid; cached per content hash. Local fallback (`sentence-transformers/all-MiniLM-L6-v2`) noted but not in MVP.

### Q9. Spawn allocation
**Resolution:**
- **Week 1 (MVP):** UCB1 bandit over lineages. Each lineage = one arm; reward = mean fitness of recent offspring.
- **Week 2:** learned value model. Small regressor (`lightgbm`) on `(ValueModelFeatures → realized fitness)`. **Feature set enumerated at contract freeze (Day 3) and captured per-agenome in `GenerationRecord.value_features` from gen-0 onward** — the Week-2 value model trains on the entire run history, not just the last few generations. The feature set in `ValueModelFeatures` is the contract; adding features post-freeze is a contract change.

Both behind the same interface: `Allocator.allocate(population, total_budget) → dict[agenome_id, int]`. The "swap" is a real swap because the data pipeline was designed for it from gen-0.

**Tradeoff:** UCB1 under-explores in early generations when arm counts are low — accepted MVP weakness; the value model addresses this. Capturing value features from gen-0 has a tiny per-agenome storage cost; negligible.

### Q10. Concurrency
**Resolution:** Single-process asyncio. `Semaphore(N)` bounds concurrent agenome calls per phase; N calibrated to Anthropic rate limit (≈40 concurrent for tier-2). Spawning capped by per-agenome `spawn_budget`; fan-out check in `kernel/loop.py` before `asyncio.gather()`.
**Tradeoff:** Single-process means no scale-out beyond one machine. Fine for 2 weeks; moonshot would need distributed asyncio (Ray actors).

### Q11. Held-out judges
**Resolution:**

- **Pool construction:** the critic pool is partitioned at gen-0 into `breeding_half` and `judging_half`. Critically, the two halves are **seeded from structurally different priors** — `breeding_half` mutates from Rule of Cool; `judging_half` mutates from a hand-authored adversarial seed (a different system_prompt with different persona scalars). This prevents the shared-prior failure mode where both halves drift in lockstep.
- **Freezing:** `judging_half` critics are **frozen at gen-0** — they do not mutate, do not breed, and are not regenerated mid-run. Their job is to be the unchanging measuring stick.
- **Critic rotation per generation:** each IdeaCandidate is critiqued by a **stratified sample** of `panel_size` critics: one critic per mandate is drawn deterministically from the per-mandate `breeding_half` subset, then remaining slots fill randomly. With four mandates and `panel_size >= 4`, this guarantees PRD FR-7 ("distinct mandates") for every idea — random uniform sampling does NOT (~9% all-four coverage at panel_size=4).
- **Held-out scoring:** judging_half critics produce CritiqueResult with `held_out=True`. The fitness aggregator skips these for selection but writes them to GenerationRecord for held-out rubric correlation.

**Tradeoff:** Two seed lineages double the gen-0 setup cost (Sonnet calls to infer adversarial-prior persona). Frozen judging_half means we cannot evolve the judges themselves — that's the explicit moonshot scope, not week-2.

### Q12. Held-out rubric
**Resolution:** A rubric is a Python function `rubric(idea, problem, model) → float` in `problems/<domain>/rubric.py`. The model is **configurable via `--rubric-model` CLI flag**:

- **Dev iteration (default):** Claude Sonnet 4.6. Fast, cheap, suitable for week-1 integration sprint and tuning.
- **Demo measurement:** Claude Opus 4.7. Higher-quality rubric judgment for the headline-claim demo dataset (Day 12).

Generation-over-generation improvement = mean rubric score per generation, plotted over time. Baseline is gen-0 mean.

**Rubric-LLM safety net:** Per-generation correlation between rubric score and objective-check pass rate is computed where both exist; divergence is a first-class dashboard metric. On fuzzy domains (no objective check), divergence cannot be computed and the rubric is the only signal — the rubric-LLM failure mode is acknowledged and feeds the Deferred / Open Questions discussion of rubric model family.

**Tradeoff:** Rubric is itself an LLM call; correlation tracking is the safety net on checkable domains. Fuzzy domains have no anchor — this is a known limitation surfaced in Deferred / Open Questions.

### Q13. Fitness aggregation
**Resolution:** Partial-credit gate + weighted sum, with re-run policy for flaky checks.

```python
def aggregate(idea, critiques, check_result):
    breeding_critiques = [c for c in critiques if not c.held_out]
    council = mean(c.score for c in breeding_critiques) if breeding_critiques else 0.5

    if check_result is None:
        # Fuzzy domain — no objective anchor.
        # Council alone; aggregator caller must surface this as a "no-check" warning
        # on the dashboard so the rising fitness curve is read in context.
        return council

    # Partial-credit gate: scale council by check performance, with a soft floor
    # so a single flaky failure doesn't kill a lineage.
    check_score = check_result.partial_score  # 0.0-1.0
    if check_result.runs == 1 and check_score < 0.1:
        # Possible flaky failure; one re-run already enqueued via verifier.checks
        # before this aggregator is called. If still <0.1 after re-run, accept.
        pass
    return 0.6 * check_score + 0.4 * council
```

**Re-run policy:** A check that returns `partial_score < 0.1` on its first run triggers a single re-run (re-execution of the same generated code against the same fixtures). The re-run result replaces the first. This absorbs infrastructure noise (timeout under load, nondeterministic seed) without inflating the check budget significantly.

**Why not a hard binary gate:** A hard gate at `passed != True` returns 0.0 for any failure, destroying the gradient (9/10-pass scores identically to null answer) and amplifying flakiness into lineage death. Partial credit preserves the selection signal while still favoring full-pass solutions.

**Tradeoff:** 0.6/0.4 weights are starting numbers; tunable per domain via config. Soft floor + re-run adds one extra execution per flaky case; budget impact is small.

### Q14. Seed ingestion
**Resolution:** `kernel/seed.py` reads `seeds/rule_of_cool.md`. The YAML frontmatter (`name`, `description`) and markdown body parse directly. The body becomes `system_prompt`. Persona is inferred from the prose by a one-time Sonnet call: *"Read this skill. Output `PersonaWeights` scalars."* `tool_permissions` = empty set (Rule of Cool uses none). `decomposition.strategy = "rank_then_pick"`, `prompt_fragment` extracted from the "How to think" section.

Initial population = the seed + 19 mutated variants (`mutation.py:mutate()` applied 19 times with different RNG seeds). The adversarial-prior seed used to bootstrap `judging_half` is hand-authored (not Sonnet-inferred) to ensure structural difference from Rule of Cool.

**Tradeoff:** Sonnet-inferred persona is a one-time cost; output is reviewed by team before locking in. Persona scalars are then editable in the seed YAML.

---

## 6. Data flow

```
┌────────────────────────────────────────────────────────────────────┐
│                      Per-generation cycle                            │
│                                                                     │
│  kernel.loop  ──▶  ideate (asyncio.gather over live agenomes)       │
│       │              │                                              │
│       │              ▼                                              │
│       │         IdeaCandidate ─▶ persistence.store (SQLite)         │
│       │              │                                              │
│       │              ▼                                              │
│       │         verifier.council (stratified sample)                │
│       │              │                                              │
│       │              ▼                                              │
│       │        CritiqueResult ──▶  persistence.store                │
│       │              │                                              │
│       │              ▼                                              │
│       │        verifier.checks (sandbox + re-run on flaky)          │
│       │              │                                              │
│       │              ▼                                              │
│       │        CheckResult ────▶   persistence.store                │
│       │              │                                              │
│       │              ▼                                              │
│       │      selection.fitness (partial-credit gate)                │
│       │              │                                              │
│       │              ▼                                              │
│       │      selection.allocator (UCB1 or value model)              │
│       │              │                                              │
│       │              ▼                                              │
│       │      kernel.fusion (splice + validation + fallback)         │
│       │              │                                              │
│       │              ▼                                              │
│       │      kernel.mutation                                        │
│       │              │                                              │
│       │              ▼                                              │
│       │      Next-gen Agenomes ──▶ persistence.store                │
│       │                                  │                          │
│       └──────  GenerationRecord ──▶ persistence.store               │
│                  (incl. value_features per agenome)                 │
│                                          │                          │
└──────────────────────────────────────────┼──────────────────────────┘
                                           ▼
                                 demo.server (FastAPI, localhost)
                                           │
                                  /sse stream (SQLite-backed)
                                           ▼
                                    Next.js dashboard
```

SQLite is the single source of truth. The dashboard SSE stream is derived from SQLite state changes (in-process pubsub on writes). JSONL event log is Week-2 polish.

---

## 7. Anti-reward-hacking specifics

PRD invariant 2 has named code paths:

| Risk | Mitigation | Lives in |
|---|---|---|
| Council scores drift toward self-pleasing optimum | Held-out judging-half seeded from structurally different prior; frozen at gen-0; scores recorded but not fed to selection; rubric correlation tracked per generation | `verifier/anti_hack.py`, `selection/fitness.py` |
| Population learns to game the critic prompt | Critic agenomes (breeding-half) mutated + stratified-rotated per generation; rubric fixed per run | `verifier/council.py`, `problems/<domain>/rubric.py` |
| Mandate-coverage gaming via random sampling | Stratified sampling guarantees one critic per mandate per panel; uniform random would miss mandates ~91% of the time | `verifier/council.py` |
| Energy meter drift | Post-call reconciliation against actual API tokens; deltas surfaced on dashboard | `kernel/metabolism.py` |
| Energy overspend mid-call | `max_tokens` cap per call from remaining EU; streaming abort on breach; negative-balance agenomes excluded from next gen | `kernel/metabolism.py`, `kernel/loop.py` |
| Spawn-storm to dilute selection | Per-agenome `spawn_budget` enforced at fan-out; global depth cap | `kernel/loop.py`, `kernel/metabolism.py` |
| Objective check bypassed by null answer | Partial-credit aggregator treats empty/trivial check outputs as `partial_score: 0.0`, not "missing check" | `verifier/checks/*`, `selection/fitness.py` |
| Lineage death from flaky check | One re-run on `partial_score < 0.1` first runs; flaky-failure variance absorbed | `verifier/checks/*` |
| Splice degeneracy producing garbage offspring | K=3 validation probes against parent-derived score band; deterministic structured-composition fallback after 2 splice failures | `kernel/fusion.py` |
| Code-injection bypass of import allowlist | AST analysis pre-execution rejects `__import__`, `getattr(__builtins__)`, exec/eval/compile, dunder attribute access | `verifier/sandbox.py` |
| Resource exhaustion within timeout window | Memory ceiling (RLIMIT_AS 256MB), no child processes (RLIMIT_NPROC=0), no fs writes outside scratch | `verifier/sandbox.py` |

---

## 8. Work breakdown — 4 engineers, day-1 parallel

Day 1 morning produces a **contracts draft**, not a freeze. Owners build thin slices against the draft on Days 1-2; **the Day 3 cross-owner sync is the actual freeze**. This compresses the integration risk into a 2-day window when the contracts are still mutable.

### Day 0 — Week-0 spike (PRD Section 11 requirement)

Spike runs against **two candidate domains in parallel**: `code_transfer` (primary) and `math_puzzle` (Plan B). Owner 3 leads. Output:

1. 5+ validated ProblemInstances per domain in `problems/<domain>/instances.jsonl`, structured per the `problems/<domain>/instances/<id>/tests.py` layout.
2. **Mutation moves the needle:** mutating Rule of Cool 5 ways yields measurably different pass rates on the same instance (proves selection has something to climb).
3. **Gradient is usable:** pass rates across the 5 instances span the middle range — neither all-zero (impossible to climb) nor all-perfect (already maxed). Spread > 0.4 across the 5.
4. **Critic prompts discriminate:** the four critic mandate prompts, applied to 10 known-good and 10 known-bad ideas, separate them with > 70% correct classification per mandate.

**Decision rule:** if neither domain passes (1)-(4), escalate to PRD owner before Day 1 morning. Day-1 contracts lock is conditional on one domain passing. This is **the gate that proves the core claim is even possible**.

### Day 1 morning — Contracts draft (all owners, ~2 hours)

1. Six Pydantic models in `doppl/contracts/` drafted to main (subject to Day-3 freeze).
2. Event log schema (`contracts/events.py`).
3. CLI entry point `doppl run --seed seeds/rule_of_cool.md --generations 3` exists and exits 0 with an empty implementation (smoke target).

### Day 3 — Cross-owner sync + contracts freeze

Each owner shows the canned inputs they're producing for the next owner downstream. Catches contract misuses while the contracts are still editable. After this sync, contracts are frozen for the remainder of Week 1.

### Owner profiles

| Surface | Owner profile | Primary tools |
|---|---|---|
| Kernel | Strong async Python; comfortable with abstraction design; will write most LOC | asyncio, pydantic, pytest |
| Selection / ML | Comfortable with classical ML, bandits, embeddings; can read papers when needed | numpy, voyageai, scikit-learn (lightgbm in Week 2) |
| Verifier | Best at prompt engineering + adversarial thinking; comfortable with retrieval APIs and sandbox engineering | anthropic SDK, Exa, AST sandboxing, resource module |
| Demo / Observability | Frontend craft + comfort with API streams; will own the room-facing artifact | Next.js, TypeScript, D3 (or similar) for tree viz |

### Per-owner day-by-day

#### Owner 1 — Kernel

| Day | Deliverable | Builds against |
|---|---|---|
| 1 | `kernel/loop.py` Generation scheduler skeleton (single phase: ideate). `kernel/seed.py` reads Rule of Cool into one Agenome. CLI prints "gen 0 has 1 agenome". Contracts draft contribution. | Contracts draft |
| 2 | `kernel/llm.py` thin Anthropic client. Real ideation: agenome → IdeaCandidate. `metabolism.py` v1 (constant debits, no reconciliation). Thin-slice integration with Owner 2's contracts. | Anthropic API |
| 3 | Cross-owner sync (contracts freeze). `metabolism.py` v2: estimate + reconciliation + **max_tokens cap from remaining EU** + streaming abort + negative-balance exclusion. Spawn budget + depth cap. | Anthropic token responses |
| 4 | `fusion.py`: structured crossover for scalars + LLM-mediated splice for prompts + K=3 validation + structured-composition fallback. `mutation.py`. | Anthropic API |
| 5 | Full loop: ideate → critique (stub) → fitness → cull → fusion → next gen. Wired against Owner 2's `Allocator` interface (stubbed). | Owner 2 stub |
| 6-7 | Integration with real Owner 2 + Owner 3 outputs. End-to-end smoke test green. | Real outputs |

#### Owner 2 — Selection / ML

| Day | Deliverable | Builds against |
|---|---|---|
| 1 | `selection/allocator.py` UCB1 skeleton with `Allocator` interface. `selection/fitness.py` skeleton with partial-credit aggregator. Contracts draft contribution. | Contracts draft |
| 2 | `selection/embeddings.py` Voyage client + on-disk cache. Smoke: embed 10 ideas, retrieve nearest. Thin-slice integration. | Voyage API |
| 3 | Cross-owner sync (contracts freeze). `selection/novelty.py`: archive maintenance + NN distance. Aggregator: real partial-credit gate + re-run policy + weighted sum. | None |
| 4 | UCB1 wired against canned GenerationRecord stream. `ValueModelFeatures` captured per-agenome from gen-0. Allocator API stable. | Canned data |
| 5 | Integration with Owner 1's real population. Gradient measurement: feed canned `held_out_rubric` results, plot fitness over time. | Owner 1's loop |
| 6-7 | Real integration; cross-validate rubric vs objective check correlation. Begin value model exploration for Week 2 (`lightgbm`). | Real outputs |

#### Owner 3 — Verifier

| Day | Deliverable | Builds against |
|---|---|---|
| 0 (Day 0 spike) | Two-domain spike: 5+ ProblemInstances per domain + objective-check harness for both. Mutation-moves-needle + gradient + critic-prompt discrimination validated. | None |
| 1 | Contracts draft contribution (CheckResult shape). `verifier/council.py` skeleton: takes IdeaCandidate, returns `list[CritiqueResult]` (mocked scores). `verifier/critics/grounding.py` v1 with Exa retrieval. `verifier/anti_hack.py` partition logic (structurally-different seed). | Contracts + Exa |
| 2 | All four critic mandates real (grounding, novelty, feasibility, falsification). Each is a Sonnet call with mandate-specific prompt. **Stratified sampling** in `council.py`. | Anthropic + Exa |
| 3 | Cross-owner sync (contracts freeze). Real critic council integrated against Owner 1's IdeaCandidate stream. | Owner 1 |
| 4 | `verifier/sandbox.py`: AST allowlist + RLIMIT enforcement. `verifier/checks/code_transfer.py`: re-run policy on flaky failures. Held-out + frozen-judging-half rotation live. | None |
| 5 | Council orchestration: panel_size sampling, mandate coverage check, evidence collection. Real fitness pipeline end-to-end. | Owner 1's output |
| 6-7 | Harden anti-hack; instrument critic agreement metrics; second objective-check domain (`math_puzzle`) integrated if time allows. | Real outputs |

#### Owner 4 — Demo / Observability

| Day | Deliverable | Builds against |
|---|---|---|
| 1 | `demo/server.py` FastAPI scaffold with `/sse` route reading from SQLite via in-process pubsub. Next.js scaffold with `PopulationTree.tsx` rendering mock data. State table for PopulationTree (initial / streaming / generation-boundary / error). | Contracts (events.py) + canned data |
| 2 | Real SSE stream wiring. Dashboard renders live mock-data tree. State table for FitnessChart + EnergyMeter. Thin-slice integration. | Mocked data writer |
| 3 | Cross-owner sync (contracts freeze). `PopulationTree.tsx` with real-time spawn/die animation. **Two edge types** (breeding solid, fragment-splice dashed) with legend. `EnergyMeter.tsx` per agenome. | Mocked events |
| 4 | `FitnessChart.tsx` reading GenerationRecord rows; per-generation aggregates + individual scores per state-table spec. CSS polish. **Seed-intake input contract** (length, char class, validation, loading, confirmed state). | Owner 2's fitness data (canned) |
| 5 | Integration with real SQLite-backed SSE from full pipeline. Live demo dry-run end-to-end. **Layout priority** locked: PopulationTree primary; FitnessChart, EnergyMeter secondary; seed-intake, transfer view, replay tertiary. | Real eventlog |
| 6-7 | `demo/replay.py` for best-idea gauntlet replay. Live transfer execution UI for code_transfer (pre-vetted instances only). **Gauntlet replay flow:** entry trigger (button after evolution completes), controls (play/pause/speed), state relationship to live components (separate replay variant), exit path. **Accessibility commitment:** all status encodings use ≥2 visual channels (color + shape, or color + line-style). Stage polish. | Real outputs |

### Cross-team handoff timeline

```
Day 0: Two-domain spike + critic prompt validation (gates everything)
         │
Day 1: contracts DRAFT  (shared)
         │
         ├── Owner 1 (Kernel) ───── thin slice ────┐
         │                                          │
         ├── Owner 2 (Selection) ── thin slice ────┤
         │                                          │
         ├── Owner 3 (Verifier) ─── thin slice ────┤
         │                                          │
         └── Owner 4 (Demo) ──── canned events ────┘
                                                    │
Day 3: cross-owner sync; CONTRACTS FREEZE           │
                                                    ▼
Day 5: Owner 1 needs Allocator + Aggregator       First integration
       Owner 2 needs IdeaCandidate stream
       Owner 3 needs IdeaCandidate stream
       Owner 4 needs real SSE feed
                                                    │
                                                    ▼
Day 7: smoke test green (smallest e2e slice)      MVP cut achieved
```

---

## 9. Sequencing: Week 1 vs Week 2

### Week 1 — MVP loop (PRD acceptance criteria #1–6)

**Goal:** end-to-end generational loop on the `code_transfer` domain showing measurable rubric improvement gen 0 → gen N (full-scale headline run lands Week 2 Day 12).

| Day | Milestone |
|---|---|
| 0 | Two-domain spike + critic prompt validation; gate decision |
| 1 | Contracts draft; CLI smoke runs empty pipeline; owners begin thin slices |
| 2 | Thin-slice integration prep |
| 3 | Cross-owner sync; **contracts freeze**; real critic council integrated |
| 4 | Real metabolism (overspend policy), fusion (with splice validation), sandbox (AST + RLIMIT) |
| 5 | First integration: Owner 1 + 2 wired (loop + allocator + aggregator with mocked critique) |
| 6 | Second integration: Owner 3 wired (real critic council + objective check) |
| 7 | Third integration: Owner 4 wired (live dashboard against real SSE). End-to-end smoke green. **MVP cut.** |

**Smallest end-to-end slice (Day 7 smoke target):** 3 generations, population size 10, one `code_transfer` ProblemInstance, one mandate (grounding) per critic panel. Must run before any week-1 extension.

### Week 2 — Economy, learned control, novelty tuning, viz polish, demo dataset

| Day | Milestone |
|---|---|
| 8 | Energy reconciliation hardened — validate per-agenome budget caps + overspend prevention hold across multi-generational runs |
| 9 | Novelty pressure tuned — calibrate archive size and NN distance weighting based on Week-1 population convergence data |
| 10 | Value model trained on Week-1 data captured via `GenerationRecord.value_features`; learned allocator A/B'd against UCB1 |
| 11 | Held-out rubric measurement reproducible across runs; rubric-vs-check correlation surfaced as dashboard metric |
| 12 | **Full-scale demo dataset run:** 10+ generations, population 20, 5+ ProblemInstances. This is the source of the demo's headline fitness chart, NOT the Day-7 smoke slice. |
| 13 | Dashboard polish: live transfer execution UI (pre-vetted instances), gauntlet replay, accessibility verified |
| 14 | Demo dry-run with full pipeline on a live unseen prompt (constrained to fuzzy domains per sandbox routing) |
| 15 | Demo day (Jun 29) |

### Moonshot pointers (week 3+, not built)

Architecture leaves room for, but does not build:
- **In-house fine-tuning flywheel**: every run yields `(agenome, idea, rubric_score)` triples that can train a winning-lineage distillation. The contracts already produce this dataset.
- **Weight-level fusion via open weights**: the `LLMClient` interface is provider-agnostic. Swap to an open-weight model and `kernel/fusion.py` can add a `merge_weights()` operator alongside the existing prompt splice.
- **Self-improving verifier**: critic agenomes are already Agenomes. To put them under selection, register the breeding-half pool as a population with its own fitness signal (correlation with objective check). The frozen judging-half remains the measuring stick.
- **Multi-day open-ended runs**: SQLite persistence already crash-safe. The remaining work is checkpoint/resume semantics in `kernel/loop.py`.
- **Production-grade sandbox (Modal)**: drops the live-prompt routing restriction. Today's MVP gates code execution to pre-vetted instances; Modal lifts that gate.
- **JSONL event log**: richer demo replay than SQLite reconstruction; not required for AC-6.

---

## 10. Run lifecycle

```
$ doppl run --seed seeds/rule_of_cool.md \
            --problems problems/code_transfer/instances.jsonl \
            --generations 10 \
            --population-size 20 \
            --total-budget 5000000 \         # tokens
            --cost-ceiling-usd 150 \         # hard USD cap; abort with summary if exceeded
            --rubric-model sonnet \          # sonnet for dev iteration; opus for demo measurement
            --bind localhost                 # FastAPI bind address; localhost default
```

1. CLI creates `runs/<run_id>/` (sqlite + retrieval_cache).
2. `kernel/seed.py` ingests Rule of Cool → 1 Agenome. `mutation.py` produces N-1 variants → initial population. `verifier/anti_hack.py` seeds the judging-half from the adversarial-prior file.
3. `kernel/loop.py` enters the generational loop; bounded by `--generations`, `--total-budget`, and `--cost-ceiling-usd`.
4. Dashboard server can run alongside: `doppl serve --run <run_id>` reads the same SQLite + emits SSE.
5. On completion, prints summary (rubric trajectory, best idea per problem, dashboard URL, total USD spent).
6. `doppl replay --run <run_id> --idea <idea_id>` re-runs the critic gauntlet for the chosen idea (for demo).

---

## 11. Acceptance criteria → component map (PRD Section 9)

| AC | Components |
|---|---|
| 1. Loop runs end-to-end without intervention | `kernel/loop.py`, `cli.py` |
| 2. Two-parent fusion demonstrable | `kernel/fusion.py`, `Agenome` validator, dashboard lineage view |
| 3. Critic council + one objective check | `verifier/council.py`, `verifier/checks/code_transfer.py`, `verifier/sandbox.py` |
| 4. Rubric shows measurable improvement | `selection/fitness.py`, `problems/code_transfer/rubric.py`, dashboard FitnessChart; full-scale Week 2 Day 12 run is the dataset |
| 5. Budget caps hold | `kernel/metabolism.py` (max_tokens cap + reconciliation + overspend exclusion), `kernel/loop.py` |
| 6. Dashboard renders tree + energy + fitness | `demo/server.py`, `dashboard/*`, state tables per component |

---

## 12. Demo specification (PRD Section 10)

The dashboard is load-bearing for the Jun 29 demo. This section specifies states, flows, layout, and accessibility — not just component names.

### 12.1 Demo requirements → component map

| DR | Components |
|---|---|
| DR-1. Live unseen prompt intake | Dashboard seed-intake input → `demo/server.py` `/seed` endpoint → injects ProblemInstance. **Routing constraint:** live prompts are restricted to `zeitgeist` and `research` domains; `code_transfer` execution is reserved for pre-vetted instances bundled with the run (sandbox safety gate). |
| DR-2. Live population tree | SQLite state changes → in-process pubsub → SSE → `PopulationTree.tsx` |
| DR-3. Fitness-over-time chart | `GenerationRecord` rows → `FitnessChart.tsx` |
| DR-4. Replay best idea's gauntlet | `demo/replay.py` re-runs critic panel + re-executes objective check (pre-vetted only) |
| DR-5. Generational contrast legible | PopulationTree's two edge types + lineage tags + mutation deltas |

### 12.2 Live-prompt input validation (DR-1)

`/seed` endpoint enforces:
- **Length cap:** max 2000 characters.
- **Character class:** printable Unicode only; reject control characters except `\n`, `\r`, `\t`.
- **Injection patterns:** reject inputs containing prompt-injection signatures (e.g., `<|im_start|>`, `### System:`, "ignore previous instructions" near common variations). Rejected inputs return HTTP 400 with a friendly message; the operator can preview the prompt before approving submission.
- **Domain routing:** `domain` parameter required; must be `zeitgeist` or `research` for live submissions. Attempting `code_transfer` from the live endpoint returns HTTP 403.
- **Rate limit:** one submission per 30 seconds from a single client; protects against accidental double-submit during the demo.

### 12.3 Layout priority

Three tiers, fixed for the demo:

- **Primary:** `PopulationTree.tsx` — center-stage, ~60% of screen real estate. The "watchable evolution" narrative lives here; the eye lands here first.
- **Secondary:** `FitnessChart.tsx` (top-right, ~20%), `EnergyMeter.tsx` (bottom-right strip per active agenome). Always visible.
- **Tertiary:** seed-intake input (top bar; collapses to a small "active prompt" pill after submission), transfer execution view (modal overlay only when DR-4 replay fires), gauntlet replay controls (footer when in replay mode).

The layout is fixed for the demo, not responsive — viewports below 1280px display a banner indicating "demo mode requires desktop viewport." Mobile responsive layout is explicit Week-2+ scope.

### 12.4 Component state specifications

All status encodings use **at least two visual channels** (color + shape, or color + line style, or color + label). Color alone is illegible to colorblind audience members. The accessibility commitment is verified at Day 13 demo dry-run.

#### PopulationTree.tsx states

| State | Visual treatment |
|---|---|
| Initial (pre-gen-1) | Centered placeholder text: "Awaiting first generation." No graph rendered. |
| Streaming (mid-generation) | New nodes fade in at their parent's position, animate to layout slot. Layout is per-generation, NOT per-node — incoming nodes within a generation cluster around their parents but the full re-layout only happens at generation-completed. |
| Generation boundary | Brief flash + layout re-compute + auto-pan to fit. Generation number increments in the chart header. |
| Error / stalled | If no events arrive within 30s during an active run, the tree dims to 70% opacity and shows "Run stalled — check terminal" overlay. |

**Edge types (DR-5 contrast):**
- **Breeding edge** (parent → child): solid line, arrowhead at child, color from child's lineage tag palette.
- **Fragment-splice edge** (loser's-fragment → offspring): dashed line, smaller arrowhead, gray. Annotated with a small tooltip indicating which fragment.
- **Legend:** persistent in the top-left corner naming both edge types.

**Node states:**
- Winner (top-quartile fitness): filled circle, lineage-color, thick border.
- Loser (bottom-quartile): empty circle, dimmed lineage-color, dashed thin border.
- Fragment-donor: empty circle with a small "f" badge.

#### FitnessChart.tsx states

| State | Visual treatment |
|---|---|
| Empty (pre-gen-1) | Axis rendered with placeholder text: "Generation 1 in progress." |
| Streaming | Individual idea scores plotted as light dots as critiques arrive; per-generation mean overlaid as a heavier line. Update granularity = one dot per CritiqueResult batch. |
| Axis scaling | Y-axis fixed to [0, 1] for first 2 generations to avoid early-cluster zoom-in distortion. Switches to auto-fit after gen-2. |
| Plateau / regression | If the running 3-generation mean is non-increasing for 3 consecutive generations, the chart line shifts to a muted amber color and a "plateau" annotation appears below the legend. Narrator can address it. |

Show both individual scores (dots) and per-generation aggregate (line). "Rising" is read across the line; outliers are visible in the dots.

#### EnergyMeter.tsx states

| State | Visual treatment |
|---|---|
| Initial (full) | Full bar, lineage-color. |
| Draining (mid-action) | Bar animates downward as energy debits stream in. |
| Low-threshold | Below 25%, bar shifts to amber. Below 10%, bar pulses. |
| Empty / blocked | Bar empty, "energy_exhausted" label. Agenome will not appear in next-gen `live` set. |

Each active agenome has its own meter in the bottom-right strip. Inactive agenomes (culled or exhausted) hide their meter.

#### Seed-intake input states

| State | Visual treatment |
|---|---|
| Idle | Single-line text input; placeholder: "Enter a prompt for the population (zeitgeist or research domain)." Submit button disabled when empty. |
| Validating | Submit button shows spinner. Inline error message below input on validation failure (length, char class, injection pattern, domain restriction). |
| Submitting | Submit button disabled; spinner; "Submitting prompt to population..." |
| Confirmed | Input collapses to a compact pill at top: "Active prompt: {first 60 chars}..." with a "clear" affordance. Tree begins populating. |

#### Gauntlet replay flow

| Step | Visual treatment |
|---|---|
| Entry trigger | After evolution completes, a "Replay best idea's gauntlet" button appears in the footer. |
| Active replay | Live tree + chart hide; replay-mode tree highlights the best-idea lineage path; the original critic panel re-runs visibly (one mandate at a time, with rationale text appearing). |
| Controls | Play/pause toggle; speed selector (1×, 2×, 4×); scrub bar showing critic-panel progress. |
| Exit path | "Return to live" button restores the live tree + chart (or returns to seed-intake idle if the run completed). |

### 12.5 What's deliberately out of scope for the demo dashboard

- Responsive mobile layout (Week-2+ if requested).
- Keyboard-only navigation of tree and chart (a11y commitment is visual encoding only for MVP; keyboard is Week-2+).
- Multi-run comparison view (only the current run is shown).
- Per-agenome detail drawer (clicking a node shows a tooltip, not a panel).

---

## 13. Security requirements

The system processes audience-supplied prompts that may generate code that executes in a sandbox. The threat surface is real even for a single demo. These requirements are non-negotiable for any deployment beyond a developer laptop.

### 13.1 FastAPI server

- **MVP default:** bind to `127.0.0.1` only. The `--bind` CLI flag changes this; any non-localhost bind requires `--bearer-token <secret>` to be set and the `/sse` and `/seed` endpoints to require the token in the `Authorization: Bearer` header.
- **No anonymous network access** to `/seed` from a non-localhost bind. Demo on shared venue wifi MUST either tunnel via SSH to the operator's laptop or use the bearer-token gate.
- **Operator preview required:** the live-prompt submission flow surfaces the validated prompt to the operator on a confirmation screen before it injects into the population. The operator can reject or re-route domains.

### 13.2 Sandbox (`verifier/sandbox.py`)

See Q7 for the full specification. Summary: AST-level allowlist enforcement (NOT string matching), enumerated stdlib subset, AST rejection of `__import__` / `getattr(__builtins__)` / exec / eval / compile / dunder attribute access, RLIMIT_AS memory ceiling, RLIMIT_NPROC=0 (no children), scratch-directory-only filesystem writes, network blocked at the host firewall during demo.

### 13.3 API secrets

- **All API keys** (Anthropic, Voyage, Exa) loaded exclusively from environment variables or a secrets manager. Never committed to source. Never logged.
- **Vendor-minimum scope:** use vendor-side rate-limited or read-only key plans where available.
- **Demo environment:** the operator confirms before demo start that keys in use are demo-scoped, not the team's full-budget production keys.

### 13.4 Live-prompt validation

See Section 12.2 for the validation boundary specification.

### 13.5 Resource exhaustion

See Q7 for the resource control specification. The combination of subprocess timeout (10s) + RLIMIT_AS (256MB) + RLIMIT_NPROC=0 + no fs writes outside scratch prevents the most likely exhaustion paths.

---

## 14. Risks (concrete pre-mortem)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Week-0 spike finds no checkable problem with a gradient on either candidate domain | Low (mitigated by two-domain spike) | Catastrophic — core claim unprovable | Run two-domain spike (code_transfer + math_puzzle) before Day 1; escalate to PRD owner if both fail |
| Spike gradient exists but doesn't generalize (sharp, non-smooth, or all-or-nothing) | Medium | Selection cannot climb; MVP claim fails | Tighten Day-0 acceptance: require mutation-moves-the-needle + middle-range spread (>0.4) per domain |
| Anthropic rate limits throttle population at N>~30 | Medium | Slow runs | Semaphore-bounded; request tier-3 limits ahead of time |
| LLM-mediated fusion splices produce garbage prompts | High | Lineage quality collapses without guard | K=3 validation probes; deterministic structured-composition fallback after 2 failures; failure rate surfaced on dashboard |
| Exa rate limit hit during dense critic phases | Medium | Critic grounding degrades | Aggressive caching; back-off + retry; web-search fallback |
| Dashboard SSE backpressure under high event rate | Low | Dashboard lags | Event coalescing in `demo/stream.py`; downsample animation events |
| Code-transfer sandbox bypass via dunder / exec / eval | Medium | Lab safety | AST analysis pre-execution (not string match); enumerated allowlist; RLIMIT enforcement; demo restricts live prompts to non-code domains |
| Fitness aggregator weights wrong for one domain | High | Selection signal noisy | Tune per-domain via config; surface weights on dashboard for live tuning |
| Owner integration on Day 5 reveals contract mismatch | Low (Day 3 freeze instead of Day 1) | Lost day | Day 1 contracts draft + Day 3 cross-owner sync = freeze; mismatches surface in the 2-day mutability window |
| Opus 4.7 rubric call cost or rate-limit blows budget during MVP iteration | Medium | Dev iteration stalls; AC-4 measurement delayed | `--rubric-model sonnet` for dev; `--rubric-model opus` reserved for Day 12 full-scale and Day 15 demo; rubric-cost row tracked separately in cost envelope |
| Live demo prompt routed through code-execution path | Medium | Lab safety + demo break | DR-1 routing restricts live prompts to `zeitgeist` / `research`; `/seed` returns 403 on `code_transfer` from live endpoint |
| Held-out judging-half shares Rule of Cool prior with breeders | Medium | Reward-hacking hidden by lockstep drift | `judging_half` seeded from a structurally different adversarial-prior file; frozen at gen-0 |
| Per-call energy overspend (Sonnet returns 8× estimate) | Medium | Invariant 1 hollow | `max_tokens` cap per call from remaining EU; streaming abort on breach; negative-balance excluded from next gen |
| Day-7 smoke slice extrapolated as headline claim | Medium | Demo chart looks like noise on stage | Week 2 Day 12 explicit full-scale run; headline chart drawn from that, not from smoke slice |

---

## 15. What this doc deliberately doesn't decide

- **Exact persona axes**: starting set is 5 (novelty, feasibility, contrarian, rigor, breadth); contradiction with the contract freeze surfaced in Deferred / Open Questions.
- **Mutation rates**: 10% per scalar field, 30% chance of prompt edit per generation; tuned empirically.
- **Population size**: 20 for MVP per current draft; surfaced in Deferred / Open Questions because hard-gate + small pop interacts with diversity.
- **Test framework**: pytest (no alternative considered).
- **CI**: out of scope for 2-week internal build; manual `pytest tests/` on PRs.

---

## 16. Open questions deferred to planning

- **Specific second checkable domain for Week 2**: depends on Week-0 two-domain spike findings (`code_transfer` is primary; `math_puzzle` is Plan B if primary fails).
- **Critic panel size**: starting at 4 (one per mandate via stratified sampling); could grow to 8 with rotating fill slots.
- **Specific second-domain rubric**: structure mirrors `code_transfer/rubric.py` but criteria are domain-specific.
- **Bearer token rotation policy for non-localhost demo deployments.**

---

## 17. Dependencies / assumptions

### Week 1
- **Anthropic API access** at tier-2 or better (concurrency ~40) for Sonnet and Haiku. Opus 4.7 access for rubric (lower concurrency tier acceptable since rubric runs once per idea).
- **Voyage AI API key** for embeddings (or local sentence-transformers fallback).
- **Exa API key** for prior-art retrieval (or web-search fallback).
- **Per-run USD cost envelope** secured before Day 0. Working estimate: ~$100-200 per smoke run (Sonnet-rubric, pop 10, 3 gens), ~$500-800 per full-scale demo run (Opus-rubric, pop 20, 10+ gens). Hard ceiling enforced via `--cost-ceiling-usd` flag.
- **Demo runs locally** on a developer laptop or single VM. No GPU required for MVP.
- **The Rule of Cool seed skill** is treated as immutable.
- **Hand-authored adversarial-prior seed** for judging-half bootstrapping; written by Owner 3 Day 0 alongside spike.
- **Team has 4 engineers** working in parallel from Day 1.

### Week 2
- **`lightgbm`** for value model training.
- Optional: **JSONL event log** for richer replay.

### Secrets management
- All API keys via env vars or secrets manager only. Never in source. Never in logs.

---

## 18. Deferred / Open Questions

Findings from document review that require team / PRD-owner judgment rather than mechanical resolution. Each entry preserves the reviewing persona's concern and confidence.

### From 2026-06-17 review

- **Demo positioning: live prompt fitness signal vs MVP claim** — Section 12 / Q13 (P0, product-lens, confidence 75)

  The Jun 29 demo's live unseen prompt (DR-1) will almost certainly be zeitgeist/research-class with no objective check, but the fitness aggregator on fuzzy domains is council-only — the explicitly weak judge per PRD 7.2. The audience watches generations rise on a metric the PRD itself says proves nothing. The MVP's headline claim ("N+1 beats N") gets proven on canned code_transfer, but the live demo shows the same chart rising on a signal the team has called unfakeable-only-when-checked. Decision needed: constrain DR-1 to checkable domains (loses "live unseen" flexibility), or accept the framing distinction visibly on the dashboard ("gradient-proof runs" vs "process-demo runs"). The current architecture leans toward the latter via fuzzy-domain routing in Section 12.

  <!-- dedup-key: section="section 12  q13" title="demo positioning live prompt fitness signal vs mvp claim" evidence="Q13: `check_score = 1.0 if check_result and check_result.passed else 0.5` — when no check exists, the gate is bypassed" -->

- **Rubric model family choice** — Section 5 Q12 (P1, adversarial, confidence 75)

  The held-out rubric — the metric AC-4 is measured against — calls Claude Opus 4.7 from the same family as the breeders. Per PRD invariant 2, the rubric should be the most-unfakeable measurement in the system, but a single-LLM-from-same-family judgment is the most-fakeable shape. Correlation safety net works only where an objective check exists; fuzzy demo domains have no anchor. Decision needed: switch to non-Anthropic model (GPT-5 or Gemini) or ensemble across families and report variance, accepting the added cost and operational complexity, vs accept same-family risk with the rubric-vs-check correlation as the only safety net.

  <!-- dedup-key: section="section 5 q12" title="rubric model family choice" evidence="The held-out rubric is the metric AC-4 (generation-over-generation improvement) is measured against — it IS the load-bearing demo claim. But Q12" -->

- **Sandbox isolation timing: Modal before demo vs subprocess for capstone** — Section 5 Q7 / DR-1 (P1, multiple, confidence 75)

  MVP uses subprocess + AST allowlist + RLIMIT enforcement. Production-grade isolation (Modal sandbox) is currently a stretch. Combined with DR-1's live audience prompt intake, the current routing (Section 12.2) constrains live prompts to non-code domains as the safety gate. Decision needed: invest in Modal isolation before Jun 29 to lift the live-prompt routing restriction and demo the full pipeline on live code prompts, or accept the routing restriction for the capstone and demo live prompts only on fuzzy domains.

  <!-- dedup-key: section="section 5 q7  dr1" title="sandbox isolation timing modal before demo vs subprocess for capstone" evidence="MVP executes model-generated Python via 'subprocess with timeout + restricted import allowlist.' Restricted-import allowlists" -->

- **FR-21 interpretation: per-call gating vs allocator weighting** — Section 5 Q9 / Section 11 AC map (P1, product-lens, confidence 75)

  PRD FR-21 specifies the value model is "used to gate or prioritize ideation" (pre-spend). The architecture currently uses the value model inside the allocator's lineage selection (`predicted_fitness × novelty + exploration_term`), influencing compute allocation but not gating individual ideation calls before they spend tokens. The per-call gating intent — saving tokens by skipping low-value ideation before the spend — is interpreted as satisfied indirectly by allocator weighting. Decision needed: add explicit pre-ideation gating in `kernel/loop.py` (skip agenome turn when `value_model.predict(agenome) < threshold`), or formally document the deviation as PRD-owner-approved.

  <!-- dedup-key: section="section 5 q9  section 11 ac map" title="fr21 interpretation percall gating vs allocator weighting" evidence="PRD FR-21: 'used to gate or prioritize ideation' (pre-spend)" -->

- **LLM splice fallback strategy when validation fails twice** — Section 5 Q5 / Section 13 (P2, adversarial, confidence 75)

  Architecture currently falls back to deterministic structured composition (concat segments + dedupe) after 2 splice validation failures. This preserves invariant 3 (two-parent fusion) but produces less expressive offspring than LLM splice. Decision needed: accept structured-composition fallback as the production behavior, or consider alternatives — single-parent mutation drop (violates invariant 3 occasionally), or accept invariant-3 weakening with telemetry. The current choice is in-doc; the team should confirm.

  <!-- dedup-key: section="section 5 q5  section 13" title="llm splice fallback strategy when validation fails twice" evidence="Invariant 3 (two-parent fusion) is the project's most distinctive thesis. Architecture implements it via LLM-mediated splice" -->

- **PersonaWeights flexibility: typed axes vs dict** — Section 4.1 / Section 14 (P2, scope-guardian, confidence 100)

  Section 14 says persona axes "can refine in week 1" but the frozen Day-3 contract encodes the exact 5 named fields as typed Pydantic. Axes cannot be refined without a breaking contract change across all four surfaces. Decision needed: accept the 5 axes as decided and edit Section 14 to remove the refinement language, or change `PersonaWeights` to `dict[str, float]` validated to [0,1] values so axes can be added without a contract break, documenting the starting key set as a convention.

  <!-- dedup-key: section="section 41  section 14" title="personaweights flexibility typed axes vs dict" evidence="Section 14: 'Exact persona axes: starting set is 5 (novelty, feasibility, contrarian, rigor, breadth); team can refine in week 1'" -->

- **Population size: raise pop vs soften gate vs diversity floor** — Section 15 / PRD FR-1 (P2, adversarial, confidence 75)

  Population 20 with partial-credit gate culling may leave ~3-5 high-fitness survivors per generation. Two-parent fusion needs distinct parents and lineage diversity collapses within 2-3 generations if the breeding pool is thin, undermining the visible "two parents fuse" demo requirement (DR-5). Decision needed among three options: raise MVP population to 40-50 (more compute, but breeding pool stays above ~15), soften the partial-credit floor further (more genetic variation kept alive), or add a diversity floor preventing culling below a minimum count regardless of fitness (preserves lineage tags but admits low-fitness ideas). Sensitivity analysis recommended during Day 0 spike.

  <!-- dedup-key: section="section 15  prd fr1" title="population size raise pop vs soften gate vs diversity floor" evidence="MVP uses population size 20. After hard-gate failures (Q13) cull any idea that fails the objective check to 0.0 fitness" -->

- **Live demo prompt routing — alternative framings** — Section 12 / DR-1 (P0, security-lens, confidence 100)

  The current architecture constrains live prompts to `zeitgeist` / `research` domains as the sandbox safety gate (Section 12.2, Section 13.1). This is a real positioning constraint: the demo cannot showcase live code-transfer with audience input under the MVP sandbox. Tied to the sandbox-isolation-timing decision above, but distinct: even if Modal is built in time, the operator-preview-before-injection step is a security choice (do we trust an audience submission immediately or require operator approval). Decision needed: confirm the current operator-preview design as the demo flow, or relax it (e.g., auto-inject after validation passes) for a more dynamic feel.

  <!-- dedup-key: section="section 12  dr1" title="live demo prompt routing alternative framings" evidence="DR-1 states 'accept a live, unseen prompt from the room as a ProblemInstance' with no stated sanitization or input validation" -->
