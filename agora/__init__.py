"""agora — a dependency-light verdict bus for the Agarden.

The copy-paste-anywhere artifact: drop this folder into any spike and you get
(1) a post/verdict contract, (2) append-only ledgers, (3) a local web "shot"
that humans react to, and (4) the human↔judge↔council agreement matrix.

The bus owns transport + schema + agreement. Producers (LLM callers) stay in the
spikes so this package needs nothing but the standard library.

    from agora import Post, Label, Verdict, append_post, load_posts, agreement

See README.md for the loop and the lexicon stub.
"""

from .schema import (
    CostEvent,
    DIMENSIONS,
    GenerationJudgment,
    GenerationOutput,
    GenerationRun,
    REACTION_MAP,
    Label,
    Post,
    Verdict,
    polarity,
    resolve_dimension,
)
from .ledger import (
    DEFAULT_DIR,
    append_generation_run,
    append_post,
    append_verdict,
    load_generation_runs,
    load_posts,
    load_verdicts,
)
from .agreement import HUMAN, SPIKE, agreement, render_text

__all__ = [
    "DIMENSIONS",
    "REACTION_MAP",
    "CostEvent",
    "GenerationJudgment",
    "GenerationOutput",
    "GenerationRun",
    "Label",
    "Post",
    "Verdict",
    "polarity",
    "resolve_dimension",
    "DEFAULT_DIR",
    "append_generation_run",
    "append_post",
    "append_verdict",
    "load_generation_runs",
    "load_posts",
    "load_verdicts",
    "HUMAN",
    "SPIKE",
    "agreement",
    "render_text",
]
