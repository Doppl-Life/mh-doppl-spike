# Discovery Spike — The Pointing Finger

An ingestion engine that goes out into the world on a schedule, harvests raw
signal from idea-and-market sources, recovers the **real problem** behind each
item, and surfaces a ranked feed of candidate seeds — shaped like the existing
[`case-studies`](../../case-studies/) contract — for Doppl to vet.

> One mortal spike in the Doppl ecology. Meta-narrative + lineage logs live at the
> repo root (`../../`). See [`../../TREATISE.md`](../../TREATISE.md).

> **It points; it does not decide.** Discovery is the *"oh, look at that — that
> might be an opportunity."* Doppl is the *"is it or isn't it — let's check."*
> The expression verticals (paper-bets, the future fake-trade module) are the
> *"let's validate."* This module is the first stage of that funnel and the one
> that can be cut without anything else breaking.

---

## Premise

Today, Doppl's seed corpus is **hand-authored**: a human writes each
`problem-statement.md` and its withheld solution. That is the bottleneck. The
intelligence of *what to point Doppl at* lives in one person's head, and it stops
the moment they stop typing.

The discovery engine automates the front of that pipeline. It does not replace
the brain — it **feeds** it. It produces typed candidate seeds from live sources
instead of from memory, so Doppl has a steady supply of opportunities it did not
have to invent. It is a **side module**: it stands on its own, it runs out of
band, and if it ever distracts from the showcase it gets cut and nothing downstream
notices.

**One sentence:** *a scheduled radar that harvests live signal, recovers the real
problem behind each item, and ranks candidates through a swappable lens — feeding
either a human or the Doppl organism with seeds it didn't have to write.*

---

## The problem we're solving

1. **Hand-authoring seeds doesn't scale.** A two-person corpus is a two-person
   ceiling on how many opportunities Doppl ever sees.
2. **Good opportunities are perishable and scattered.** A YC RFS, an HN thread, a
   mispriced Kalshi contract, an X signal — they live in different places, in
   different shapes, and the good ones don't wait.
3. **We don't yet know where to keep looking.** Some sources are gold; some look
   promising and yield nothing. Without keeping score on the *wells*, you drown in
   noise from feeds that never pay off.

The engine answers all three: it harvests broadly, normalizes everything to one
shape, recovers the root problem, ranks against a lens, and — critically — **keeps
score on its own sources** so the search gets smarter over time.

---

## What it does (high level)

A four-stage pipeline. The value is almost entirely in stages 3–4.

```
  HARVEST  →  NORMALIZE  →  RECOVER + CLASSIFY  →  SCORE + RANK
  (crawl)     (one shape)   (root problem +        (swappable lens)
                            subtype tag)
```

1. **Harvest** — scheduled, quick-fire crawls of each source. Get the high-level
   item + link, nothing fancy. This is the "scheduled runners / dispatches" layer.
2. **Normalize** — squash every source into one record:
   `{source, url, raw_text, timestamp, surface_metrics}`. Boring but load-bearing
   — it lets a Polymarket contract and an HN thread be treated the same downstream.
3. **Recover + classify** — the interesting half. For each item run the
   **Problem Recovery** stage Doppl already defines (symptom → actual problem →
   hidden variable; see [`case-study-schema.md`](../../case-studies/case-study-schema.md)),
   and tag it as `cross_domain_transfer`, `zeitgeist_synthesis`, or neither
   (using the discriminators in
   [`zeitgeist-synthesis-notes.md`](../../case-studies/zeitgeist-synthesis-notes.md)
   and [`cross-domain-transfer-notes.md`](../../case-studies/cross-domain-transfer-notes.md)).
