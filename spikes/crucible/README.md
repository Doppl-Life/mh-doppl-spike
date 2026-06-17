# Crucible Spike — Belief-Revision Loop

A competing **L2 spawner** to the genotype path. Where `../genotype` breeds a child
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
load a key from `.env`, `../../.env`, or `../genotype/.env` if present.

## Run

```bash
./demo                                  # spawner picks the room; 2 turns
./demo --html                           # also write + open a witnessable HTML trace
./demo --prompt "Your vague question"   # custom prompt
./demo --debaters 4 --turns 3           # force room size + more turns
./demo --no-spawner                     # use the default roster (no spawner call)
./demo --cap 5 --json-out trace.json    # cap spawncidences, dump full trace
./demo --local --html                   # run on a local model (Gemma 4 via Ollama/LM Studio)
./demo --turns 2 --dissent 0.6 --html   # raise the anti-herding floor across the room
```

After an `--html` run, the root **Agarden hub** (`../../index.html`) is auto-refreshed so the
new trace is navigable. Rebuild it manually any time with `python ../../build_index.py --open`.

## Flags

| Flag | Effect |
|------|--------|
| `--prompt` | The idea/question to put in the crucible |
| `--turns N` | Number of argument turns (default 2) |
| `--debaters N` | Force room size, overriding spawner latitude |
| `--no-spawner` | Skip the spawner; use the default roster (transfer-hunter, feasibility-hawk, falsifier) |
| `--dissent F` | Anti-herding floor `0..1` — raises every Fusant's disagreeableness to at least this (counter-mutation to consensus-grading) |
| `--cap N` | Metabolism cap on spawncidences (default 5) |
| `--json-out PATH` | Write the full trace JSON |
| `--html` | Write a witnessable HTML trace (extended aphenome) and open it |
| `--html-out PATH` | HTML output path (default `crucible_trace.html`) |
| `--no-open` | With `--html`, don't open the browser |
| `--local` | Use a local OpenAI-compatible model (Gemma 4 / Hermes / Pi via Ollama/LM Studio); honors `LOCAL_BASE_URL` + `LOCAL_MODEL` |

## Local / open-source models

Set `LOCAL_BASE_URL` (e.g. `http://localhost:11434/v1` for Ollama) and `LOCAL_MODEL`
(e.g. `gemma4`) in `.env`, then `./demo --local`. No API key needed for most local
servers. This lets anyone on the team with Gemma 4 run a stronger-than-Flash room for free.

## Cost (metabolism)

Calls ≈ `1 (spawner) + N·(1 opening + T turns + 1 final) + 1 (judge)`.
Default (N≈3, T=2) ≈ 14 cheap calls. The cap keeps the combinatorics finite.
