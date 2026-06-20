#!/usr/bin/env python3
"""Mark a candidate's lifecycle status — promoted / rejected (append-only).

Manual for now: a human really is making these calls today. When the open->Doppl
handoff exists, Doppl can write the same status programmatically; the ledger and
the status field don't change, only who writes them.

Usage:
  ./mark <id> promoted   [reason...]
  ./mark <id> rejected   [reason...]
  ./mark --list                       # show recent candidates with current status
  ./mark --rates                      # per-source promotion rate (realized value)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from ledgers import LEDGER_DIR, latest_statuses, mark_status, promotion_rates


def _list(limit: int = 30) -> None:
    import decay
    feed = LEDGER_DIR / "candidate_feed.jsonl"
    if not feed.exists():
        print("no candidate feed yet — run ./demo first")
        return
    rows = [json.loads(l) for l in feed.read_text(encoding="utf-8").splitlines() if l.strip()]
    # de-dupe by id, keep highest score
    by_id: dict[str, dict] = {}
    for r in rows:
        if r["id"] not in by_id or r["lens_score"] > by_id[r["id"]]["lens_score"]:
            by_id[r["id"]] = r
    statuses = latest_statuses()
    # rank by EFFECTIVE (decayed) score — fresh zeitgeist rises, stale sinks
    annotated = [decay.annotate(r) for r in by_id.values()]
    ranked = sorted(annotated, key=lambda x: x["effective_score"], reverse=True)[:limit]
    print(f"{'id':14} {'eff':>5} {'raw':>4} {'age':>5}  {'status':9} {'source':16} title")
    print("-" * 100)
    for r in ranked:
        st = statuses.get(r["id"], {}).get("status", "—")
        eff = f"{r['effective_score']:+.1f}"
        raw = f"{r['lens_score']:+d}"
        age = f"{r['age_days']:.0f}d"
        print(f"{r['id']:14} {eff:>5} {raw:>4} {age:>5}  {st:9} {r['source'][:16]:16} {r['title'][:38]}")


def _rates() -> None:
    rates = promotion_rates()
    if not rates:
        print("no promotions yet — mark some candidates first")
        return
    print(f"{'source':24} {'marked':>6} {'promoted':>8} {'rejected':>8} {'promo-rate':>10}")
    print("-" * 60)
    for src, d in sorted(rates.items(), key=lambda kv: kv[1]["promotion_rate"], reverse=True):
        print(f"{src:24} {d['marked']:>6} {d['promoted']:>8} {d['rejected']:>8} {d['promotion_rate']:>10}")


def main() -> None:
    args = sys.argv[1:]
    if not args or args[0] in {"-h", "--help"}:
        print(__doc__)
        return
    if args[0] == "--list":
        _list()
        return
    if args[0] == "--rates":
        _rates()
        return
    if len(args) < 2 or args[1] not in {"promoted", "rejected", "surfaced"}:
        print("usage: ./mark <id> promoted|rejected [reason...]   (or --list / --rates)")
        sys.exit(1)
    cid, status = args[0], args[1]
    reason = " ".join(args[2:])
    row = mark_status(cid, status, reason)
    print(f"marked {cid} -> {status}" + (f"  ({reason})" if reason else ""))


if __name__ == "__main__":
    main()
