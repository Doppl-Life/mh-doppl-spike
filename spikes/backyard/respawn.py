#!/usr/bin/env python3
"""Re-entry: consume the watcher's respawn ticket and run another round.

Closes the loop the watcher opened:

  sprout -> agora -> human verdicts -> watcher (transformative?) -> TICKET -> respawn -> sprout …

The watcher decides; this consumes. It reads the latest open ticket, runs a fresh
backyard generation seeded by what the humans revealed, and re-bridges the new
sprouts back into the Agora — so the next round is informed, not cold.

Run (from spikes/backyard):
  ../../.venv/bin/python respawn.py            # one round from the latest ticket
  ../../.venv/bin/python respawn.py --dry-run  # show the ticket + seed, run nothing
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from agora.ledger import DEFAULT_DIR  # noqa: E402
from agora.watcher import TICKETS_NAME, latest_open_ticket  # noqa: E402
from sprout import GEN_MODEL, SCORE_MODEL, make_client, run_once  # noqa: E402


def _mark_consumed(ticket: dict, *, dir_: Path) -> None:
    """Rewrite tickets.jsonl marking the matching ticket consumed (idempotent re-entry)."""
    path = dir_ / TICKETS_NAME
    rows = []
    with path.open() as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            t = json.loads(line)
            if t.get("ts") == ticket.get("ts") and not t.get("consumed"):
                t["consumed"] = True
            rows.append(t)
    with path.open("w") as fh:
        for t in rows:
            fh.write(json.dumps(t, ensure_ascii=False) + "\n")


def main() -> None:
    ap = argparse.ArgumentParser(description="Consume a respawn ticket and run another round.")
    ap.add_argument("--n", type=int, default=5, help="sprouts to generate this round")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    ticket = latest_open_ticket(dir_=DEFAULT_DIR)
    if ticket is None:
        raise SystemExit("no open respawn ticket — run `python -m agora.watcher` first")

    print(f"respawn ticket ({ticket['ts']})")
    print(f"  reason: {ticket['reason']}")
    print(f"  seed:   {ticket['seed']}")
    print(f"  carrying forward {len(ticket.get('carry_forward', []))} overturned idea(s)")
    if args.dry_run:
        print("\n(dry-run: nothing generated)")
        return

    # Don't repeat the ideas the humans already judged; steer away from them.
    avoid = [it["idea"] for it in ticket.get("carry_forward", [])]
    client = make_client()
    run_once(client, ticket["seed"], args.n, GEN_MODEL, SCORE_MODEL, generation=0, avoid=avoid)
    _mark_consumed(ticket, dir_=DEFAULT_DIR)
    print("\nround complete. now re-bridge into the Agora:")
    print("  ../../.venv/bin/python to_agora.py --crucible --limit 5")


if __name__ == "__main__":
    main()
