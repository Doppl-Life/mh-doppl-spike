"""Calibration loop — close promotion-rate back onto the lens.

The engine produces two signals that, until now, never touched:
  - lens_score   = PREDICTED value (the engine's guess, from a rubric Claude wrote)
  - promotion    = REALIZED value (a real human/Doppl decision)

The gap between them is the most valuable datum in the system. This module measures
it, per lens and per source, and turns it into two actions:

  1. RE-TUNE THE LENS. If promoted items don't score higher than rejected ones, the
     lens isn't discriminating. If a source's promoted items skew LOW, the lens is
     under-rating that source. We surface *what kind* of thing gets promoted so the
     rubric can be nudged. (This is the sprout/afrit reward idea, finally wired:
     the engine learns what "good" means to YOU, from your choices.)

  2. UNLOCK EXPENSIVE SOURCES THAT EARN IT. A walled/expensive source with a high
     promotion rate is evidence that spending the costly access (Grok for X,
     curl_cffi/browser for Reddit) is worth it. The budgeted-bandit made real, with
     promotion rate as the payoff signal. (See registry `worth_unlocking`.)

Read-only over the ledgers. Run: ./calibrate   (or python calibrate.py)
"""

from __future__ import annotations

import json
import statistics
from collections import defaultdict
from pathlib import Path

LEDGER_DIR = Path(__file__).resolve().parent / "ledgers"

# Minimum decisions before a calibration verdict is trustworthy.
MIN_DECISIONS = 4
# If promoted-mean exceeds rejected-mean by less than this, the lens isn't
# discriminating (its score doesn't predict what actually gets chosen).
DISCRIMINATION_EPS = 1.0


def _load_feed() -> dict[str, dict]:
    path = LEDGER_DIR / "candidate_feed.jsonl"
    if not path.exists():
        return {}
    by_id: dict[str, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        r = json.loads(line)
        # keep the highest-scored sighting of each id
        if r["id"] not in by_id or r["lens_score"] > by_id[r["id"]]["lens_score"]:
            by_id[r["id"]] = r
    return by_id


def _latest_statuses() -> dict[str, dict]:
    path = LEDGER_DIR / "promotions.jsonl"
    if not path.exists():
        return {}
    latest: dict[str, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        latest[row["id"]] = row
    return latest


def calibration_report() -> dict:
    """Compute the predicted-vs-realized gap, overall + per lens + per source."""
    feed = _load_feed()
    statuses = _latest_statuses()

    # join: each decided candidate -> (lens_score, lens, source, status)
    decided = []
    for cid, st in statuses.items():
        item = feed.get(cid)
        if not item or st["status"] not in ("promoted", "rejected"):
            continue
        decided.append({
            "id": cid,
            "score": item["lens_score"],
            "lens": item.get("lens", "?"),
            "source": item["source"],
            "subtype": item.get("subtype", "?"),
            "status": st["status"],
        })

    def _bucket(rows):
        promoted = [r["score"] for r in rows if r["status"] == "promoted"]
        rejected = [r["score"] for r in rows if r["status"] == "rejected"]
        out = {
            "n": len(rows),
            "n_promoted": len(promoted),
            "n_rejected": len(rejected),
            "promoted_mean": round(statistics.mean(promoted), 2) if promoted else None,
            "rejected_mean": round(statistics.mean(rejected), 2) if rejected else None,
        }
        if promoted and rejected:
            out["separation"] = round(out["promoted_mean"] - out["rejected_mean"], 2)
        else:
            out["separation"] = None
        return out

    overall = _bucket(decided)

    by_lens = {}
    lens_groups = defaultdict(list)
    for r in decided:
        lens_groups[r["lens"]].append(r)
    for lens, rows in lens_groups.items():
        by_lens[lens] = _bucket(rows)

    by_source = {}
    src_groups = defaultdict(list)
    for r in decided:
        src_groups[r["source"]].append(r)
    for src, rows in src_groups.items():
        b = _bucket(rows)
        # under-rated: promoted items here score lower than the global promoted mean
        if b["promoted_mean"] is not None and overall["promoted_mean"] is not None:
            b["under_rated"] = b["promoted_mean"] < overall["promoted_mean"] - 0.5
        by_source[src] = b

    # which subtype gets promoted most (a hint for what the lens should value)
    subtype_promo = defaultdict(lambda: {"promoted": 0, "total": 0})
    for r in decided:
        subtype_promo[r["subtype"]]["total"] += 1
        if r["status"] == "promoted":
            subtype_promo[r["subtype"]]["promoted"] += 1

    # verdicts / recommendations
    findings = []
    if overall["n"] < MIN_DECISIONS:
        findings.append(("info", f"Only {overall['n']} decisions so far — mark more (≥{MIN_DECISIONS}) for a trustworthy read."))
    else:
        sep = overall["separation"]
        if sep is None:
            findings.append(("info", "Need both promotions AND rejections to measure discrimination."))
        elif sep < DISCRIMINATION_EPS:
            findings.append(("warn", f"Lens barely discriminates: promoted mean {overall['promoted_mean']} vs rejected {overall['rejected_mean']} (Δ{sep}). The score isn't predicting what you actually pick — the rubric needs work."))
        else:
            findings.append(("ok", f"Lens discriminates: promoted {overall['promoted_mean']} vs rejected {overall['rejected_mean']} (Δ{sep}). Score tracks real choices."))
        for src, b in by_source.items():
            if b.get("under_rated"):
                findings.append(("tune", f"Lens under-rates '{src}': its promoted items average {b['promoted_mean']} (below global {overall['promoted_mean']}). The lens should value this source more."))

    return {
        "overall": overall,
        "by_lens": by_lens,
        "by_source": by_source,
        "subtype_promotion": dict(subtype_promo),
        "findings": findings,
    }


def _print(report: dict) -> None:
    try:
        from rich.console import Console
        from rich.table import Table
        from rich.panel import Panel
    except ImportError:
        print(json.dumps(report, indent=2))
        return
    c = Console()
    o = report["overall"]
    c.print(Panel.fit(
        f"[bold]Calibration — predicted (lens) vs realized (promotion)[/]\n"
        f"decisions: {o['n']}  ·  promoted: {o['n_promoted']}  ·  rejected: {o['n_rejected']}\n"
        f"promoted mean score: {o['promoted_mean']}   rejected mean score: {o['rejected_mean']}   "
        f"separation: {o['separation']}",
        border_style="cyan",
    ))
    if report["by_source"]:
        t = Table(title="Per-source: does the lens rate it right?", expand=True)
        for col in ["source", "decided", "promoted µ", "rejected µ", "flag"]:
            t.add_column(col)
        for src, b in sorted(report["by_source"].items(), key=lambda kv: (kv[1]["promoted_mean"] or -99), reverse=True):
            flag = "[yellow]under-rated[/]" if b.get("under_rated") else ""
            t.add_row(src, str(b["n"]), str(b["promoted_mean"]), str(b["rejected_mean"]), flag)
        c.print(t)
    color = {"ok": "green", "warn": "red", "tune": "yellow", "info": "dim"}
    c.print("\n[bold]Findings[/]")
    for kind, msg in report["findings"]:
        c.print(f"  [{color.get(kind,'white')}]•[/] {msg}")


if __name__ == "__main__":
    _print(calibration_report())
