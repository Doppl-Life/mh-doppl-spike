#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from statistics import mean
from typing import Any


ROOT = Path(__file__).resolve().parent
FIXTURES = ROOT / "fixtures.json"
OUT_DIR = ROOT / "out"

SAFETY_TERMS = {
    "redaction",
    "secret",
    "security",
    "replay",
    "state-equivalence",
    "grounding",
    "falsifiable",
    "prediction",
    "allowlist",
    "arbitrary code",
    "accessibility",
    "prompt-injection",
    "validation",
}


@dataclass(frozen=True)
class Review:
    candidate_id: str
    label: str
    required_count: int
    speculative_count: int
    native_alternative_count: int
    hidden_labor_count: int
    unsafe_deletion_count: int
    deferred_count: int
    disciplined_deferred_count: int
    mechanism_cost: float
    anti_pattern_score: float
    least_action_score: float
    verdict: str
    reasons: list[str]


def load_candidates(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError("fixtures must be a JSON array")
    return data


def count(items: Any) -> int:
    return len(items or [])


def has_text(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def disciplined_deferred(items: list[dict[str, Any]]) -> int:
    return sum(1 for item in items if has_text(item.get("ceiling")) and has_text(item.get("upgrade_when")))


def unsafe_terms(unsafe_deletions: list[str]) -> list[str]:
    found: list[str] = []
    for deletion in unsafe_deletions:
        normalized = deletion.lower()
        if any(term in normalized for term in SAFETY_TERMS):
            found.append(deletion)
    return found


def anti_pattern_score(candidate: dict[str, Any]) -> float:
    pattern = candidate.get("anti_pattern")
    if not isinstance(pattern, dict):
        return 0.0

    fields = [
        "old_taboo",
        "old_constraint",
        "substrate_removed",
        "new_strategy",
        "falsifier",
    ]
    present = sum(1 for field in fields if has_text(pattern.get(field)))
    signals = count(pattern.get("current_signals"))
    if present < len(fields) or signals == 0:
        return -2.0
    return 2.0


def review(candidate: dict[str, Any]) -> Review:
    required_count = count(candidate.get("required_mechanisms"))
    speculative_count = count(candidate.get("speculative_mechanisms"))
    native_alternative_count = count(candidate.get("native_alternatives"))
    hidden_labor_count = count(candidate.get("hidden_human_labor"))
    unsafe_deletion_count = count(candidate.get("unsafe_deletions"))
    deferred = candidate.get("deferred_mechanisms") or []
    deferred_count = count(deferred)
    disciplined_count = disciplined_deferred(deferred)
    unsafe_load_bearing = unsafe_terms(candidate.get("unsafe_deletions") or [])
    anti_score = anti_pattern_score(candidate)

    mechanism_cost = (
        required_count * 0.8
        + speculative_count * 2.2
        + hidden_labor_count * 1.5
        + max(0, deferred_count - disciplined_count) * 1.8
        - native_alternative_count * 0.9
        - disciplined_count * 0.5
    )
    mechanism_cost = max(0.0, round(mechanism_cost, 2))

    useful_outcome = float(candidate.get("useful_outcome", 0))
    safety_penalty = 8.0 if unsafe_load_bearing else 0.0
    least_action_score = round(useful_outcome + anti_score - mechanism_cost - safety_penalty, 2)

    reasons: list[str] = []
    if unsafe_load_bearing:
        verdict = "reject"
        reasons.append("cuts load-bearing safety/evidence: " + ", ".join(unsafe_load_bearing))
    elif least_action_score >= 6:
        verdict = "promote"
        reasons.append("high useful outcome with justified mechanism load")
    elif least_action_score >= 3:
        verdict = "keep"
        reasons.append("usable but mechanism load needs pressure")
    else:
        verdict = "reject"
        reasons.append("mechanism load outweighs useful outcome")

    if speculative_count:
        reasons.append(f"{speculative_count} speculative mechanism(s)")
    if native_alternative_count:
        reasons.append(f"{native_alternative_count} native/platform alternative(s)")
    if deferred_count and disciplined_count < deferred_count:
        reasons.append("deferred mechanism missing ceiling or upgrade trigger")
    if anti_score > 0:
        reasons.append("passes anti-pattern inversion shape")
    elif anti_score < 0:
        reasons.append("claims inversion without signal/falsifier")

    return Review(
        candidate_id=str(candidate["id"]),
        label=str(candidate["label"]),
        required_count=required_count,
        speculative_count=speculative_count,
        native_alternative_count=native_alternative_count,
        hidden_labor_count=hidden_labor_count,
        unsafe_deletion_count=unsafe_deletion_count,
        deferred_count=deferred_count,
        disciplined_deferred_count=disciplined_count,
        mechanism_cost=mechanism_cost,
        anti_pattern_score=anti_score,
        least_action_score=least_action_score,
        verdict=verdict,
        reasons=reasons,
    )


def expected_pass(review: Review) -> bool:
    if review.label == "dangerously_underbuilt":
        return review.verdict == "reject"
    if review.label == "overbuilt":
        return review.verdict in {"reject", "keep"} and review.mechanism_cost >= 5
    if review.label in {"good_minimal", "irreducible_heavy", "anti_pattern_inversion"}:
        return review.verdict in {"keep", "promote"}
    return False


def calibration(reviews: list[Review]) -> dict[str, Any]:
    by_id = {review.candidate_id: review for review in reviews}
    overbuilt = [review for review in reviews if review.label == "overbuilt"]
    underbuilt = [review for review in reviews if review.label == "dangerously_underbuilt"]
    irreducible = [review for review in reviews if review.label == "irreducible_heavy"]

    lazy = by_id["lazy-breadth-agent-shell"]
    monolith = by_id["ocean-monolith-platform"]
    postgres = by_id["postgres-lineage-projection"]
    neo4j = by_id["neo4j-runtime-mvp"]

    checks = {
        "rejects_dangerous_underbuilding": all(item.verdict == "reject" for item in underbuilt),
        "penalizes_overbuilding": all(item.mechanism_cost >= 5 for item in overbuilt),
        "preserves_irreducible_heavy": all(item.verdict in {"keep", "promote"} for item in irreducible),
        "prefers_projection_over_runtime_graph": postgres.least_action_score > neo4j.least_action_score,
        "understands_lazy_breadth": lazy.verdict in {"keep", "promote"} and lazy.least_action_score > monolith.least_action_score,
        "does_not_reward_smallness_alone": all(item.least_action_score < 0 for item in underbuilt),
    }
    passed = sum(1 for value in checks.values() if value)
    total = len(checks)

    if passed == total:
        decision = "KEEP: build P4.12 as non-contract evidence; do not promote contracts yet"
    elif checks["does_not_reward_smallness_alone"] and checks["rejects_dangerous_underbuilding"]:
        decision = "KEEP_WITH_FIXES: signal exists but calibration needs more fixtures"
    else:
        decision = "KILL: rubric reward-hacks smallness"

    return {
        "checks": checks,
        "passed": passed,
        "total": total,
        "decision": decision,
        "mean_mechanism_cost": round(mean(item.mechanism_cost for item in reviews), 2),
        "mean_least_action_score": round(mean(item.least_action_score for item in reviews), 2),
    }


def as_dict(review: Review) -> dict[str, Any]:
    return {
        "candidate_id": review.candidate_id,
        "label": review.label,
        "mechanism_cost": review.mechanism_cost,
        "anti_pattern_score": review.anti_pattern_score,
        "least_action_score": review.least_action_score,
        "verdict": review.verdict,
        "expected_pass": expected_pass(review),
        "counts": {
            "required": review.required_count,
            "speculative": review.speculative_count,
            "native_alternatives": review.native_alternative_count,
            "hidden_labor": review.hidden_labor_count,
            "unsafe_deletions": review.unsafe_deletion_count,
            "deferred": review.deferred_count,
            "disciplined_deferred": review.disciplined_deferred_count,
        },
        "reasons": review.reasons,
    }


def write_report(candidates: list[dict[str, Any]], reviews: list[Review], summary: dict[str, Any], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    candidate_titles = {item["id"]: item["title"] for item in candidates}
    rows = sorted(reviews, key=lambda item: item.least_action_score, reverse=True)

    lines = [
        "# Least-Action Calibration Report",
        "",
        f"Decision: **{summary['decision']}**",
        "",
        "## Gate Checks",
        "",
    ]
    for name, passed in summary["checks"].items():
        mark = "PASS" if passed else "FAIL"
        lines.append(f"- {mark} `{name}`")

    lines.extend(
        [
            "",
            "## Candidate Results",
            "",
            "| Candidate | Label | Verdict | Mechanism cost | Least-action score | Expected |",
            "|---|---|---:|---:|---:|---:|",
        ]
    )
    for item in rows:
        expected = "PASS" if expected_pass(item) else "FAIL"
        title = candidate_titles[item.candidate_id]
        lines.append(
            f"| {title} | `{item.label}` | `{item.verdict}` | {item.mechanism_cost:.2f} | {item.least_action_score:.2f} | {expected} |"
        )

    lines.extend(
        [
            "",
            "## What This Means",
            "",
            "The rubric is useful only if it does all three: penalizes overbuilt mechanism, rejects unsafe deletion, and preserves heavy-but-necessary evidence machinery.",
            "",
            "The 10x fixture is `lazy-breadth-agent-shell`: the reviewer should accept breadth when the old breadth constraint is explicitly weakened, while still penalizing owning bespoke depth before evidence demands it.",
            "",
            "## Next Action",
            "",
            "Build `IMPLEMENTATION_PLAN.md` P4.12 as evidence-only. Do not add a first-class contract until this same separation holds with the real critic over corpus/live candidates.",
            "",
        ]
    )

    (out_dir / "report.md").write_text("\n".join(lines), encoding="utf-8")
    (out_dir / "results.json").write_text(
        json.dumps(
            {
                "summary": summary,
                "reviews": [as_dict(item) for item in reviews],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def print_summary(reviews: list[Review], summary: dict[str, Any], out_dir: Path) -> None:
    print("Least-Action Fitness calibration")
    print(f"Decision: {summary['decision']}")
    print(f"Gate checks: {summary['passed']}/{summary['total']} passed")
    print()
    for review in sorted(reviews, key=lambda item: item.least_action_score, reverse=True):
        print(
            f"{review.verdict.upper():7} {review.candidate_id:28} "
            f"score={review.least_action_score:5.2f} cost={review.mechanism_cost:4.2f}"
        )
    print()
    print(f"Wrote {out_dir / 'report.md'}")
    print(f"Wrote {out_dir / 'results.json'}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Calibrate Least-Action Fitness fixtures.")
    parser.add_argument("--fixtures", type=Path, default=FIXTURES)
    parser.add_argument("--out", type=Path, default=OUT_DIR)
    args = parser.parse_args()

    candidates = load_candidates(args.fixtures)
    reviews = [review(candidate) for candidate in candidates]
    summary = calibration(reviews)
    write_report(candidates, reviews, summary, args.out)
    print_summary(reviews, summary, args.out)
    return 0 if summary["checks"]["does_not_reward_smallness_alone"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
