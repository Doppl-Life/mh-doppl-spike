# agora — the verdict bus (copy-paste-anywhere)

The **Agora** is the async public square of the Agarden: a long-running organism
surfaces ideas (sprouts, afrits, weeds) with their provenance, the **Agardeners**
react like an Instagram shot ("that fruit's sweet / sour / rotten / that's a weed"),
and every reaction is logged as a **verdict** and scored against what the machines
(the single judge and the Fusant council) thought.

This folder is **self-contained and stdlib-only**. Drop it into any repo and it
runs — no install, no OAuth, no keys. The producers that need an LLM (and an API
key) live in the spikes; the *bus* lives here and stays dependency-free. That
separation is what makes it modular.

## The loop

```
 a spike run ──► Post (idea + provenance + machine labels)  ──► agora/ledger/posts.jsonl
                                                                      │
                                          python -m agora.server  ◄───┘   (the local square)
                                                 │  Agardener reacts 🔥✅♻️🧊 (+ "because")
                                                 ▼
                                       agora/ledger/verdicts.jsonl   (append-only, attributed)
                                                 │
                                                 ▼
                                   agora.agreement(posts, verdicts)
                                   human ↔ judge ↔ council divergence
                                   (the tuning signal + the falsifier)
```

The **divergence** is the payload. If humans and the council *never* disagree,
either the council is perfect or the humans are rubber-stamping (politeness mirror)
— so this instrument has to be able to go RED. See
[`../bedrock/signal/README.md`](../bedrock/signal/README.md).

## Run it

```bash
# 1. produce posts (from a spike — example: backyard)
cd spikes/backyard && ../../.venv/bin/python to_agora.py            # judge + council
#   (or --no-council for judge-only, zero LLM calls)

# 2. open the square (from repo root)
python -m agora.server                                             # http://127.0.0.1:8787
#   react to each idea; the card reveals what the machines thought only AFTER you vote

# 3. read the matrix
open http://127.0.0.1:8787/agreement
#   or in code:
python -c "from agora import load_posts, load_verdicts, agreement, render_text; \
           print(render_text(agreement(load_posts(), load_verdicts())))"
```

## Plug a new spike in (the whole interface)

```python
from agora import Post, Label, append_post

append_post(Post(
    post_id="myspike_run7_3",
    idea="…the surfaced idea…",
    source="myspike",
    kind="sprout",                      # the spike's own call: sprout | afrit | weed
    why_nonobvious="…", how_to_verify="…",
    labels=[                            # zero or more machine reads, compared later
        Label(labeler="judge:some-model", kind="afrit", score=8, note="…"),
        Label(labeler="council:3-fusant", dimension="novel", dissent=0.33, note="…"),
    ],
    exploration=False,                  # True = deliberately low-score (anti-survivorship)
))
```

That's it. The bus owns transport (`server.py`), persistence (`ledger.py`),
schema (`schema.py`), and the agreement metric (`agreement.py`).

## Files

| File | Role |
| --- | --- |
| `schema.py` | `Post`, `Label`, `Verdict`; emoji→dimension map; the shared **polarity** (+1/0/−1) that lets any two labelers be compared |
| `ledger.py` | append-only JSONL; read upserts by `post_id` (re-post to enrich) |
| `agreement.py` | pairwise agreement + the divergence list (most-divergent first) |
| `server.py` | the local square — stdlib web "shot" + click-to-react + `/agreement` |
| `__init__.py` | the public API |

## Lexicon stub (ships with the folder, so it's not semantically naked elsewhere)

- **Agora** — the async channel where ideas are surfaced to the Agardeners and
  reactions are logged as bedrock signal. (This module.)
- **Agardener** — the one who tends the garden and reacts; human or agent.
- **sprout** — an interim idea surfaced mid-run; judged on *process* (good idea-factory?).
- **afrit** (A+fruit) — the converged, harvestable conclusion; judged on *outcome*.
- **weed** — a surfaced idea that *shouldn't* have been (low value / pull it). The
  negative class; surfacing one on purpose is the anti-survivorship move.
- **verdict** — a logged `(context, idea, human-judgment)` triple; the fitness label.
- **judge** — a single held-out scorer (different lab than the generator).
- **council** (of Fusans) — a multi-voice vote; carries a **dissent** score.
- **polarity** — sprout/afrit/weed and novel/feasible/derivative/not-it collapsed
  onto +1 / 0 / −1 so human, judge, and council land in one matrix.

Full, living definitions live in the home repo's
[`GLOSSARY.md`](../GLOSSARY.md); this stub keeps a copied folder legible on its own.

## Deliberately NOT built yet

Slack/Discord transport (swap `server.py`, keep the schema), reactor
disagreeableness weighting beyond the `weight` field, the energy-budget
metabolizer, and the proxy-Lα. Build the dumb version first; keep human reaction
*one* bedrock input, gated by downstream correlation.
