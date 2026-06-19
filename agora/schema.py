"""agora.schema — the post + verdict contracts, and the polarity that lets any
two labelers be compared.

Honors the schemas sketched in `bedrock/signal/README.md` (the Agora verdict
ledger). Stdlib-only on purpose: this module is meant to be copy-pasted into any
spike with zero install. The producers (LLM callers) live in the spikes; the
*bus* lives here and stays dependency-free.

Three vocabularies meet on one axis:

  - human reaction (emoji)      -> dimension  (novel / feasible / derivative / not-it)
  - machine "kind"              -> afrit / sprout / weed
  - council/judge dimension     -> same dimension set as the human

`polarity()` collapses all three onto {+1 good, 0 neutral, -1 bad} so a human, a
single judge, and a Fusant council can be put in the same confusion matrix.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── reaction map (emoji → bedrock dimension) ───────────────────────────────
# Mirrors bedrock/signal/README.md. Reactions are DIMENSIONS, not one approval
# blob — that is the counter-mutation to the politeness-inflation reward hack.
REACTION_MAP: dict[str, str] = {
    "🔥": "novel",       # cool / non-obvious / accretive
    "✅": "feasible",    # actually buildable / useful
    "♻️": "derivative",  # tried before / obvious / low-lift
    "🧊": "not-it",      # wrong / uninteresting / dead end
}

DIMENSIONS: tuple[str, ...] = ("novel", "feasible", "derivative", "not-it")

# How each vocabulary maps onto a shared good/neutral/bad axis.
_DIMENSION_POLARITY: dict[str, int] = {
    "novel": 1,
    "feasible": 1,
    "derivative": -1,
    "not-it": -1,
}
_KIND_POLARITY: dict[str, int] = {
    "afrit": 1,    # harvest-worthy outcome
    "sprout": 0,   # promising but unresolved
    "weed": -1,    # shouldn't have been surfaced
}


def polarity(*, dimension: str | None = None, kind: str | None = None) -> int:
    """Collapse a dimension OR a kind onto {+1, 0, -1}. Unknown → 0 (neutral)."""
    if dimension is not None:
        return _DIMENSION_POLARITY.get(dimension, 0)
    if kind is not None:
        return _KIND_POLARITY.get(kind, 0)
    return 0


# ── machine label (one labeler's read on a post) ───────────────────────────
@dataclass
class Label:
    """A non-human labeler's verdict on a post — e.g. the single held-out judge
    or the Fusant council. Many can ride on one post (that is the whole point:
    we compare them against each other AND against the humans)."""

    labeler: str                 # "judge:qwen3.7-plus" | "council:3-fusant" | ...
    dimension: str | None = None  # one of DIMENSIONS, if the labeler speaks dimensions
    kind: str | None = None       # afrit | sprout | weed, if it speaks kinds
    score: float | None = None    # raw numeric, if any (for the correlation gate)
    dissent: float | None = None  # 0..1 council disagreement (None for single judge)
    note: str = ""                # one-line why

    def polarity(self) -> int:
        return polarity(dimension=self.dimension, kind=self.kind)


# ── schema 1: a post (organism → Agora) ────────────────────────────────────
@dataclass
class Post:
    post_id: str
    idea: str
    context: str = ""
    spawncidence_id: str = ""       # e.g. "backyard:run_42:node_3"
    source: str = ""                # producing spike / agenome
    kind: str = "sprout"            # the producing spike's own call: sprout | afrit | weed
    why_nonobvious: str = ""
    how_to_verify: str = ""
    labels: list[Label] = field(default_factory=list)  # judge, council, …
    trace_link: str = ""
    exploration: bool = False       # True = deliberately random/low-score (anti-survivorship)
    cost_usd: float | None = None
    ts: str = field(default_factory=_now)

    def label_for(self, labeler_prefix: str) -> Label | None:
        for lb in self.labels:
            if lb.labeler.startswith(labeler_prefix):
                return lb
        return None

    def to_dict(self) -> dict:
        d = asdict(self)
        return d

    @classmethod
    def from_dict(cls, d: dict) -> "Post":
        labels = [Label(**lb) for lb in d.get("labels", [])]
        known = {f for f in cls.__dataclass_fields__ if f != "labels"}
        return cls(labels=labels, **{k: v for k, v in d.items() if k in known})


# ── schema 2: a verdict (Agardener → ledger) ───────────────────────────────
@dataclass
class Verdict:
    post_id: str
    reactor: str                   # attributed, NOT anonymous — needed for weighting
    dimension: str                 # one of DIMENSIONS (resolved from emoji)
    because: str = ""              # optional free-text (💬)
    weight: float = 1.0            # reactor disagreeableness weight
    spawncidence_id: str = ""
    kind: str = ""                 # mirror the post's kind so process/outcome split cleanly
    ts: str = field(default_factory=_now)

    def polarity(self) -> int:
        return polarity(dimension=self.dimension)

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: dict) -> "Verdict":
        known = {f for f in cls.__dataclass_fields__}
        return cls(**{k: v for k, v in d.items() if k in known})


def resolve_dimension(token: str) -> str:
    """Accept either an emoji (from REACTION_MAP) or a raw dimension string."""
    if token in REACTION_MAP:
        return REACTION_MAP[token]
    if token in DIMENSIONS:
        return token
    raise ValueError(f"unknown reaction/dimension: {token!r}")
