"""The append-only ledgers — the engine learns by keeping receipts.

  1. candidate_feed.jsonl  — every analyzed item, ranked
  2. source_registry.json  — per-(source x lens) hit-rate + status verdict
  3. exemplar_keep.jsonl    — strong resolved cases worth keeping as benchmark fixtures
  4. trap_register.jsonl    — actively-bad items (signed score <= -3) and WHY they're traps
                              (the discovery-layer feed into amemetics / BUGS_AND_MITIGATIONS)

Append-only is deliberate: same spine as Doppl's event log, the Agora verdicts, and
the bugs register. We never rewrite history; we append and re-derive.

Scoring is SIGNED (-5..+5): positive = surface, 0 = ignore, negative = trap.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

LEDGER_DIR = Path(__file__).resolve().parent / "ledgers"

HIT_SCORE_THRESHOLD = 3          # lens_score >= +3 counts as a "hit"
TRAP_SCORE_THRESHOLD = -3        # lens_score <= -3 is a trap
MIN_VOLUME_TO_JUDGE = 3          # need this many items before a verdict beyond 'unproven'


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _append_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def write_candidate_feed(analyzed: list[dict]) -> Path:
    path = LEDGER_DIR / "candidate_feed.jsonl"
    rows = []
    for it in analyzed:
        a = it.get("analysis")
        if not a:
            continue
        rows.append(
            {
                "harvested_at": _now(),
                "id": it["id"],
                "source": it["source"],
                "url": it["url"],
                "lens": it["lens"],
                "subtype": a["subtype"],
                "lens_score": a["lens_score"],
                "is_trap": a.get("is_trap", False),
                "disposition": a["disposition"],
                "title": a["title"],
                "why_it_might_matter": a["why_it_might_matter"],
                "actual_problem": a["problem_recovery"].get("actual_problem", ""),
                "hidden_variable": a["problem_recovery"].get("hidden_variable", ""),
                "fetch_tier": it.get("fetch_tier", "free"),
            }
        )
    _append_jsonl(path, rows)
    return path


def write_trap_register(analyzed: list[dict]) -> tuple[Path, int]:
    """Log actively-bad items as anti-patterns. The negative tail, remembered."""
    path = LEDGER_DIR / "trap_register.jsonl"
    rows = []
    for it in analyzed:
        a = it.get("analysis")
        if not a:
            continue
        if a["lens_score"] <= TRAP_SCORE_THRESHOLD or a.get("is_trap"):
            rows.append(
                {
                    "logged_at": _now(),
                    "id": it["id"],
                    "source": it["source"],
                    "url": it["url"],
                    "lens": it["lens"],
                    "lens_score": a["lens_score"],
                    "title": a["title"],
                    "trap_reason": a.get("trap_reason") or a.get("lens_reason", ""),
                }
            )
    _append_jsonl(path, rows)
    return path, len(rows)


def update_source_registry(analyzed: list[dict], source_errors: dict[str, str]) -> tuple[Path, dict]:
    """Score the WELLS, not just the buckets — per (source x lens).

    Each key is "source@lens". A source can be productive for one lens and
    polluting for another (e.g. X.com: gold for zeitgeist, noise for demo-fit).
    Verdicts:
      productive          hit-rate >= 0.4 and net-positive
      marginal            some hits, low rate
      polluting           produces net-negative items (traps outweigh hits)
      looks_good_but_isnt enough volume, ~no hits, not actively bad
      unproven            too little volume to judge
      unreachable         fetch failed, no items
    """
    path = LEDGER_DIR / "source_registry.json"
    existing: dict = {}
    if path.exists():
        txt = path.read_text(encoding="utf-8").strip()
        if txt:
            existing = json.loads(txt)

    # tally this run, keyed by source@lens
    per_key: dict[str, dict] = {}
    for it in analyzed:
        a = it.get("analysis")
        if not a:
            continue
        key = f"{it['source']}@{it['lens']}"
        d = per_key.setdefault(key, {"source": it["source"], "lens": it["lens"], "vol": 0, "hits": 0, "traps": 0, "sum": 0})
        d["vol"] += 1
        d["sum"] += a["lens_score"]
        if a["lens_score"] >= HIT_SCORE_THRESHOLD:
            d["hits"] += 1
        if a["lens_score"] <= TRAP_SCORE_THRESHOLD:
            d["traps"] += 1

    for s, err in source_errors.items():
        key = f"{s}@*"
        per_key.setdefault(key, {"source": s, "lens": "*", "vol": 0, "hits": 0, "traps": 0, "sum": 0, "last_error": err})
        per_key[key]["last_error"] = err

    registry: dict[str, dict] = existing.copy()
    for key, d in per_key.items():
        prev = registry.get(key, {})
        cum_vol = prev.get("cumulative_volume", 0) + d["vol"]
        cum_hits = prev.get("cumulative_hits", 0) + d["hits"]
        cum_traps = prev.get("cumulative_traps", 0) + d["traps"]
        cum_sum = prev.get("cumulative_sum", 0) + d["sum"]
        hit_rate = (cum_hits / cum_vol) if cum_vol else 0.0
        trap_rate = (cum_traps / cum_vol) if cum_vol else 0.0
        avg = round(cum_sum / cum_vol, 2) if cum_vol else None

        if d.get("last_error") and cum_vol == 0:
            status = "unreachable"
        elif cum_vol < MIN_VOLUME_TO_JUDGE:
            status = "unproven"
        elif cum_traps > cum_hits:
            status = "polluting"
        elif hit_rate >= 0.4:
            status = "productive"
        elif cum_hits == 0 and cum_traps == 0:
            status = "looks_good_but_isnt"
        else:
            status = "marginal"

        registry[key] = {
            "source": d["source"],
            "lens": d["lens"],
            "cumulative_volume": cum_vol,
            "cumulative_hits": cum_hits,
            "cumulative_traps": cum_traps,
            "cumulative_sum": cum_sum,
            "hit_rate": round(hit_rate, 3),
            "trap_rate": round(trap_rate, 3),
            "avg_score": avg,
            "status": status,
            "last_error": d.get("last_error"),
            "updated_at": _now(),
        }

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(registry, indent=2, ensure_ascii=False), encoding="utf-8")
    return path, registry


def mark_status(candidate_id: str, status: str, reason: str = "") -> dict:
    """Append a lifecycle event for a candidate (surfaced -> promoted | rejected).

    Append-only: a candidate is never removed from the feed when promoted/rejected,
    it is MARKED. This preserves the journey and — crucially — gives the engine the
    OUTCOME signal it otherwise lacks: promotion is realized value (a real decision),
    versus the lens score, which is only predicted value.
    """
    assert status in {"promoted", "rejected", "surfaced", "expired"}, f"bad status: {status}"
    path = LEDGER_DIR / "promotions.jsonl"
    row = {"at": _now(), "id": candidate_id, "status": status, "reason": reason}
    _append_jsonl(path, [row])
    return row


def latest_statuses() -> dict[str, dict]:
    """Collapse the append-only promotions log to each candidate's current status."""
    path = LEDGER_DIR / "promotions.jsonl"
    if not path.exists():
        return {}
    latest: dict[str, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        latest[row["id"]] = row  # later lines overwrite earlier -> current status
    return latest


def sweep_expired() -> int:
    """Auto-expire zeitgeist candidates that missed their why-now window.

    Scans the feed, and for each candidate not already decided, asks decay.should_expire
    (zeitgeist + old enough + decayed past the floor). Marks it `expired` (append-only —
    the candidate stays in the feed, it's just flagged 'window closed'). Idempotent:
    skips anything already promoted/rejected/expired. Returns how many it expired.
    """
    import decay
    feed_path = LEDGER_DIR / "candidate_feed.jsonl"
    if not feed_path.exists():
        return 0
    # latest row per id
    by_id: dict[str, dict] = {}
    for line in feed_path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        r = json.loads(line)
        by_id[r["id"]] = r
    statuses = latest_statuses()
    n = 0
    for cid, row in by_id.items():
        cur = statuses.get(cid, {}).get("status")
        if cur in ("promoted", "rejected", "expired"):
            continue
        if decay.should_expire(row, cur):
            mark_status(cid, "expired", f"why-now window closed (age {decay.age_days(row.get('harvested_at',''))//1:.0f}d, decayed)")
            n += 1
    return n


def promotion_rates() -> dict[str, dict]:
    """Per-source REALIZED value: of the items surfaced, how many got promoted.

    Truer than lens-score for 'which wells are worth mining', because it's measured
    against real decisions, not the engine's own prediction. Joins the promotions
    log back to the candidate feed (which carries each id's source).
    """
    feed_path = LEDGER_DIR / "candidate_feed.jsonl"
    if not feed_path.exists():
        return {}
    id_to_source: dict[str, str] = {}
    for line in feed_path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        r = json.loads(line)
        id_to_source[r["id"]] = r["source"]
    statuses = latest_statuses()
    agg: dict[str, dict] = {}
    for cid, st in statuses.items():
        src = id_to_source.get(cid)
        if not src:
            continue
        d = agg.setdefault(src, {"promoted": 0, "rejected": 0, "marked": 0})
        d["marked"] += 1
        if st["status"] == "promoted":
            d["promoted"] += 1
        elif st["status"] == "rejected":
            d["rejected"] += 1
    for src, d in agg.items():
        d["promotion_rate"] = round(d["promoted"] / d["marked"], 3) if d["marked"] else 0.0
    return agg


def write_exemplar_keep(analyzed: list[dict]) -> Path:
    path = LEDGER_DIR / "exemplar_keep.jsonl"
    rows = []
    for it in analyzed:
        a = it.get("analysis")
        if not a:
            continue
        if a["disposition"] == "resolved_exemplar" and a["lens_score"] >= HIT_SCORE_THRESHOLD:
            rows.append(
                {
                    "kept_at": _now(),
                    "id": it["id"],
                    "source": it["source"],
                    "url": it["url"],
                    "subtype": a["subtype"],
                    "title": a["title"],
                    "why_exemplar": a["why_it_might_matter"],
                    "known_subtype": it.get("known_subtype"),
                }
            )
    _append_jsonl(path, rows)
    return path
