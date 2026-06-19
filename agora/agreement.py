"""agora.agreement — the actual scientific payload.

Every surfaced idea collects up to three reads: the producing spike's own call,
the machine labelers (single judge + Fusant council), and the humans (verdicts).
This module collapses each onto a shared polarity and asks the only question that
matters for bedrock: **where do we and the machine disagree?**

That divergence list is the training signal for tuning harnesses/skills/prompts
later — and the falsifier now (if humans and the council never diverge, the
council is either perfect or the humans are rubber-stamping; see the
politeness-mirror test in bedrock/signal/README.md).
"""

from __future__ import annotations

from collections import defaultdict
from itertools import combinations

from .schema import Post, Verdict, polarity

HUMAN = "human"
SPIKE = "spike"


def _human_polarity(verdicts: list[Verdict]) -> tuple[int, int]:
    """Aggregate a post's verdicts to one polarity by weighted sign. Returns
    (polarity, n_reactions). Ties / empty → 0."""
    if not verdicts:
        return 0, 0
    total = sum(v.polarity() * v.weight for v in verdicts)
    sign = (total > 0) - (total < 0)
    return sign, len(verdicts)


def _post_labelers(post: Post, verdicts_by_post: dict[str, list[Verdict]]) -> dict[str, int]:
    """All available {labeler_key: polarity} reads for one post."""
    reads: dict[str, int] = {}
    if post.kind:
        reads[SPIKE] = post_kind_polarity(post)
    for lb in post.labels:
        reads[lb.labeler] = lb.polarity()
    hp, n = _human_polarity(verdicts_by_post.get(post.post_id, []))
    if n > 0:
        reads[HUMAN] = hp
    return reads


def post_kind_polarity(post: Post) -> int:
    return polarity(kind=post.kind)


def agreement(posts: list[Post], verdicts: list[Verdict]) -> dict:
    """Pairwise agreement + divergence list across every labeler present.

    Returns a JSON-serializable dict:
      {
        "labelers":  {key: coverage_count},
        "pairs":     [{a, b, n, agree, rate, divergences:[{post_id, idea, a_pol, b_pol}]}],
        "n_posts":   int,
        "n_verdicts": int,
      }
    """
    verdicts_by_post: dict[str, list[Verdict]] = defaultdict(list)
    for v in verdicts:
        verdicts_by_post[v.post_id].append(v)

    idea_by_post = {p.post_id: p.idea for p in posts}
    reads_by_post: dict[str, dict[str, int]] = {
        p.post_id: _post_labelers(p, verdicts_by_post) for p in posts
    }

    coverage: dict[str, int] = defaultdict(int)
    for reads in reads_by_post.values():
        for key in reads:
            coverage[key] += 1

    keys = sorted(coverage)
    pairs = []
    for a, b in combinations(keys, 2):
        n = agree = 0
        divergences = []
        for post_id, reads in reads_by_post.items():
            if a in reads and b in reads:
                n += 1
                if reads[a] == reads[b]:
                    agree += 1
                else:
                    divergences.append(
                        {
                            "post_id": post_id,
                            "idea": idea_by_post.get(post_id, ""),
                            "a_pol": reads[a],
                            "b_pol": reads[b],
                        }
                    )
        if n:
            pairs.append(
                {
                    "a": a,
                    "b": b,
                    "n": n,
                    "agree": agree,
                    "rate": round(agree / n, 3),
                    "divergences": divergences,
                }
            )

    # Most-divergent pairs first — that's where the information is.
    pairs.sort(key=lambda p: p["rate"])
    return {
        "labelers": dict(coverage),
        "pairs": pairs,
        "n_posts": len(posts),
        "n_verdicts": len(verdicts),
    }


_POL_GLYPH = {1: "+", 0: "0", -1: "-"}


def render_text(report: dict) -> str:
    """Human-readable CLI summary of an agreement() report."""
    lines = []
    lines.append(
        f"agora agreement · {report['n_posts']} posts · {report['n_verdicts']} verdicts"
    )
    cov = report["labelers"]
    lines.append("  labelers (coverage): " + ", ".join(f"{k}={v}" for k, v in cov.items()))
    if not report["pairs"]:
        lines.append("  (no comparable pairs yet — need verdicts and ≥2 labelers)")
        return "\n".join(lines)
    lines.append("")
    for p in report["pairs"]:
        lines.append(f"  {p['a']:>18}  vs  {p['b']:<18}  agree {p['agree']}/{p['n']}  ({p['rate']:.0%})")
        for d in p["divergences"][:6]:
            tag = f"[{_POL_GLYPH[d['a_pol']]}|{_POL_GLYPH[d['b_pol']]}]"
            idea = (d["idea"][:96] + "…") if len(d["idea"]) > 97 else d["idea"]
            lines.append(f"        {tag} {idea}")
    return "\n".join(lines)