4. **Score + rank** — score each candidate through a **swappable lens** (a rubric
   + weights, structurally like Doppl's `ScoringPolicy` / `FinalJudgeRubric`). The
   default lens is **capstone-demo-fit**. Output a ranked feed.

### Two directions in time

The engine runs the same pipeline both ways:

- **Forward — open opportunities → Doppl.** Unsolved problems and "that might be
  an opportunity" candidates get ingested as seeds for the organism to vet.
- **Backward — resolved exemplars → benchmark.** Strong, *already-resolved* cases
  ("that NVIDIA unlock is the canonical zeitgeist case") get kept as benchmark
  fixtures. The answer is already known, so each one is a free eval that grows the
  corpus.

---

## The two feedback loops

Most scraping projects only score *items* and drown in noise. This one keeps score
at two levels.

| Loop | Question | Maps to |
|------|----------|---------|
| **Score the ideas** | Is this *item* a good opportunity (for this lens)? | Doppl's fitness / `ScoringPolicy` |
| **Score the sources** | Is this *source* a good place to find opportunities? | The "is the juice worth the squeeze" budgeted bandit (`PROPOSAL.md` r/K allocation) |

The source loop is the part that makes this compound. A source's payoff is the
**downstream hit-rate** of what it yields. Productive wells earn more crawl
attention; unproven ones get probed; and a source that looks promising but keeps
producing duds is **marked as exactly that** — a first-class
`looks_good_but_isnt` verdict, the source-level analog of the amemetic immune
memory in [`BUGS_AND_MITIGATIONS.md`](../../BUGS_AND_MITIGATIONS.md). New good
sources get added deliberately as they're discovered, so the list of *places to
look* grows on evidence, not gut.

---

## The three ledgers

Everything the engine learns is an **append-only ledger** — the same spine as
Doppl's event log, the Agora verdicts, and the bugs register. This thing learns by
keeping receipts.

1. **Candidate feed** — ranked opportunities, each shaped like the case-study
   contract: `{source, url, subtype, problem_recovery, why_it_might_matter,
   lens_score}`, tagged `open → Doppl` or `resolved → benchmark`.
2. **Source registry** — the catalog of wells. Each source with what it yields,
   its hit-rate, and a status: `productive` / `unproven` / `looks_good_but_isnt`.
   This is the "place to keep them." Also where new sources get added.
3. **Exemplar keep** — the good resolved cases worth retaining as benchmark
   fixtures.

---

## Lenses (pluggable, not hardwired)

An opportunity isn't good or bad in the abstract — it's good *relative to a lens*.
The same item scores very differently under different perspectives, so the lens is
a **parameter**, not baked in:

- **capstone-demo-fit** *(default)* — can a 3–4 person team show something live in
  two weeks that makes a room go *oh*?
- **arbitrage** — is there a mispriced belief here; verification-cost ≪
  discovery-cost?
- **build-moat** — is this defensible; are we sitting on a latent asset?
- **founder-fit** — does this match what *we* can uniquely build?

Pluggable lenses are also *why this is a standalone service* and not a Doppl-only
part: different users point different lenses at the same harvested stream. Same
principle as Doppl's "the objective can evolve, the anchor cannot," applied to
discovery.

---

## Sources (first targets)

| Source | Yields | Subtype lean | Tier | Notes |
|--------|--------|--------------|------|-------|
| YC RFS | "what to build" problems | both | free | Curated fixture; refresh per YC batch. |
| Hacker News | problems, launches, discourse | both | free | Algolia `front_page`. |
| Lobsters | tech discussion | both | free | Higher signal-to-noise than HN. |
| GitHub trending | what builders just shipped | transfer | free | Recently-created repos by stars. |
| arXiv | frontier research crossing to buildable | transfer | free | Recent `cs.AI` submissions. |
| SEC EDGAR | latent-asset unlocks in filings | arbitrage | free | 8-K/10-K full-text — "bishop nobody saw" before the market reprices. **Live.** |
| Product Hunt | emerging products | zeitgeist | free | RSS. |
| Google Trends | datable why-now signal | zeitgeist | free | Breakout terms = threshold crossings. *(Unofficial endpoint; currently self-healing.)* |
| YouTube | trend surge + expert content | zeitgeist/transfer | **dispatch** | Free Data API for the trend signal; **Gemini CLI** digests the few videos worth understanding. |
| Reddit | raw unsolved-problem complaints | both | **browser** | 403s plain GET; needs `BROWSER_FETCH=1` or a connector. |
| Polymarket / Kalshi | priced beliefs | zeitgeist | (planned) | A mispriced market *is* a zeitgeist thesis with a dated falsification trigger. **Read-only — analyze, never trade.** |
| X.com / Twitter | live trend signals | zeitgeist | browser | The load-bearing why-now source — and the flakiest (auth, anti-bot). |

**Why prediction markets fit cleanly:** a market you think the crowd has wrong is
literally a `zeitgeist_synthesis` candidate — a thesis, a dated falsifiable
prediction (the resolution), and a why-now. It's the `PROPOSAL.md` paper-bets
vertical, except the targets are *discovered* instead of authored.

---

## Boundaries (load-bearing)

- **Modular and cuttable.** Nothing downstream depends on this. It can be turned
  off and Doppl still runs.
- **Mentioned, not shown.** At the Jun 29 showcase, Doppl is the engine of the
  brain, front and center. This is "a thing we built that feeds it opportunities"
  — one sentence or a verbal aside, *not* a demo'd mechanism. Cut it from the
  stage if it distracts.
- **Analyze, don't trade.** We are light-years from real bets. Polymarket/Kalshi
  are read-only signal sources. No order placement, ever, in this module. The
  future fake-trade module (timestamp + counterfactual P&L) is a *separate* add-on
  and out of scope here.
- **Fixtures-first, live-later.** Same posture as Doppl's demo strategy: prepared
  harvested fixtures are the path of record; live crawl is the risky stretch.
  Flaky sources (X, prediction markets) start as fixtures.

---

## The funnel (where this sits)

```
  DISCOVERY            DOPPL                 EXPRESSIONS
  "that might be"  →   "is it or isn't it"  →  "let's validate"
  point                check                   validate
  (this spike)         (kernel + critics)      (paper-bets, fake-trade, reality)
```

---

## What the prototype will prove

Prove the **interesting half** — the classify-and-rank brain — with zero
scraper-plumbing risk:

1. Take the **existing** [`case-studies`](../../case-studies/) corpus + a small
   batch of **live** items from the easy sources (YC RFS we have; HN + Product
   Hunt are fetchable).
2. Run each through **Problem Recovery** + the **two-subtype classifier** + the
   **capstone-demo-fit lens**.
3. Output a **ranked feed** and a first cut of the **source registry**.

If the pointing finger points at good things on a known corpus, the concept holds.
The flaky sources and the scheduled-runner plumbing come after.

---

---

## Run it (prototype is built)

```bash
cd spikes/discovery
python3 -m venv .venv && source .venv/bin/activate   # or use the repo-root ../../.venv
pip install -r requirements.txt
cp .env.example .env        # add OPENROUTER_API_KEY (or inherit the repo-root .env)
chmod +x demo
./demo
```

That harvests the corpus + live YC/HN/PH, runs the brain, writes the three
ledgers, prints the ranked feed + the held-out classifier check + the source
registry, and opens `discovery_trace.html`.

Flags:

```bash
./demo --corpus-only          # offline: corpus fixtures only (fastest, no live fetch)
./demo --lens arbitrage       # swap the scoring lens (capstone-demo-fit | arbitrage | build-moat)
./demo --reset                # clear the ledgers before running (fresh source-registry tally)
./demo --limit-corpus 8       # cap corpus items for speed
./demo --no-enrich            # skip the fetch-ladder body enrichment pass
./demo --no-open              # don't open the HTML trace
```

### Files

| File | What it is |
|------|------------|
| `harvest.py` | Source adapters → one normalized record shape. Roster: corpus, YC-RFS, HN (Algolia `front_page`), Lobsters, GitHub-trending, arXiv, Product Hunt, Reddit (browser-tier). Live sources fail soft. |
| `fetch.py` | The **fetch ladder**: free GET → Firecrawl (per-page, gated by `FIRECRAWL_API_KEY`) → browser-use/Browserbase (seam, gated by `BROWSER_FETCH=1`). Enriches thin items; records the tier used. |
| `brain.py` | The interesting half: Problem Recovery + subtype classify (±5-year test) + **signed −5..+5 lens score**. One OpenRouter call per item, strict-JSON validated with one repair. Lenses live here. |
| `ledgers.py` | The append-only ledgers + per-`(source × lens)` scoring (`productive` / `polluting` / …) + candidate lifecycle (promote/reject) + promotion rates. |
| `recipes.py` | **Source recipes**: how to traverse each source, self-correcting on break. Emits the MCP/connector backlog + the `worth_unlocking` (evidence-gated access) signal. |
| `calibrate.py` / `calibrate` | **Calibration loop**: joins predicted (lens) vs realized (promotion) and reports where the lens is mis-calibrated. The keystone. |
| `decay.py` | **Why-now decay**: ages scores by subtype (zeitgeist fast, transfer not) → effective score + auto-expire of stale zeitgeist. The feed's metabolism. |
| `mark.py` / `mark` | CLI to mark a candidate `promoted`/`rejected` (append-only) and view promotion rates per source. |
| `discovery_demo.py` | Orchestrator: harvest → enrich → brain (concurrent) → ledgers → ranked feed + held-out check + trap panel + connector backlog + promotion rates + HTML trace. |
| `ledgers/` | Output (gitignored): `candidate_feed.jsonl`, `source_registry.json`, `exemplar_keep.jsonl`, `trap_register.jsonl`, `source_recipes.json`, `promotions.jsonl`. |
| `discovery_trace.html` | The visual ranked feed + source registry (gitignored). |

### The fetch ladder (cheapest tool that works)

```
try FREE (API/RSS or plain GET)  →  if thin/blocked, FIRECRAWL (cheap, clean markdown)
  →  if JS/auth/anti-bot, BROWSER (browser-use / Browserbase — costly, last resort)

separately: DISPATCH — hand the job to an agent that's natively good at it AND that you
already pay for flat-rate (YouTube → Gemini CLI). Gated behind the tool being on PATH.
```

Researched June 2026: **don't pick one tool — match the tool to the source.** Static/API
sources are free (paying there is waste). Firecrawl (~1 credit/page) is the thin-headline
fix — it fetches the body so Problem Recovery has something to chew on. browser-use (89%
WebVoyager, OSS) / Browserbase (hosted Chrome) handle JS/login/anti-bot pages (X.com is the
canonical case) but cost per-step / per-browser-hour, so they're the last resort. The **tier
used is recorded** on each item so cost can weigh into source scoring: a well that only pays
off via expensive browser automation has a worse *effective* hit-rate than a free one.
Reddit is wired as the deliberate demonstration — it 403s plain requests, so it needs
`BROWSER_FETCH=1` and otherwise reports `unreachable`.

### Signed scoring (−5..+5) + the trap register

Scores are **signed**, separating *quality* from *harm*:

- **+1..+5** — good, in degrees. Surface it; higher = more worth Doppl's attention.
- **0** — neutral / weak fit. The "meh" pile; ignore.
- **−1..−5** — *actively bad*: a distractor, a Goodhart trap, a confidently mis-framed
  problem. Not the same as "weak" — a negative means pursuing it would *cost* the team.

Anything `≤ −3` (or flagged `is_trap`) lands in `trap_register.jsonl` with a one-line *why
it's a trap* — the discovery-layer feed into your amemetics / `BUGS_AND_MITIGATIONS.md`. A
source that produces more traps than hits earns the **`polluting`** verdict, a stronger signal
than a merely low hit-rate.

### Per-(source × lens) registry — "where to look", learned

The registry keys on `source @ lens`, because a source's value is lens-dependent: X.com is
plausibly gold for `zeitgeist` and noise for `capstone-demo-fit`; arXiv the reverse. The
engine *discovers* which wells are good for which lens from hit-rate — you don't hardwire it.

### Source recipes — *how* to traverse a source, self-correcting

The registry says a well is worth drinking from; the **recipe** says how to draw from it
(`recipes.py` → `source_recipes.json`). Each source carries `{tier, method,
tried_and_failed, mcp_candidate, status, last_verified}`. The compounding win: the engine
re-derives access only when the world **changes**, not every run — a working recipe is reused
for free; a `broken` one is the trigger to re-derive once and update the note. (We seeded the
recipes with what this build learned the hard way — e.g. "arXiv needs https," "Reddit 403s a
plain GET.")

The self-heal hook is wired: every harvest attempt calls `record_outcome(source, ok)`. On
failure the recipe flips to `broken` and appends the new failure to its history (verified:
Reddit's recipe accumulated three distinct 403 findings across runs). A source that used to
work and now doesn't is tagged `regressed` — the world moved.

This is also where the **"should this be an MCP/plugin?"** decision lives. `mcp_backlog()`
emits an evidence-based, prioritized list of *valuable-but-hard-to-traverse* sources →
the connector you'd want (browser-tier first). In the last run it surfaced: `reddit →
reddit/browser-use (required)`, `x → x-twitter MCP (required)`, `github-trending → GitHub
MCP (lifts rate limits)`. That's a backlog generated from what actually broke, not a guess.

### Candidate lifecycle — promoted / rejected (realized value)

Candidates are never removed from the feed; they're **marked**. `./mark <id> promoted|rejected
[reason]` appends to `promotions.jsonl` (append-only; the latest event is the current status,
history preserved). This gives the engine the **outcome signal** the lens score can't: lens
score is *predicted* value, promotion is *realized* value (a real decision).

`./mark --rates` (and the main run) shows **promotion rate per source** — the truest "which
wells are worth mining" signal, because it's measured against decisions, not the engine's own
prediction. Manual for now (a human makes these calls today); when the `open → Doppl` handoff
exists, Doppl writes the same status programmatically — the ledger doesn't change, only who
writes it.

```bash
./mark --list                       # candidates + current status + ids
./mark 29a1fa9c733a promoted "demoable"
./mark f014136e0f0d rejected "too vague"
./mark --rates                      # realized value per source
```

---

## What the prototype proved (and what it didn't)

**The core bet holds.** On the existing `case-studies` corpus the brain hits
**100% subtype accuracy** against the corpus's own declared tags (a held-out
check, the tags are never shown to the model), and Problem Recovery genuinely
*reframes* — e.g. it recovers the A&E waiting-room case as a
communication/perception problem, not a capacity one. Harvest → recover →
classify → score → rank runs end to end; the source registry differentiates
`productive` / `unproven` / `unreachable` wells.

**One real bug, caught by the verification step and fixed.** The first run scored
9/12 — and all three misses were the *same* error (timing-agnostic transfer cases
misread as zeitgeist). The fix was to force the model to literally run the
±5-year test (state what the case looks like moved ±5 years) *before* choosing a
subtype. That took it to 100%. The lesson: the discriminator has to be executed,
not described.

**v2 results (broad roster, signed scoring).** Across 7 sources (corpus, YC-RFS,
HN, Lobsters, GitHub-trending, arXiv, Product Hunt; Reddit correctly deferred to
the browser tier), classifier held at **100%** on the corpus. The signed scale,
after a calibration pass, spreads properly (peak at +3, a real tail to +1) and —
the payoff — the **per-source averages differentiate the wells**: corpus/YC/arXiv
land ~+3.4–3.7, HN/GitHub-trending ~+2.2–2.7. That ranking is *learned from the
data*, not hardwired: the registry answers "where should we look" on its own.

The **trap path is proven**: fed deliberate Goodhart-bait ("blockchain AI metaverse
pet-horoscope NFTs"), the brain returns −4 with a trap flag and a sharp reason
("misleads teams into a flashy but hollow idea"). On the real curated feeds it
correctly stays quiet — those sources don't contain traps, which is the right
behavior, not a miss.

**Honest limitations (expected; they confirm the design).**
- **Negatives are rare on curated feeds.** Front-page HN, top Lobsters, recent
  arXiv are already quality-filtered, so almost nothing scores negative. The trap
  machinery earns its keep on *noisy* sources (raw X.com, low-quality subreddits)
  — exactly the ones behind the browser tier. The negative end is rare by nature.
- **Live headlines are still low-substrate** unless enriched. The fetch ladder
  closes this when a `FIRECRAWL_API_KEY` is present; without one, thin items stay
  thin (and are scored conservatively, ≤ +1).
- **`looks_good_but_isnt` / `polluting` are implemented but mostly unfired** — they
  need volume from a genuinely weak source to trip, which the curated roster
  doesn't provide.

**Next moves if this graduates from spike:** (1) set `FIRECRAWL_API_KEY` to turn on
real body-enrichment; (2) wire the browser tier (browser-use/Browserbase) for
X.com + Reddit, where traps and zeitgeist signal actually live; (3) wire the
`open → Doppl` feed into the kernel as real seeds; (4) add Polymarket/Kalshi as
read-only `arbitrage`-lens sources; (5) let the registry throttle crawl budget by
per-lens hit-rate (the budgeted bandit), weighting cost by fetch tier.

---

### Calibration loop — predicted vs realized (the keystone)

The engine produces two signals that now *touch*: `lens_score` (predicted value, the
engine's guess) and `promotion` (realized value, a real decision). `./calibrate` joins
them and measures the gap, per lens and per source:

- **Re-tune the lens.** If promoted items don't out-score rejected ones, the lens isn't
  discriminating; if a source's promoted items skew low, the lens under-rates it. Verified:
  with a deliberately-promoted low-scorer, the loop reported *"lens barely discriminates
  (Δ0.75) — the rubric needs work."* That's the sprout/afrit reward idea wired — the engine
  learns what "good" means to *you*, from your choices.
- **Unlock expensive sources that earn it.** `worth_unlocking` flags a walled/expensive
  source (browser/dispatch tier) whose promotion rate clears a threshold — *evidence says
  spend the costly access here.* Verified: an X candidate promoted at 1.0 surfaced as
  *"x (promo-rate 1.0, dispatch-tier) → spend on grok-cli."* The budgeted-bandit made real,
  with promotion rate as the payoff signal.

```bash
./calibrate                 # predicted-vs-realized gap + per-source flags
```

### Why-now decay — the feed gets a metabolism

The two subtypes age oppositely, and the feed now knows it (`decay.py`). Effective score =
signed lens score × an age factor with a per-subtype half-life:

- **`zeitgeist_synthesis` decays fast** (~14-day half-life): its value is a dated why-now, and
  windows close. A +4 zeitgeist falls to +2.0 at two weeks, +0.2 by two months.
- **`cross_domain_transfer` barely decays** (~10-year half-life): a mechanism analogy is
  timeless. A +4 transfer is still ~+3.95 at two months.

So an always-on harvester doesn't just pile up — fresh signal rises, stale signal sinks.
`./mark --list` ranks by **effective** score and shows `eff / raw / age`. The run also runs an
**auto-expire sweep**: a zeitgeist candidate that decayed past a floor, is old enough to judge,
and was never promoted gets an `expired` status (append-only — "why-now window closed," not
deleted). Verified end-to-end: a 60-day +4 zeitgeist auto-expired while a same-age +4 transfer
held at +4.0. This is the metabolic counterpart to the ±5-year discriminator — that test
*classifies* timing-dependence; decay *acts* on it.

### Access tiers, in full (cheapest that works)

```
FREE (API/RSS or GET)
  → CURL_CFFI   stealth GET, mimics Chrome TLS/JA3 — defeats fingerprint walls, no JS (optional dep)
  → FIRECRAWL   clean markdown, per-page (FIRECRAWL_API_KEY)
  → BROWSER     browser-use / Browserbase — JS/auth/anti-bot, costly last resort (BROWSER_FETCH=1)

DISPATCH (route to an agent natively good at it, flat-rate on a sub you already pay for):
  → gemini-cli  YouTube (native transcript/search access)
  → grok-cli    X/Twitter (native live-firehose access — beats scraping)
```

All tiers are gated and degrade gracefully — the ladder runs free-only with nothing
installed, and each rung lights up when its tool/key is present. **Honest note:** curl_cffi
defeats TLS-fingerprint walls in general, but tested against Reddit from a datacenter IP it
still 403s (Reddit also blocks by IP) — so it's a cheap *attempt* the ladder tries before
escalating to browser, not a guaranteed fix. The recipe records that.

## Running on a schedule (the "scheduled runners" vision)

An **hourly** scheduled task (`discovery-hourly-harvest`) runs the live-only harvest
(`--limit-corpus 0`, so it skips re-scoring the static corpus), appends to the ledgers so the
source registry and promotion stats accumulate over time, and reports the top new candidates +
any traps + any sources whose recipe broke. Manage it from the **Scheduled** section in the
sidebar. This is the cheap, immediate version of the subscription-dispatch idea; the full
cost-routing layer is specced in [`ROUTING.md`](./ROUTING.md) for the TS rebuild.

## Status

v3 built and verified. **Classifier 100%** on corpus; broad roster harvesting;
**signed −5..+5 scoring** with a working **trap register**; **fetch ladder** (free
→ Firecrawl → browser seam); **per-(source × lens) registry** that ranks wells
from data. See "What the prototype proved" above.
