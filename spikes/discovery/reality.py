"""Reality check — the two-horizon answer to "is/was this real?"

Decay is a cheap one-directional default: a zeitgeist score only ever falls with
age. But your BEST decaying ideas deserve a second look before they're written off —
sometimes the world caught up and the thesis is RIPER, not staler. And nothing yet
checks a candidate against what actually happened. This module adds both, because
they're the same move (check the candidate against reality) at two time horizons:

  REFRESH (forward: "is this STILL true / did it get riper?")
    Before a high-value decaying zeitgeist candidate is expired, re-fetch current
    signal and RE-SCORE it. The score can go UP, the clock can reset, or the fade is
    confirmed. Decay proposes expiry; refresh disposes. Gated to high raw-score
    candidates (re-scoring costs a model call — spend it on ideas worth saving).

  BACKTEST (backward: "WAS it true?")
    Take resolved candidates (old enough, or a known-outcome corpus) and check the
    dated falsifiable prediction against reality. Score the engine on CALIBRATION —
    does a +4 actually come true ~80% of the time? This is the third bedrock check
    (reality / paper-bets, PROPOSAL.md) wired into discovery — the signal that makes
    all the others honest. Resolved-correct zeitgeist becomes a graded benchmark.

Both write append-only outcomes; neither deletes. Reality is the free adversary.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import decay
from brain import analyze_item

LEDGER_DIR = Path(__file__).resolve().parent / "ledgers"

# Refresh only candidates whose ORIGINAL raw score was at least this — the ones
# worth paying a re-score to potentially save. (Budgeted bandit: don't refresh junk.)
REFRESH_MIN_RAW = 4
# A candidate is "decaying" (refresh-eligible) once its effective score has dropped
# this far below its raw score.
REFRESH_DROP = 1.0


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _feed_latest() -> dict[str, dict]:
    path = LEDGER_DIR / "candidate_feed.jsonl"
    if not path.exists():
        return {}
    by_id: dict[str, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            r = json.loads(line)
            by_id[r["id"]] = r
    return by_id


def _statuses() -> dict[str, str]:
    path = LEDGER_DIR / "promotions.jsonl"
    if not path.exists():
        return {}
    out: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            r = json.loads(line)
            out[r["id"]] = r["status"]
    return out


# --------------------------------------------------------------------------- #
# REFRESH — the reverse gear on decay.
# --------------------------------------------------------------------------- #

def refresh_candidates(api_key: str, max_refresh: int = 5) -> list[dict]:
    """Re-score high-value decaying zeitgeist candidates against current signal.

    For each eligible candidate, re-run the brain (optionally over freshly-fetched
    body) and append a NEW feed row with the new score and a reset harvested_at —
    so a thesis the world caught up to climbs back up the ranking and its clock
    resets. Returns a list of {id, old_score, new_score, verdict}.
    """
    from fetch import fetch_body
    feed = _feed_latest()
    statuses = _statuses()
    eligible = []
    for cid, row in feed.items():
        if statuses.get(cid) in ("promoted", "rejected", "expired"):
            continue
        if row.get("subtype") != "zeitgeist_synthesis":
            continue
        if row.get("lens_score", 0) < REFRESH_MIN_RAW:
            continue
        ann = decay.annotate(row)
        if row["lens_score"] - ann["effective_score"] >= REFRESH_DROP:
            eligible.append((cid, row, ann))
    # most-decayed first (closest to expiry = most urgent to re-check)
    eligible.sort(key=lambda x: x[2]["effective_score"])
    results = []
    for cid, row, ann in eligible[:max_refresh]:
        # re-fetch current signal for the source URL (cheap tiers first)
        body, tier = fetch_body(row.get("url", ""))
        item = {
            "id": cid,
            "source": row["source"],
            "url": row.get("url", ""),
            "title": row["title"],
            "raw_text": body or row.get("title", ""),
            "known_subtype": None,
            "surface_metrics": {},
        }
        scored = analyze_item(item, api_key, row.get("lens", "capstone-demo-fit"))
        a = scored.get("analysis")
        if not a:
            continue
        new = a["lens_score"]
        old = row["lens_score"]
        if new > ann["effective_score"]:
            verdict = "refreshed_up" if new >= old else "still_live"
        else:
            verdict = "fade_confirmed"
        # append a fresh feed row with reset clock so decay restarts from now
        fresh_row = {
            "harvested_at": _now(),
            "id": cid,
            "source": row["source"],
            "url": row.get("url", ""),
            "lens": row.get("lens", "capstone-demo-fit"),
            "subtype": a["subtype"],
            "lens_score": new,
            "is_trap": a.get("is_trap", False),
            "disposition": a["disposition"],
            "title": a["title"],
            "why_it_might_matter": a["why_it_might_matter"],
            "actual_problem": a["problem_recovery"].get("actual_problem", ""),
            "hidden_variable": a["problem_recovery"].get("hidden_variable", ""),
            "fetch_tier": tier,
            "refreshed_from": old,
        }
        with (LEDGER_DIR / "candidate_feed.jsonl").open("a", encoding="utf-8") as f:
            f.write(json.dumps(fresh_row, ensure_ascii=False) + "\n")
        results.append({"id": cid, "old_score": old, "decayed_to": ann["effective_score"], "new_score": new, "verdict": verdict, "title": row["title"]})
    return results


# --------------------------------------------------------------------------- #
# BACKTEST — was it right? (calibration against reality)
# --------------------------------------------------------------------------- #

def backtest(api_key: str, resolved: list[dict]) -> dict:
    """Grade the engine against reality.

    `resolved` is a list of {id?, title, lens_score, prediction, outcome} where
    `outcome` is 'true' | 'false' | 'unknown' (the world's verdict). We bucket by
    score band and report calibration: did high-scored theses come true more often?
    Correct-and-high items are flagged as benchmark-fixture candidates.

    For the spike, `resolved` is supplied (from the known-outcome corpus or settled
    markets); live resolution accrues as hourly runs age. The harness is the point.
    """
    bands = {"+4..+5": [], "+1..+3": [], "<=0": []}
    for r in resolved:
        s = r.get("lens_score", 0)
        band = "+4..+5" if s >= 4 else "+1..+3" if s >= 1 else "<=0"
        bands[band].append(r)

    report = {"n": len(resolved), "bands": {}, "fixtures": [], "logged_at": _now()}
    for band, rows in bands.items():
        decided = [r for r in rows if r.get("outcome") in ("true", "false")]
        true_n = sum(1 for r in decided if r["outcome"] == "true")
        report["bands"][band] = {
            "n": len(rows),
            "resolved": len(decided),
            "came_true": true_n,
            "hit_rate": round(true_n / len(decided), 2) if decided else None,
        }
    # benchmark fixtures: resolved-correct, high-confidence
    for r in resolved:
        if r.get("outcome") == "true" and r.get("lens_score", 0) >= 3:
            report["fixtures"].append({"title": r["title"], "lens_score": r["lens_score"], "prediction": r.get("prediction", "")})

    # calibration verdict
    hi = report["bands"]["+4..+5"]["hit_rate"]
    lo = report["bands"]["+1..+3"]["hit_rate"]
    if hi is not None and lo is not None:
        report["calibrated"] = hi > lo  # high-scored should come true more often
        report["verdict"] = (
            f"Calibrated: +4..+5 came true {hi} vs +1..+3 {lo} — the score tracks reality."
            if hi > lo else
            f"MIS-calibrated: +4..+5 came true {hi} vs +1..+3 {lo} — high scores aren't more right."
        )
    else:
        report["verdict"] = "Not enough resolved items to judge calibration yet."
    return report
