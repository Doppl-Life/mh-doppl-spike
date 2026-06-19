#!/usr/bin/env python3
"""Bridge: backyard sprouts -> agora posts, carrying BOTH machine labelers.

The backyard loop already scores each idea with a single held-out judge. This
bridge turns surfaced rows into `agora.Post`s and attaches:

  - judge label   : the existing single held-out scorer (speaks afrit/sprout/weed)
  - council label : a light multi-Fusant vote (cross-lab, held OUT from the judge),
                    speaks a dimension + a dissent score

Then the Agora collects the HUMAN verdict, and `agora.agreement` shows all three
against each other. That human↔judge↔council divergence is the whole point.

Run (from spikes/backyard):
  ../../.venv/bin/python to_agora.py                 # judge + council, last 12 sprouts
  ../../.venv/bin/python to_agora.py --no-council    # judge only (no LLM calls)
  ../../.venv/bin/python to_agora.py --limit 20 --source sprouts.jsonl

Then serve:  (from repo root)  python -m agora.server
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from agora import Label, Post, append_post, load_posts  # noqa: E402
from sprout import SCORE_MODEL, chat, make_client, parse_json  # noqa: E402

# Council: cross-lab AND held out from the judge (SCORE_MODEL = qwen). Three labs.
COUNCIL_MODELS = [
    "deepseek/deepseek-v4-flash",              # DeepSeek
    "nvidia/nemotron-3-ultra-550b-a55b:free",  # NVIDIA
    "xiaomi/mimo-v2.5",                        # Xiaomi
]

COUNCIL_SYSTEM = (
    "You are one Fusant on a small council judging a single idea. Choose EXACTLY one "
    "dimension that best describes it: 'novel' (cool/non-obvious), 'feasible' "
    "(buildable/useful), 'derivative' (obvious/tried-before), or 'not-it' (wrong/dead-end). "
    'Return STRICT JSON only: {"dimension": "...", "why": "one short line"}.'
)


def council_label(client, idea: str, verify: str, models: list[str]) -> Label | None:
    """Light Fusion Council: each model casts one dimension vote; aggregate to a
    majority dimension + a dissent score (1 - mode_share)."""
    votes: list[str] = []
    whys: list[str] = []
    for model in models:
        try:
            raw = chat(
                client,
                model=model,
                system=COUNCIL_SYSTEM,
                user=f"Idea: {idea}\nCheapest test: {verify}\n\nYour one-dimension verdict as STRICT JSON.",
                temperature=0.3,
            )
            obj = parse_json(raw)
            if isinstance(obj, list):
                obj = obj[0]
            dim = str(obj.get("dimension", "")).strip().lower()
            if dim in {"novel", "feasible", "derivative", "not-it"}:
                votes.append(dim)
                whys.append(f"{model.split('/')[-1]}:{obj.get('why','')[:60]}")
        except Exception as e:  # noqa: BLE001 — a missing vote is fine; council survives
            print(f"    [council vote skip] {model}: {e}")
    if not votes:
        return None
    tally = Counter(votes)
    mode, mode_n = tally.most_common(1)[0]
    dissent = round(1 - mode_n / len(votes), 2)
    return Label(
        labeler=f"council:{len(votes)}-fusant",
        dimension=mode,
        dissent=dissent,
        note=f"votes={dict(tally)} · " + " | ".join(whys),
    )


def judge_label(row: dict) -> Label:
    """The single held-out judge already ran in backyard; it speaks in kinds."""
    return Label(
        labeler=f"judge:{row.get('score_model', SCORE_MODEL).split('/')[-1]}",
        kind=row.get("kind", "sprout"),
        score=row.get("score"),
        note=row.get("reason", ""),
    )


def load_rows(source: Path, limit: int) -> list[dict]:
    rows: list[dict] = []
    with source.open() as fh:
        for line in fh:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    # most-recent first, dedup by idea text
    seen: set[str] = set()
    picked: list[dict] = []
    for r in reversed(rows):
        idea = r.get("idea", "")
        if idea and idea not in seen:
            seen.add(idea)
            picked.append(r)
        if len(picked) >= limit:
            break
    return picked


def main() -> None:
    ap = argparse.ArgumentParser(description="Bridge backyard sprouts into the Agora.")
    ap.add_argument("--source", default="sprouts.jsonl")
    ap.add_argument("--limit", type=int, default=12)
    ap.add_argument("--no-council", action="store_true", help="judge label only, no LLM calls")
    ap.add_argument("--council-models", default=",".join(COUNCIL_MODELS))
    args = ap.parse_args()

    source = (HERE / args.source) if not Path(args.source).is_absolute() else Path(args.source)
    if not source.exists():
        raise SystemExit(f"no source ledger at {source} — run sprout.py first")

    rows = load_rows(source, args.limit)
    existing = {p.post_id for p in load_posts()}

    client = None
    if not args.no_council:
        try:
            client = make_client()
        except SystemExit as e:
            print(f"  (council off: {e})")

    council_models = [m.strip() for m in args.council_models.split(",") if m.strip()]
    posted = skipped = 0
    for r in rows:
        post_id = f"by_{r.get('sprout_id', r.get('run_id',''))}"
        if post_id in existing:
            skipped += 1
            continue
        labels = [judge_label(r)]
        if client is not None:
            cl = council_label(client, r.get("idea", ""), r.get("how_to_verify", ""), council_models)
            if cl is not None:
                labels.append(cl)
        post = Post(
            post_id=post_id,
            idea=r.get("idea", ""),
            context=r.get("seed", ""),
            spawncidence_id=f"backyard:{r.get('run_id','')}:{r.get('sprout_id','')}",
            source="backyard",
            kind=r.get("kind", "sprout"),
            why_nonobvious=r.get("why_nonobvious", ""),
            how_to_verify=r.get("how_to_verify", ""),
            labels=labels,
            exploration=(r.get("kind") == "weed"),  # surfacing a weed IS the anti-survivorship move
        )
        append_post(post)
        existing.add(post_id)
        posted += 1
        glyph = "+council" if len(labels) > 1 else "judge-only"
        print(f"  posted {post_id} [{glyph}] {post.idea[:70]}")

    print(f"\nbridged {posted} posts ({skipped} already in ledger).")
    print("serve:  python -m agora.server   (from repo root)")


if __name__ == "__main__":
    main()
