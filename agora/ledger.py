"""agora.ledger — append-only JSONL persistence for posts and verdicts.

The persistence — not the chat — is the point: a logged verdict becomes a
lineage's fitness history. Append-only and attributed by design.
"""

from __future__ import annotations

import json
from pathlib import Path

from .schema import Post, Verdict

DEFAULT_DIR = Path(__file__).resolve().parent / "ledger"
POSTS_NAME = "posts.jsonl"
VERDICTS_NAME = "verdicts.jsonl"


def _ensure(dir_: Path) -> Path:
    dir_.mkdir(parents=True, exist_ok=True)
    return dir_


def _append(path: Path, row: dict) -> None:
    _ensure(path.parent)
    with path.open("a") as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def _read(path: Path) -> list[dict]:
    if not path.exists():
        return []
    rows: list[dict] = []
    with path.open() as fh:
        for line in fh:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


# ── posts ──────────────────────────────────────────────────────────────────
def append_post(post: Post, *, dir_: Path = DEFAULT_DIR) -> None:
    _append(dir_ / POSTS_NAME, post.to_dict())


def load_posts(*, dir_: Path = DEFAULT_DIR) -> list[Post]:
    """Append-only on disk, upsert on read: later rows with the same post_id win,
    so re-posting to attach a richer label (e.g. a council vote) enriches the post
    instead of duplicating it. Order follows first appearance."""
    by_id: dict[str, Post] = {}
    for d in _read(dir_ / POSTS_NAME):
        post = Post.from_dict(d)
        by_id[post.post_id] = post
    return list(by_id.values())


# ── verdicts ─────────────────────────────────────────────────────────────────
def append_verdict(verdict: Verdict, *, dir_: Path = DEFAULT_DIR) -> None:
    _append(dir_ / VERDICTS_NAME, verdict.to_dict())


def load_verdicts(*, dir_: Path = DEFAULT_DIR) -> list[Verdict]:
    return [Verdict.from_dict(d) for d in _read(dir_ / VERDICTS_NAME)]
