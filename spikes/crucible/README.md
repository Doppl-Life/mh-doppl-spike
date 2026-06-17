# Crucible Spike — Belief-Revision Loop

A competing **L2 spawner** to the agenotype path. Where `../agenotype` breeds a child
on blind spots, the crucible puts cheap models in a **structured argument** and
measures **belief revision under pressure**.

> One mortal spike in the Doppl ecology. Meta-narrative + lineage logs live at the
> repo root (`../../`). See [`../../TREATISE.md`](../../TREATISE.md) §§ II, VII.

## The loop

1. **Spawner** decides how many debaters (*spawncidences*) and which ecological
   archetypes to instantiate — it has latitude, but pays a metabolism cap.
2. **Openings** — each debater states a structured position privately, in parallel.
3. **Turns** — each turn forces three moves: **object** (name a peer), **steal**
   (take a good point), **change-test** (say what would move you).
4. **Finals + revision ledger** — the first-class artifact: *what I held, what
   changed, what evidence moved me, what I still reject.*
5. **Judge** scores the whole conversation: surviving idea, earned revision,
   preserved tension — not who argued loudest.

## First time only

```bash
cd spikes/crucible
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add OPENROUTER_API_KEY
chmod +x demo
```

The `demo` runner falls back to a shared repo-root `.venv` (`../../.venv`) and will
load a key from `.env`, `../../.env`, or `../agenotype/.env` if present.

## Run

```bash
./demo                                  # spawner picks the room; 2 turns
./demo --html                           # also write + open a witnessable HTML trace
./demo --prompt "Your vague question"   # custom prompt
./demo --debaters 4 --turns 3           # force room size + more turns
./demo --no-spawner                     # use the default roster (no spawner call)
./demo --cap 5 --json-out trace.json    # cap spawncidences, dump full trace
./demo --turns 2 --dissent 0.6 --html   # raise the anti-herding floor across the room
```

After an `--html` run, the root **Agarden hub** (`../../index.html`) is auto-refreshed so the
new trace is navigable. Rebuild it manually any time with `python ../../build_index.py --open`.

## Models & substrates — who's in the room

Every harness role (spawner, each debater, judge) is backed by a model you can swap.
Diversity is the asset here: prefer **one strong model per lab** over many near-identical ones.

```bash
./demo --pool                                          # list the curated cross-lab pool + judge candidates, then exit
./demo                                                 # default cross-lab cheap roster (no Gemini, by decision)
./demo --models deepseek/deepseek-v4-flash,z-ai/glm-5.2,moonshotai/kimi-k2.7-code   # manual "dropdown"
./demo --random-models --seed 7                        # semi-random, diversity-aware (round-robin across labs); seed = reproducible
./demo --premium --html                                # frontier cross-lab roster for foundational runs
./demo --composer-judge                                # held-out judge = local Cursor Composer (via cursor-agent CLI)
./demo --composer-fusant                               # inject ONE Composer debater for cross-lab variety
./demo --local --html                                  # one local model for every role (Ollama/LM Studio)
```

- **Default roster** is cross-lab and cheap: debaters `deepseek-v4-flash` + `nemotron-3-ultra:free` + `qwen3.7-plus`; spawner `deepseek-v4-flash`; **held-out judge `xiaomi/mimo-v2.5-pro`** (a lab kept *out* of the debate).
- **`--models`** is the explicit dropdown: pass any comma-separated OpenRouter slugs (cycled if fewer than debaters).
- **`--random-models` + `--seed`** samples from `MODEL_POOL` but round-robins across *shuffled labs*, so picks are lab-diverse, not pure-random. The seed makes a run reproducible / re-witnessable.
- **`--composer-*`** routes a role through the local `cursor-agent` CLI — see [COMPOSER_SPIKE_FINDINGS.md](./COMPOSER_SPIKE_FINDINGS.md). Best as the **judge** (one slow call/run; no temperature knob, so it ignores the disagreeableness dial — fine for a judge, lossy for a Fusant).
- The substrate choice and **why** are stashed into the spawner plan (`substrate_selection`, `substrate_models`) and printed per-debater (`Falsifier·glm-5.2`), so it's witnessable in console + trace JSON + HTML.

To **add a model option**, append a `ModelOption(id, lab, note)` to `MODEL_POOL` (or `JUDGE_POOL`) near the top of `crucible.py`. Verify the slug on the OpenRouter dashboard first.

## Flags

| Flag | Effect |
|------|--------|
| `--prompt` | The idea/question to put in the crucible |
| `--turns N` | Number of argument turns (default 2) |
| `--debaters N` | Force room size, overriding spawner latitude |
| `--no-spawner` | Skip the spawner; use the default roster (transfer-hunter, feasibility-hawk, falsifier) |
| `--dissent F` | Anti-herding floor `0..1` — raises every Fusant's disagreeableness to at least this (counter-mutation to consensus-grading) |
| `--cap N` | Metabolism cap on spawncidences (default 5) |
| `--models a,b,c` | Manual substrate "dropdown": comma-separated OpenRouter slugs for debaters (cycled) |
| `--random-models` | Semi-random, diversity-aware substrate insertion from `MODEL_POOL` (round-robin across labs) |
| `--seed N` | Seed for `--random-models` so the run is reproducible / re-witnessable |
| `--pool` | Print the curated `MODEL_POOL` + `JUDGE_POOL` and exit |
| `--premium` | Frontier cross-lab roster (GPT-5.4 / DeepSeek V4 Pro / Grok 4.3; Claude Opus judge, held out) |
| `--composer-judge` | Held-out judge = local Cursor Composer via `cursor-agent` (per-role; opt-in) |
| `--composer-fusant` | Inject ONE Composer debater via `cursor-agent` (per-role; opt-in) |
| `--composer-model ID` | Which `cursor-agent` model id to use for Composer roles (default `composer-2.5`) |
| `--json-out PATH` | Write the full trace JSON |
| `--html` | Write a witnessable HTML trace (extended aphenome) and open it |
| `--html-out PATH` | HTML output path (default `crucible_trace.html`) |
| `--no-open` | With `--html`, don't open the browser |
| `--local` | Use a local OpenAI-compatible model for *every* role (Ollama/LM Studio); honors `LOCAL_BASE_URL` + `LOCAL_MODEL` |

## Local / open-source models

Set `LOCAL_BASE_URL` (e.g. `http://localhost:11434/v1` for Ollama) and `LOCAL_MODEL`
(e.g. `qwen3.6:35b-a3b` or `gemma4`) in `.env`, then `./demo --local`. No API key needed for
most local servers. **Caveat:** `--local` forces *one* model for every role (spawner + debaters +
judge), which collapses cross-lab diversity — good for a free smoke test, but for a real run prefer
`--models` / `--random-models` (hosted) or mix a local debater with a hosted held-out judge. See
`MEMORY.md` "Spawner selects the substrate".

## Cost (metabolism)

Calls ≈ `1 (spawner) + N·(1 opening + T turns + 1 final) + 1 (judge)`.
Default (N≈3, T=2) ≈ 14 cheap calls. The cap keeps the combinatorics finite.
