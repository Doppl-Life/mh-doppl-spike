"""agora.watcher — the re-entry decider (the "Hermes on watch").

This is the loop you described: something sits on the ledger, sees how the human
verdicts compare to what the machines (judge + council) concluded, and — if the
humans **overturn** the machines hard enough — decides the new information is
transformative and writes a **respawn ticket**: "go again, carrying this."

Design choices:
  - The TRIGGER is heuristic (pure math, no LLM), so the bus stays dependency-free
    and the decision is auditable. A local model (Hermes/Pi) can later enrich the
    ticket's next-seed prose, but it must not own the trigger.
  - The signal that matters most is an **overturn**, not mere agreement:
      * lift  = humans liked an idea the machine WEEDED  (machine confidently wrong ↓)
      * drop  = humans killed an idea the machine HARVESTED (machine confidently wrong ↑)
    Those are exactly the active-learning points — where human labels buy the most.
  - A ticket is append-only and carries the overturned ideas forward, so the next
    round starts informed instead of cold.

CLI:
  python -m agora.watcher                 # report; write a ticket if triggered
  python -m agora.watcher --dry-run       # report only, never write
  python -m agora.watcher --min-n 5 --rate 0.34 --lifts 1
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

from .ledger import DEFAULT_DIR, load_posts, load_verdicts
from .schema import Post, Verdict

TICKETS_NAME = "tickets.jsonl"


def _machine_polarity(post: Post) -> tuple[int, int]:
    """Consensus polarity across a post's machine labels (judge + council).
    Returns (sign, n_labels). 0 = neutral/split."""
    pols = [lb.polarity() for lb in post.labels]
    if not pols:
        return 0, 0
    total = sum(pols)
    return ((total > 0) - (total < 0)), len(pols)


def _human_polarity(verdicts: list[Verdict]) -> tuple[int, int]:
    if not verdicts:
        return 0, 0
    total = sum(v.polarity() * v.weight for v in verdicts)
    return ((total > 0) - (total < 0)), len(verdicts)


def transformativeness(posts: list[Post], verdicts: list[Verdict]) -> dict:
    """Measure how hard the humans overturn the machines. JSON-serializable."""
    v_by_post: dict[str, list[Verdict]] = defaultdict(list)
    for v in verdicts:
        v_by_post[v.post_id].append(v)

    compared = 0
    overturns = lifts = drops = 0
    lift_items: list[dict] = []
    drop_items: list[dict] = []
    for p in posts:
        mp, mn = _machine_polarity(p)
        hp, hn = _human_polarity(v_by_post.get(p.post_id, []))
        if mn == 0 or hn == 0 or mp == 0 or hp == 0:
            continue
        compared += 1
        if mp == hp:
            continue
        overturns += 1
        item = {"post_id": p.post_id, "idea": p.idea, "context": p.context,
                "machine_pol": mp, "human_pol": hp}
        if hp > 0 and mp < 0:
            lifts += 1
            lift_items.append(item)
        elif hp < 0 and mp > 0:
            drops += 1
            drop_items.append(item)

    rate = round(overturns / compared, 3) if compared else 0.0
    return {
        "compared": compared,
        "overturns": overturns,
        "divergence_rate": rate,
        "lifts": lifts,            # machine said weed, humans said keep  ← gold
        "drops": drops,            # machine said harvest, humans said no
        "lift_items": lift_items,
        "drop_items": drop_items,
    }


def should_respawn(m: dict, *, min_n: int, rate: float, lifts: int) -> tuple[bool, str]:
    if m["compared"] < min_n:
        return False, f"not enough comparable posts ({m['compared']} < {min_n}) — keep collecting verdicts"
    if m["lifts"] >= lifts:
        return True, f"{m['lifts']} lift(s): humans rescued ideas the machine weeded — go mine that vein"
    if m["divergence_rate"] >= rate:
        return True, f"divergence {m['divergence_rate']:.0%} ≥ {rate:.0%}: machine read of this seed is off — re-roll"
    return False, f"divergence {m['divergence_rate']:.0%} below {rate:.0%}, no lifts — machine ≈ humans, no need to respawn"


def _next_seed(posts: list[Post], m: dict) -> str:
    """Cheap heuristic next-seed: keep the dominant context and aim at the vein the
    humans just revealed. (A Hermes/local model can rewrite this prose later.)"""
    ctx = Counter(p.context for p in posts if p.context).most_common(1)
    base = ctx[0][0] if ctx else "the same question"
    if m["lift_items"]:
        spice = m["lift_items"][0]["idea"][:120]
        return f"{base} — but go deeper near this human-favored direction the judge missed: {spice}"
    return f"{base} — the machine over-rated its own picks; surface weirder, harder-to-verify angles"


def write_ticket(posts: list[Post], m: dict, reason: str, *, dir_: Path = DEFAULT_DIR) -> dict:
    ticket = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "reason": reason,
        "metrics": {k: m[k] for k in ("compared", "overturns", "divergence_rate", "lifts", "drops")},
        "carry_forward": (m["lift_items"] + m["drop_items"])[:8],
        "seed": _next_seed(posts, m),
        "consumed": False,
    }
    dir_.mkdir(parents=True, exist_ok=True)
    with (dir_ / TICKETS_NAME).open("a") as fh:
        fh.write(json.dumps(ticket, ensure_ascii=False) + "\n")
    return ticket


def latest_open_ticket(*, dir_: Path = DEFAULT_DIR) -> dict | None:
    path = dir_ / TICKETS_NAME
    if not path.exists():
        return None
    last = None
    with path.open() as fh:
        for line in fh:
            line = line.strip()
            if line:
                t = json.loads(line)
                if not t.get("consumed"):
                    last = t
    return last


def main() -> None:
    ap = argparse.ArgumentParser(description="agora watcher — decide whether to respawn")
    ap.add_argument("--dir", default=str(DEFAULT_DIR))
    ap.add_argument("--min-n", type=int, default=5, help="min comparable posts before deciding")
    ap.add_argument("--rate", type=float, default=0.34, help="divergence-rate trigger")
    ap.add_argument("--lifts", type=int, default=1, help="lift count that always triggers")
    ap.add_argument("--dry-run", action="store_true", help="report only, never write a ticket")
    args = ap.parse_args()

    dir_ = Path(args.dir).resolve()
    posts = load_posts(dir_=dir_)
    verdicts = load_verdicts(dir_=dir_)
    m = transformativeness(posts, verdicts)

    print(f"watcher · {len(posts)} posts · {len(verdicts)} verdicts")
    print(f"  comparable: {m['compared']}  overturns: {m['overturns']}  "
          f"divergence: {m['divergence_rate']:.0%}  lifts: {m['lifts']}  drops: {m['drops']}")
    for it in m["lift_items"][:5]:
        print(f"  ▲ lift  [machine{it['machine_pol']:+d}/human{it['human_pol']:+d}] {it['idea'][:80]}")
    for it in m["drop_items"][:5]:
        print(f"  ▼ drop  [machine{it['machine_pol']:+d}/human{it['human_pol']:+d}] {it['idea'][:80]}")

    go, reason = should_respawn(m, min_n=args.min_n, rate=args.rate, lifts=args.lifts)
    print(f"\n  decision: {'RESPAWN' if go else 'HOLD'} — {reason}")
    if go and not args.dry_run:
        t = write_ticket(posts, m, reason, dir_=dir_)
        print(f"  ticket written → {dir_ / TICKETS_NAME}")
        print(f"  next seed: {t['seed']}")
    elif go:
        print("  (dry-run: ticket not written)")


if __name__ == "__main__":
    main()
