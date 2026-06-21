#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import hashlib
import json
import os
import re
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parents[1]
WORKSPACE_ROOT = REPO_ROOT.parent
CASE_ROOT = REPO_ROOT / "case-studies"
DEFAULT_LEDGER = ROOT / "data" / "knowledge.jsonl"
OUT_DIR = ROOT / "out"
FIXTURE_DIR = ROOT / "fixtures"
DEFAULT_KEY_FILE = WORKSPACE_ROOT / "tokens and keys.md"
DEFAULT_OPENROUTER_MODEL = "openai/gpt-4.1-nano"

STOPWORDS = {
    "a",
    "about",
    "after",
    "all",
    "also",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "because",
    "but",
    "by",
    "can",
    "case",
    "does",
    "for",
    "from",
    "has",
    "have",
    "how",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "later",
    "not",
    "of",
    "on",
    "or",
    "other",
    "rather",
    "see",
    "so",
    "that",
    "the",
    "their",
    "this",
    "to",
    "what",
    "when",
    "where",
    "which",
    "with",
}

KIND_TERMS = {
    "hidden_variable": {
        "substrate",
        "hidden",
        "non-obvious",
        "variable",
        "because",
        "underwrites",
        "funds",
    },
    "warning": {
        "withhold",
        "not part",
        "different substrate",
        "do not",
        "belongs",
        "sibling",
        "out of scope",
    },
    "signal": {
        "source notes",
        "signal sources",
        "cited",
        "figures",
        "public reporting",
        "2024",
        "2025",
        "2026",
        "$",
        "%",
    },
    "case_frame": {
        "actual problem",
        "reframe",
        "convergence",
        "cluster",
        "chapter",
        "synthesis",
        "zeitgeist",
    },
}


@dataclass(frozen=True)
class KnowledgeRecord:
    id: str
    kind: str
    text: str
    tags: list[str]
    source_case: str
    source_path: str
    visibility: str
    trust_tier: str
    source_chunk_id: str
    line_start: int
    line_end: int
    heading: str
    citation: str
    run_id: str = ""
    candidate_id: str = ""
    critic_id: str = ""
    origin_event_sequence: int = 0
    agenome_id: str = ""

    def to_json(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "kind": self.kind,
            "text": self.text,
            "tags": self.tags,
            "source_case": self.source_case,
            "source_path": self.source_path,
            "visibility": self.visibility,
            "trust_tier": self.trust_tier,
            "source_chunk_id": self.source_chunk_id,
            "line_start": self.line_start,
            "line_end": self.line_end,
            "heading": self.heading,
            "citation": self.citation,
            "run_id": self.run_id,
            "candidate_id": self.candidate_id,
            "critic_id": self.critic_id,
            "origin_event_sequence": self.origin_event_sequence,
            "agenome_id": self.agenome_id,
        }

    @classmethod
    def from_json(cls, data: dict[str, Any]) -> "KnowledgeRecord":
        return cls(
            id=str(data["id"]),
            kind=str(data["kind"]),
            text=str(data["text"]),
            tags=list(data.get("tags") or []),
            source_case=str(data["source_case"]),
            source_path=str(data["source_path"]),
            visibility=str(data.get("visibility", "public")),
            trust_tier=str(data.get("trust_tier", "candidate")),
            source_chunk_id=str(data.get("source_chunk_id", f"chunk:{data['id']}")),
            line_start=int(data.get("line_start", 1)),
            line_end=int(data.get("line_end", data.get("line_start", 1))),
            heading=str(data.get("heading", "")),
            citation=str(data.get("citation", data["source_path"])),
            run_id=str(data.get("run_id", "")),
            candidate_id=str(data.get("candidate_id", "")),
            critic_id=str(data.get("critic_id", "")),
            origin_event_sequence=int(data.get("origin_event_sequence", 0)),
            agenome_id=str(data.get("agenome_id", "")),
        )


@dataclass(frozen=True)
class PacketItem:
    record: KnowledgeRecord
    score: float
    reason: str

    @property
    def cite_handle(self) -> str:
        return "K" + self.record.id.removeprefix("ks_")[:6].upper()


@dataclass(frozen=True)
class KnowledgePacketRequest:
    problem_summary: str
    target_case: str
    max_items: int
    memory_mode: str = "auto"
    excluded_cases: list[str] = field(default_factory=list)

    def to_json(self) -> dict[str, Any]:
        return {
            "problem_summary": self.problem_summary,
            "target_case": self.target_case,
            "max_items": self.max_items,
            "memory_mode": self.memory_mode,
            "excluded_cases": self.excluded_cases,
        }


@dataclass(frozen=True)
class ExcludedKnowledgeItem:
    case: str
    reason: str

    def to_json(self) -> dict[str, str]:
        return {"case": self.case, "reason": self.reason}


@dataclass(frozen=True)
class KnowledgePacket:
    query_tags: list[str]
    items: list[PacketItem]
    request: KnowledgePacketRequest | None = None
    excluded: list[ExcludedKnowledgeItem] = field(default_factory=list)

    def to_json(self) -> dict[str, Any]:
        return {
            "request": self.request.to_json() if self.request else None,
            "query_tags": self.query_tags,
            "items": [
                {
                    "cite_handle": item.cite_handle,
                    "score": item.score,
                    "reason": item.reason,
                    "record_id": item.record.id,
                    "source_chunk_id": item.record.source_chunk_id,
                    "citation": item.record.citation,
                    "record": item.record.to_json(),
                }
                for item in self.items
            ],
            "excluded": [item.to_json() for item in self.excluded],
        }

    def to_run_event(self, run_id: str, sequence: int) -> dict[str, Any]:
        return {
            "type": "knowledge.packet_selected",
            "runId": run_id,
            "sequence": sequence,
            "payload": self.to_json(),
        }


def tokenize(text: str) -> set[str]:
    words = set(re.findall(r"[a-zA-Z][a-zA-Z0-9-]{2,}", text.lower()))
    return {word for word in words if word not in STOPWORDS}


def split_sentences(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text.replace("\n", " ")).strip()
    chunks = re.split(r"(?<=[.!?])\s+", normalized)
    return [chunk.strip(" -*") for chunk in chunks if len(chunk.strip()) >= 80]


def source_visibility(path: Path) -> str:
    name = path.name.lower()
    if "withheld" in name or "with-solution" in name:
        return "withheld_evaluator"
    return "public"


def infer_kind(sentence: str) -> str:
    lowered = sentence.lower()
    best_kind = "claim"
    best_score = 0
    for kind, terms in KIND_TERMS.items():
        score = sum(1 for term in terms if term in lowered)
        if score > best_score:
            best_kind = kind
            best_score = score
    return best_kind


def infer_tags(text: str, source_case: str) -> list[str]:
    tokens = tokenize(text)
    tags = {"fsd"} if source_case.startswith("fsd") or "full-self" in source_case else set()
    for token in tokens:
        if token in {
            "accident",
            "autonomy",
            "crash",
            "driver",
            "economy",
            "enforcement",
            "insurance",
            "mobility",
            "ownership",
            "substrate",
            "time",
            "travel",
        }:
            tags.add(token)
    if "sibling" in tokens:
        tags.add("sibling")
    if "cluster" in tokens or "sub-cluster" in text.lower():
        tags.add("cluster")
    return sorted(tags)


def record_id(kind: str, source_case: str, source_path: str, text: str) -> str:
    digest = hashlib.sha1(
        f"{kind}\n{source_case}\n{source_path}\n{text}".encode("utf-8")
    ).hexdigest()[:16]
    return f"ks_{digest}"


def source_chunk_id(source_path: str, line_start: int, line_end: int, text: str) -> str:
    digest = hashlib.sha1(f"{source_path}\n{line_start}\n{line_end}\n{text}".encode("utf-8")).hexdigest()[:12]
    return f"chunk:{digest}"


def current_heading(lines: list[str], line_number: int) -> str:
    for index in range(min(line_number - 1, len(lines) - 1), -1, -1):
        stripped = lines[index].strip()
        if stripped.startswith("#"):
            return stripped.lstrip("#").strip()
    return ""


def sentence_line_span(text: str, sentence: str, search_start: int) -> tuple[int, int, int]:
    compact_sentence = re.sub(r"\s+", " ", sentence).strip()
    chars: list[str] = []
    positions: list[int] = []
    previous_was_space = True
    for index, char in enumerate(text):
        if char.isspace():
            if not previous_was_space:
                chars.append(" ")
                positions.append(index)
                previous_was_space = True
            continue
        chars.append(char)
        positions.append(index)
        previous_was_space = False
    compact_text = "".join(chars).strip()
    index = compact_text.find(compact_sentence, search_start)
    if index < 0:
        index = compact_text.find(compact_sentence)
    if index < 0:
        return 1, 1, search_start
    original_start = positions[index]
    original_end = positions[min(index + len(compact_sentence) - 1, len(positions) - 1)]
    line_start = text[:original_start].count("\n") + 1
    line_end = text[:original_end].count("\n") + 1
    return line_start, line_end, index + len(compact_sentence)


def cypher_value(value: str) -> str:
    return json.dumps(value)


def read_public_case_text(case_dir: Path) -> str:
    chunks: list[str] = []
    for path in sorted(case_dir.glob("*.md")):
        if source_visibility(path) == "public":
            chunks.append(path.read_text(encoding="utf-8"))
    return "\n\n".join(chunks)


def summarize_problem(problem_statement: str) -> str:
    text = re.sub(r"\s+", " ", problem_statement).strip()
    if len(text) <= 220:
        return text
    return text[:217].rstrip() + "..."


def research_reason(
    overlap: set[str],
    tag_overlap: set[str],
    name_overlap: set[str],
    case_name: str,
) -> str:
    parts: list[str] = []
    if name_overlap:
        parts.append("case-name overlap: " + ", ".join(sorted(name_overlap)))
    if tag_overlap:
        parts.append("shared tags: " + ", ".join(sorted(tag_overlap)))
    if overlap:
        parts.append("shared terms: " + ", ".join(sorted(overlap)[:8]))
    if case_name.startswith("fsd-"):
        parts.append("same FSD cluster")
    return "; ".join(parts) or "ranked by local corpus similarity"


def infer_target_cases(problem_statement: str, corpus_root: Path) -> set[str]:
    lowered = problem_statement.lower()
    target_fragments = []
    for marker in ("working on", "work on", "later problem", "separate problem"):
        if marker in lowered:
            target_fragments.append(lowered.split(marker, 1)[1])
    excluded: set[str] = set()
    for fragment in target_fragments:
        fragment_tokens = tokenize(fragment)
        for case_dir in (path for path in corpus_root.iterdir() if path.is_dir()):
            name_tokens = set(case_dir.name.replace("-", " ").split()) - {"fsd"}
            if name_tokens and name_tokens.issubset(fragment_tokens):
                excluded.add(case_dir.name)
    return excluded


def load_openrouter_key(key_file: Path = DEFAULT_KEY_FILE) -> str | None:
    env_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if env_key:
        return env_key
    if not key_file.exists():
        return None
    text = key_file.read_text(encoding="utf-8")
    patterns = [
        r"OPENROUTER_API_KEY\s*=\s*([^\s`]+)",
        r"openrouter[_ -]?api[_ -]?key\s*[:=]\s*([^\s`]+)",
        r"(sk" r"-or-v1-[A-Za-z0-9_-]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def openrouter_research_summary(
    problem_statement: str,
    report: dict[str, Any],
    api_key: str,
    model: str = DEFAULT_OPENROUTER_MODEL,
) -> str:
    chosen = "\n".join(
        f"- {item['case']}: {item['reason']}" for item in report["chosen_sources"]
    )
    prompt = (
        "You are enriching a Doppl Knowledge Space research pass. "
        "Given a problem statement and the local sources selected, write a compact "
        "research memo with: reusable priors, warnings, and what should be retrieved "
        "for a later run. Do not invent external citations.\n\n"
        f"Problem:\n{problem_statement[:4000]}\n\n"
        f"Selected local sources:\n{chosen}\n"
    )
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 500,
    }
    request = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/Doppl-Life/mh-doppl-spike",
            "X-Title": "Doppl Knowledge Space Spike",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        data = json.loads(response.read().decode("utf-8"))
    return str(data["choices"][0]["message"]["content"]).strip()


def validate_packet_event(event: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if event.get("type") != "knowledge.packet_selected":
        errors.append("event type must be knowledge.packet_selected")
    if not event.get("runId"):
        errors.append("event missing runId")
    if not isinstance(event.get("sequence"), int):
        errors.append("event missing integer sequence")
    payload = event.get("payload")
    if not isinstance(payload, dict):
        return errors + ["event missing payload"]
    request = payload.get("request")
    if not isinstance(request, dict):
        errors.append("payload missing request")
    else:
        if not request.get("target_case"):
            errors.append("request missing target_case")
        if not request.get("max_items"):
            errors.append("request missing max_items")
    items = payload.get("items")
    if not isinstance(items, list):
        return errors + ["payload items must be a list"]
    for index, item in enumerate(items, start=1):
        if not isinstance(item, dict):
            errors.append(f"item {index} must be an object")
            continue
        for key in ("cite_handle", "record_id", "source_chunk_id", "citation"):
            if not item.get(key):
                errors.append(f"item {index} missing {key}")
        record = item.get("record")
        if not isinstance(record, dict):
            errors.append(f"item {index} missing record")
            continue
        if not record.get("source_chunk_id"):
            errors.append(f"item {index} record missing source_chunk_id")
        if not record.get("citation"):
            errors.append(f"item {index} record missing citation")
        if not record.get("trust_tier"):
            errors.append(f"item {index} record missing trust_tier")
        if record.get("visibility") == "withheld_evaluator":
            errors.append(f"item {index} has evaluator-only visibility")
    return errors


class KnowledgeSpace:
    def __init__(self, ledger_path: Path = DEFAULT_LEDGER) -> None:
        self.ledger_path = ledger_path
        self.records: dict[str, KnowledgeRecord] = {}
        self._load()

    def _load(self) -> None:
        if not self.ledger_path.exists():
            return
        with self.ledger_path.open("r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                record = KnowledgeRecord.from_json(json.loads(line))
                self.records[record.id] = record

    def ingest_case(self, case_dir: Path, include_evaluator: bool = False) -> list[KnowledgeRecord]:
        if not case_dir.exists():
            raise FileNotFoundError(case_dir)
        source_paths = sorted(case_dir.glob("*.md"))
        created: list[KnowledgeRecord] = []
        existing_ids = set(self.records)

        for path in source_paths:
            visibility = source_visibility(path)
            if visibility != "public" and not include_evaluator:
                continue
            text = path.read_text(encoding="utf-8")
            lines = text.splitlines()
            search_start = 0
            for sentence in self._research_sentences(text):
                kind = infer_kind(sentence)
                source_case = case_dir.name
                source_ref = str(path.relative_to(REPO_ROOT))
                line_start, line_end, search_start = sentence_line_span(
                    text,
                    sentence,
                    search_start,
                )
                heading = current_heading(lines, line_start)
                citation = f"{source_ref}:{line_start}-{line_end}"
                record = KnowledgeRecord(
                    id=record_id(kind, source_case, source_ref, sentence),
                    kind=kind,
                    text=sentence,
                    tags=infer_tags(sentence, source_case),
                    source_case=source_case,
                    source_path=source_ref,
                    visibility=visibility,
                    trust_tier="candidate" if visibility == "public" else "withheld",
                    source_chunk_id=source_chunk_id(source_ref, line_start, line_end, sentence),
                    line_start=line_start,
                    line_end=line_end,
                    heading=heading,
                    citation=citation,
                )
                if record.id not in existing_ids:
                    self.records[record.id] = record
                    created.append(record)
                    existing_ids.add(record.id)

        self._append(created)
        return created

    def research_problem(
        self,
        problem_statement: str,
        corpus_root: Path = CASE_ROOT,
        limit: int = 3,
        exclude_cases: set[str] | None = None,
    ) -> dict[str, Any]:
        excluded = set(exclude_cases or set()) | infer_target_cases(problem_statement, corpus_root)
        ranked_sources = self.rank_case_sources(
            problem_statement,
            corpus_root,
            exclude_cases=excluded,
        )
        chosen_sources = ranked_sources[:limit]
        records_ingested = 0
        for source in chosen_sources:
            created = self.ingest_case(corpus_root / source["case"])
            records_ingested += len(created)
        return {
            "problem_summary": summarize_problem(problem_statement),
            "chosen_sources": chosen_sources,
            "records_ingested": records_ingested,
            "ledger": str(self.ledger_path),
        }

    def rank_case_sources(
        self,
        problem_statement: str,
        corpus_root: Path = CASE_ROOT,
        exclude_cases: set[str] | None = None,
    ) -> list[dict[str, Any]]:
        exclude_cases = exclude_cases or set()
        query_tokens = tokenize(problem_statement)
        query_tags = set(infer_tags(problem_statement, "query"))
        if "fsd" in problem_statement.lower() or "autonom" in problem_statement.lower():
            query_tags.add("fsd")
        ranked: list[dict[str, Any]] = []

        for case_dir in sorted(path for path in corpus_root.iterdir() if path.is_dir()):
            if case_dir.name in exclude_cases:
                continue
            public_text = read_public_case_text(case_dir)
            if not public_text.strip():
                continue
            source_tokens = tokenize(public_text)
            source_tags = set(infer_tags(public_text, case_dir.name))
            overlap = query_tokens & source_tokens
            tag_overlap = query_tags & source_tags
            name_overlap = query_tokens & set(case_dir.name.replace("-", " ").split())
            score = len(overlap) + 2 * len(tag_overlap) + 3 * len(name_overlap)
            if case_dir.name.startswith("fsd-") and "fsd" in query_tags:
                score += 4
            if "sibling" in public_text.lower() and "sibling" in problem_statement.lower():
                score += 3
            if score <= 0:
                continue
            ranked.append(
                {
                    "case": case_dir.name,
                    "score": score,
                    "matched_terms": sorted(overlap)[:12],
                    "matched_tags": sorted(tag_overlap),
                    "reason": research_reason(overlap, tag_overlap, name_overlap, case_dir.name),
                }
            )

        ranked.sort(key=lambda item: (-int(item["score"]), str(item["case"])))
        return ranked

    def retrieve(self, problem_statement: str, limit: int = 8) -> KnowledgePacket:
        query_tokens = tokenize(problem_statement)
        tag_set = set(infer_tags(problem_statement, "query"))
        if "fsd" in problem_statement.lower() or "autonom" in problem_statement.lower():
            tag_set.add("fsd")
        query_tags = sorted(tag_set)
        scored: list[PacketItem] = []

        for record in self.records.values():
            if record.visibility != "public":
                continue
            record_tokens = tokenize(record.text)
            overlap = query_tokens & record_tokens
            tag_overlap = set(query_tags) & set(record.tags)
            if not overlap and not tag_overlap:
                continue
            score = len(overlap) + (2.0 * len(tag_overlap))
            if record.source_case in problem_statement:
                score += 2.0
            if "sibling" in record.text.lower() or "sibling" in problem_statement.lower():
                score += 1.5
            if "substrate" in record.text.lower() and "substrate" in problem_statement.lower():
                score += 1.0
            reason = self._reason(overlap, tag_overlap, record)
            scored.append(PacketItem(record=record, score=round(score, 2), reason=reason))

        scored.sort(key=lambda item: (-item.score, item.record.source_case, item.record.id))
        return KnowledgePacket(query_tags=query_tags, items=scored[:limit])

    def select_packet(
        self,
        problem_statement: str,
        target_case: str,
        limit: int = 8,
        exclude_cases: set[str] | None = None,
    ) -> KnowledgePacket:
        excluded_cases = sorted(exclude_cases or set())
        base_packet = self.retrieve(problem_statement, limit=max(limit * 4, limit))
        request = KnowledgePacketRequest(
            problem_summary=summarize_problem(problem_statement),
            target_case=target_case,
            max_items=limit,
            excluded_cases=excluded_cases,
        )
        excluded = [
            ExcludedKnowledgeItem(
                case=case,
                reason="target case excluded from prior-memory retrieval"
                if case == target_case
                else "case excluded from prior-memory retrieval",
            )
            for case in excluded_cases
        ]
        return KnowledgePacket(
            query_tags=base_packet.query_tags,
            items=[
                item
                for item in base_packet.items
                if item.record.source_case not in set(excluded_cases)
            ][:limit],
            request=request,
            excluded=excluded,
        )

    def request_collapse(self, events: list[dict[str, Any]]) -> dict[str, Any]:
        run_event = next((event for event in events if event.get("type") == "run.configured"), {})
        run_id = str(run_event.get("runId", "unknown-run"))
        run_payload = run_event.get("payload") or {}
        target_case = str(run_payload.get("target_case", "unknown-case"))
        candidates: dict[str, dict[str, Any]] = {}
        extracted_items: list[dict[str, Any]] = []

        for event in events:
            payload = event.get("payload") or {}
            if event.get("type") == "candidate.produced":
                candidate_id = str(payload.get("candidate_id", "unknown-candidate"))
                candidates[candidate_id] = {
                    "candidate_id": candidate_id,
                    "agenome_id": str(payload.get("agenome_id", "")),
                    "survived": bool(payload.get("survived", False)),
                    "artifact": str(payload.get("artifact", "")),
                    "sequence": int(event.get("sequence", 0)),
                }
            if event.get("type") == "critic.review":
                candidate_id = str(payload.get("candidate_id", "unknown-candidate"))
                candidate = candidates.get(candidate_id, {})
                critic_id = str(payload.get("critic_id", "unknown-critic"))
                for item in payload.get("extracted_knowledge") or []:
                    extracted_items.append(
                        {
                            "kind": str(item.get("kind", "ResearchFinding")),
                            "text": str(item.get("text", "")),
                            "tags": list(item.get("tags") or []),
                            "trust_tier": str(item.get("trust_tier", "candidate")),
                            "run_id": run_id,
                            "target_case": target_case,
                            "candidate_id": candidate_id,
                            "critic_id": critic_id,
                            "agenome_id": str(candidate.get("agenome_id", "")),
                            "candidate_survived": bool(candidate.get("survived", False)),
                            "origin_event_sequence": int(event.get("sequence", 0)),
                            "source_path": f"run-events/{run_id}.json",
                            "citation": f"run-events/{run_id}.json#sequence-{event.get('sequence', 0)}",
                        }
                    )

        return {
            "type": "knowledge.collapse_packet",
            "run_id": run_id,
            "target_case": target_case,
            "items": extracted_items,
            "source_event_count": len(events),
        }

    def ingest_collapse_packet(self, collapse_packet: dict[str, Any]) -> list[KnowledgeRecord]:
        created: list[KnowledgeRecord] = []
        existing_ids = set(self.records)
        run_id = str(collapse_packet.get("run_id", "unknown-run"))
        target_case = str(collapse_packet.get("target_case", "unknown-case"))
        for item in collapse_packet.get("items") or []:
            text = str(item.get("text", "")).strip()
            if not text:
                continue
            kind = str(item.get("kind", "ResearchFinding"))
            source_path = str(item.get("source_path", f"run-events/{run_id}.json"))
            origin_sequence = int(item.get("origin_event_sequence", 0))
            citation = str(item.get("citation", f"{source_path}#sequence-{origin_sequence}"))
            chunk = source_chunk_id(source_path, origin_sequence, origin_sequence, text)
            record = KnowledgeRecord(
                id=record_id(kind, target_case, source_path, text),
                kind=kind,
                text=text,
                tags=sorted(set(item.get("tags") or infer_tags(text, target_case))),
                source_case=target_case,
                source_path=source_path,
                visibility="public",
                trust_tier=str(item.get("trust_tier", "candidate")),
                source_chunk_id=chunk,
                line_start=origin_sequence,
                line_end=origin_sequence,
                heading=f"Collapse from {run_id}",
                citation=citation,
                run_id=run_id,
                candidate_id=str(item.get("candidate_id", "")),
                critic_id=str(item.get("critic_id", "")),
                origin_event_sequence=origin_sequence,
                agenome_id=str(item.get("agenome_id", "")),
            )
            if record.id not in existing_ids:
                self.records[record.id] = record
                created.append(record)
                existing_ids.add(record.id)
        self._append(created)
        return created

    def graph_projection(self) -> dict[str, Any]:
        nodes: dict[str, dict[str, Any]] = {}
        edges: list[dict[str, str]] = []

        for record in sorted(self.records.values(), key=lambda item: item.id):
            case_id = f"case:{record.source_case}"
            source_id = f"source:{record.source_path}"
            record_id_value = f"record:{record.id}"

            nodes.setdefault(
                case_id,
                {"id": case_id, "label": record.source_case, "type": "Case"},
            )
            nodes.setdefault(
                source_id,
                {"id": source_id, "label": record.source_path, "type": "Source"},
            )
            nodes[record_id_value] = {
                "id": record_id_value,
                "label": record.kind,
                "type": "KnowledgeRecord",
                "kind": record.kind,
                "text": record.text,
                "trustTier": record.trust_tier,
                "visibility": record.visibility,
                "sourceChunkId": record.source_chunk_id,
                "citation": record.citation,
                "lineStart": record.line_start,
                "lineEnd": record.line_end,
                "heading": record.heading,
                "runId": record.run_id,
                "candidateId": record.candidate_id,
                "criticId": record.critic_id,
                "agenomeId": record.agenome_id,
            }
            edges.append({"source": record_id_value, "target": case_id, "type": "FROM_CASE"})
            edges.append({"source": record_id_value, "target": source_id, "type": "SUPPORTED_BY"})

            if record.run_id:
                run_id = f"run:{record.run_id}"
                nodes.setdefault(
                    run_id,
                    {"id": run_id, "label": record.run_id, "type": "Run"},
                )
                edges.append({"source": record_id_value, "target": run_id, "type": "DERIVED_FROM_RUN"})
            if record.candidate_id:
                candidate_id = f"candidate:{record.candidate_id}"
                nodes.setdefault(
                    candidate_id,
                    {
                        "id": candidate_id,
                        "label": record.candidate_id,
                        "type": "Candidate",
                        "agenomeId": record.agenome_id,
                    },
                )
                edges.append({"source": record_id_value, "target": candidate_id, "type": "SUPPORTED_BY_CANDIDATE"})
                if record.run_id:
                    edges.append({"source": candidate_id, "target": f"run:{record.run_id}", "type": "PART_OF_RUN"})
            if record.critic_id:
                critic_id = f"critic:{record.critic_id}"
                nodes.setdefault(
                    critic_id,
                    {"id": critic_id, "label": record.critic_id, "type": "CriticReview"},
                )
                edges.append({"source": record_id_value, "target": critic_id, "type": "FLAGGED_BY_CRITIC"})
                if record.candidate_id:
                    edges.append({"source": critic_id, "target": f"candidate:{record.candidate_id}", "type": "REVIEWED_CANDIDATE"})

            for tag in record.tags:
                tag_id = f"tag:{tag}"
                nodes.setdefault(tag_id, {"id": tag_id, "label": tag, "type": "Tag"})
                edges.append({"source": record_id_value, "target": tag_id, "type": "HAS_TAG"})

        return {"nodes": list(nodes.values()), "edges": edges}

    def to_cypher(self) -> str:
        lines = [
            "// Neo4j projection generated from the portable knowledge.jsonl ledger.",
            "// The ledger remains the durable substrate; this is a query/read projection.",
            "CREATE CONSTRAINT knowledge_record_id IF NOT EXISTS FOR (r:KnowledgeRecord) REQUIRE r.id IS UNIQUE;",
            "CREATE CONSTRAINT case_id IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE;",
            "CREATE CONSTRAINT tag_id IF NOT EXISTS FOR (t:Tag) REQUIRE t.id IS UNIQUE;",
            "CREATE CONSTRAINT source_id IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE;",
            "CREATE CONSTRAINT run_id IF NOT EXISTS FOR (run:Run) REQUIRE run.id IS UNIQUE;",
            "CREATE CONSTRAINT candidate_id IF NOT EXISTS FOR (cand:Candidate) REQUIRE cand.id IS UNIQUE;",
            "CREATE CONSTRAINT critic_id IF NOT EXISTS FOR (critic:CriticReview) REQUIRE critic.id IS UNIQUE;",
            "",
        ]
        for record in sorted(self.records.values(), key=lambda item: item.id):
            case_id = record.source_case
            source_id = record.source_path
            lines.extend(
                [
                    f"MERGE (c:Case {{id: {cypher_value(case_id)}}})",
                    f"  SET c.title = {cypher_value(case_id)};",
                    f"MERGE (s:Source {{id: {cypher_value(source_id)}}})",
                    f"  SET s.path = {cypher_value(source_id)};",
                    f"MERGE (r:KnowledgeRecord {{id: {cypher_value(record.id)}}})",
                    "  SET "
                    + ", ".join(
                        [
                            f"r.kind = {cypher_value(record.kind)}",
                            f"r.text = {cypher_value(record.text)}",
                            f"r.trustTier = {cypher_value(record.trust_tier)}",
                            f"r.visibility = {cypher_value(record.visibility)}",
                            f"r.sourceChunkId = {cypher_value(record.source_chunk_id)}",
                            f"r.citation = {cypher_value(record.citation)}",
                            f"r.lineStart = {record.line_start}",
                            f"r.lineEnd = {record.line_end}",
                            f"r.heading = {cypher_value(record.heading)}",
                            f"r.runId = {cypher_value(record.run_id)}",
                            f"r.candidateId = {cypher_value(record.candidate_id)}",
                            f"r.criticId = {cypher_value(record.critic_id)}",
                            f"r.agenomeId = {cypher_value(record.agenome_id)}",
                        ]
                    )
                    + ";",
                    f"MATCH (r:KnowledgeRecord {{id: {cypher_value(record.id)}}}), (c:Case {{id: {cypher_value(case_id)}}})",
                    "MERGE (r)-[:FROM_CASE]->(c);",
                    f"MATCH (r:KnowledgeRecord {{id: {cypher_value(record.id)}}}), (s:Source {{id: {cypher_value(source_id)}}})",
                    "MERGE (r)-[:SUPPORTED_BY]->(s);",
                ]
            )
            if record.run_id:
                lines.extend(
                    [
                        f"MERGE (run:Run {{id: {cypher_value(record.run_id)}}}) SET run.title = {cypher_value(record.run_id)};",
                        f"MATCH (r:KnowledgeRecord {{id: {cypher_value(record.id)}}}), (run:Run {{id: {cypher_value(record.run_id)}}})",
                        "MERGE (r)-[:DERIVED_FROM_RUN]->(run);",
                    ]
                )
            if record.candidate_id:
                lines.extend(
                    [
                        f"MERGE (cand:Candidate {{id: {cypher_value(record.candidate_id)}}}) SET cand.agenomeId = {cypher_value(record.agenome_id)};",
                        f"MATCH (r:KnowledgeRecord {{id: {cypher_value(record.id)}}}), (cand:Candidate {{id: {cypher_value(record.candidate_id)}}})",
                        "MERGE (r)-[:SUPPORTED_BY_CANDIDATE]->(cand);",
                    ]
                )
                if record.run_id:
                    lines.extend(
                        [
                            f"MATCH (cand:Candidate {{id: {cypher_value(record.candidate_id)}}}), (run:Run {{id: {cypher_value(record.run_id)}}})",
                            "MERGE (cand)-[:PART_OF_RUN]->(run);",
                        ]
                    )
            if record.critic_id:
                lines.extend(
                    [
                        f"MERGE (critic:CriticReview {{id: {cypher_value(record.critic_id)}}}) SET critic.title = {cypher_value(record.critic_id)};",
                        f"MATCH (r:KnowledgeRecord {{id: {cypher_value(record.id)}}}), (critic:CriticReview {{id: {cypher_value(record.critic_id)}}})",
                        "MERGE (r)-[:FLAGGED_BY_CRITIC]->(critic);",
                    ]
                )
                if record.candidate_id:
                    lines.extend(
                        [
                            f"MATCH (critic:CriticReview {{id: {cypher_value(record.critic_id)}}}), (cand:Candidate {{id: {cypher_value(record.candidate_id)}}})",
                            "MERGE (critic)-[:REVIEWED_CANDIDATE]->(cand);",
                        ]
                    )
            for tag in record.tags:
                lines.extend(
                    [
                        f"MERGE (t:Tag {{id: {cypher_value(tag)}}}) SET t.name = {cypher_value(tag)};",
                        f"MATCH (r:KnowledgeRecord {{id: {cypher_value(record.id)}}}), (t:Tag {{id: {cypher_value(tag)}}})",
                        "MERGE (r)-[:HAS_TAG]->(t);",
                    ]
                )
            lines.append("")
        return "\n".join(lines).rstrip() + "\n"

    def write_cypher(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(self.to_cypher(), encoding="utf-8")

    def write_graph_html(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(render_graph_html(self.graph_projection()), encoding="utf-8")

    def _append(self, records: list[KnowledgeRecord]) -> None:
        if not records:
            return
        self.ledger_path.parent.mkdir(parents=True, exist_ok=True)
        with self.ledger_path.open("a", encoding="utf-8") as f:
            for record in records:
                f.write(json.dumps(record.to_json(), sort_keys=True) + "\n")

    def _research_sentences(self, text: str) -> list[str]:
        selected: list[str] = []
        for sentence in split_sentences(text):
            lowered = sentence.lower()
            if any(term in lowered for terms in KIND_TERMS.values() for term in terms):
                selected.append(sentence)
            elif any(term in lowered for term in ("substrate", "autonomy", "fsd", "driver", "crash")):
                selected.append(sentence)
        return selected

    def _reason(
        self, overlap: set[str], tag_overlap: set[str], record: KnowledgeRecord
    ) -> str:
        parts: list[str] = []
        if tag_overlap:
            parts.append("shared tags: " + ", ".join(sorted(tag_overlap)))
        if overlap:
            parts.append("shared terms: " + ", ".join(sorted(overlap)[:8]))
        if "sibling" in record.text.lower():
            parts.append("sibling-cluster reference")
        if record.kind in {"hidden_variable", "warning"}:
            parts.append(f"{record.kind} memory")
        return "; ".join(parts) or "lexical relevance"


def demo(use_openrouter: bool = False, model: str = DEFAULT_OPENROUTER_MODEL) -> None:
    ledger = DEFAULT_LEDGER
    if ledger.exists():
        ledger.unlink()
    space = KnowledgeSpace(ledger)

    target_case = CASE_ROOT / "fsd-ownership-unwind"
    query = (target_case / "problem-statement.md").read_text(encoding="utf-8")
    research_report = space.research_problem(
        query,
        CASE_ROOT,
        limit=3,
        exclude_cases={target_case.name},
    )
    mock_events = json.loads((FIXTURE_DIR / "mock_run_events.json").read_text(encoding="utf-8"))
    collapse_packet = space.request_collapse(mock_events)
    collapse_records = space.ingest_collapse_packet(collapse_packet)
    packet = space.select_packet(
        query,
        target_case=target_case.name,
        limit=10,
        exclude_cases={target_case.name},
    )
    openrouter_summary = None
    if use_openrouter:
        api_key = load_openrouter_key()
        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY not found in environment or tokens and keys.md")
        openrouter_summary = openrouter_research_summary(query, research_report, api_key, model=model)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "research_report.json").write_text(
        json.dumps(research_report, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (OUT_DIR / "collapse_packet.json").write_text(
        json.dumps(collapse_packet, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (OUT_DIR / "knowledge_packet.json").write_text(
        json.dumps(packet.to_json(), indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    packet_event = packet.to_run_event(run_id="demo-knowledge-space", sequence=1)
    validation_errors = validate_packet_event(packet_event)
    if validation_errors:
        raise RuntimeError("invalid knowledge packet event: " + "; ".join(validation_errors))
    (OUT_DIR / "knowledge_packet_event.json").write_text(
        json.dumps(
            packet_event,
            indent=2,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )
    (OUT_DIR / "report.md").write_text(
        render_report(research_report, target_case.name, packet, openrouter_summary),
        encoding="utf-8",
    )
    space.write_cypher(OUT_DIR / "neo4j.cypher")
    space.write_graph_html(OUT_DIR / "graph.html")

    print(f"Knowledge ledger: {ledger.relative_to(ROOT)}")
    print(f"Research report: {(OUT_DIR / 'research_report.json').relative_to(ROOT)}")
    print(f"Collapse packet: {(OUT_DIR / 'collapse_packet.json').relative_to(ROOT)}")
    print(f"Report: {(OUT_DIR / 'report.md').relative_to(ROOT)}")
    print(f"Packet: {(OUT_DIR / 'knowledge_packet.json').relative_to(ROOT)}")
    print(f"Packet event: {(OUT_DIR / 'knowledge_packet_event.json').relative_to(ROOT)}")
    print(f"Graph: {(OUT_DIR / 'graph.html').relative_to(ROOT)}")
    print(f"Neo4j import: {(OUT_DIR / 'neo4j.cypher').relative_to(ROOT)}")
    print(f"Collapsed {len(collapse_records)} run-derived memory item(s)")
    print(f"Retrieved {len(packet.items)} memory item(s) for {target_case.name}")


def render_report(
    research_report: dict[str, Any],
    target_case: str,
    packet: KnowledgePacket,
    openrouter_summary: str | None = None,
) -> str:
    lines = [
        "# Knowledge Space Demo Report",
        "",
        "## Local Research Pass",
        "",
        f"Problem summary: {research_report['problem_summary']}",
        "",
    ]
    for source in research_report["chosen_sources"]:
        lines.append(
            f"- `{source['case']}`: score `{source['score']}`; {source['reason']}"
        )
    lines.extend(
        [
            "",
            f"Records ingested: `{research_report['records_ingested']}`",
            "",
        ]
    )
    if openrouter_summary:
        lines.extend(
            [
                "## OpenRouter Research Memo",
                "",
                openrouter_summary,
                "",
            ]
        )
    lines.extend(
        [
            "",
            "## Later Problem",
            "",
            f"`{target_case}`",
            "",
            "## Retrieved Knowledge Packet",
            "",
            f"Query tags: {', '.join(packet.query_tags)}",
            "",
        ]
    )
    for index, item in enumerate(packet.items, start=1):
        lines.extend(
            [
                f"### {index}. {item.cite_handle} - {item.record.kind} from `{item.record.source_case}`",
                "",
                f"Score: `{item.score}`",
                "",
                f"Reason: {item.reason}",
                "",
                item.record.text,
                "",
                f"Source: `{item.record.citation}`",
                "",
                f"Chunk: `{item.record.source_chunk_id}`",
                "",
            ]
        )
    return "\n".join(lines)


def render_graph_html(graph: dict[str, Any]) -> str:
    nodes = graph["nodes"]
    edges = graph["edges"]
    type_colors = {
        "Case": "#0f766e",
        "Candidate": "#2563eb",
        "CriticReview": "#be123c",
        "KnowledgeRecord": "#7c3aed",
        "Run": "#0f172a",
        "Source": "#475569",
        "Tag": "#c2410c",
    }
    node_lookup = {node["id"]: node for node in nodes}
    adjacency: dict[str, list[dict[str, Any]]] = {}
    for edge in edges:
        adjacency.setdefault(edge["source"], []).append(edge)
    rows = []
    for node in sorted(nodes, key=lambda item: (item["type"], item["label"])):
        color = type_colors.get(node["type"], "#334155")
        text = html.escape(str(node.get("text", "")))
        metadata = ""
        if node["type"] == "KnowledgeRecord":
            citation = html.escape(str(node.get("citation", "")))
            chunk = html.escape(str(node.get("sourceChunkId", "")))
            heading = html.escape(str(node.get("heading", "")))
            metadata_parts = [f"<strong>Citation:</strong> {citation}", f"<strong>Chunk:</strong> {chunk}"]
            if heading:
                metadata_parts.append(f"<strong>Heading:</strong> {heading}")
            if node.get("runId"):
                metadata_parts.append(f"<strong>Run:</strong> {html.escape(str(node['runId']))}")
            if node.get("candidateId"):
                metadata_parts.append(f"<strong>Candidate:</strong> {html.escape(str(node['candidateId']))}")
            if node.get("criticId"):
                metadata_parts.append(f"<strong>Critic:</strong> {html.escape(str(node['criticId']))}")
            metadata = "<div class=\"node-meta\">" + "<br>".join(metadata_parts) + "</div>"
        related = []
        for edge in adjacency.get(node["id"], []):
            target = node_lookup.get(edge["target"], {"label": edge["target"], "type": "Unknown"})
            related.append(f"{html.escape(edge['type'])} -> {html.escape(str(target['label']))}")
        card_lines = [
            f'<article class="node-card" style="border-left-color:{color}">',
            f'  <div class="node-type">[{html.escape(node["type"])}]</div>',
            f"  <h2>{html.escape(str(node['label']))}</h2>",
            f"  <p>{text}</p>",
        ]
        if metadata:
            card_lines.append(f"  {metadata}")
        card_lines.extend(
            [
                f"  <ul>{''.join(f'<li>{item}</li>' for item in related[:8])}</ul>",
                "</article>",
            ]
        )
        rows.append("\n".join(card_lines))

    edge_rows = "\n".join(
        f"<tr><td>{html.escape(edge['type'])}</td><td>{html.escape(edge['source'])}</td><td>{html.escape(edge['target'])}</td></tr>"
        for edge in edges
    )
    graph_json = (
        json.dumps(graph, sort_keys=True)
        .replace("<", "\\u003c")
        .replace("</", "<\\/")
    )
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Doppl Knowledge Space</title>
  <style>
    body {{
      margin: 0;
      background: #f8fafc;
      color: #0f172a;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}
    header {{
      background: #0f172a;
      color: #f8fafc;
      padding: 24px 32px;
    }}
    h1 {{
      margin: 0 0 8px;
      font-size: 28px;
    }}
    main {{
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
      padding: 24px;
    }}
    .workbench {{
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr) 320px;
      gap: 16px;
      align-items: stretch;
    }}
    .panel {{
      background: white;
      border: 1px solid #e2e8f0;
      padding: 14px;
      min-width: 0;
    }}
    .panel h2 {{
      font-size: 15px;
      margin: 0 0 10px;
    }}
    .controls {{
      display: grid;
      gap: 10px;
      align-content: start;
    }}
    label {{
      color: #475569;
      display: grid;
      font-size: 12px;
      font-weight: 700;
      gap: 6px;
    }}
    input {{
      border: 1px solid #cbd5e1;
      color: #0f172a;
      font: inherit;
      padding: 9px 10px;
      width: 100%;
      box-sizing: border-box;
    }}
    input:focus, button:focus {{
      outline: 2px solid #0f766e;
      outline-offset: 2px;
    }}
    .filter-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }}
    button {{
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      cursor: pointer;
      font: inherit;
      padding: 8px 9px;
      text-align: left;
    }}
    button.active {{
      background: #0f766e;
      border-color: #0f766e;
      color: white;
    }}
    .graph-panel {{
      min-height: 520px;
      overflow: hidden;
      position: relative;
    }}
    #graph-canvas {{
      background:
        linear-gradient(#e2e8f0 1px, transparent 1px),
        linear-gradient(90deg, #e2e8f0 1px, transparent 1px),
        #f8fafc;
      background-size: 32px 32px;
      border: 1px solid #cbd5e1;
      height: 520px;
      width: 100%;
    }}
    .graph-edge {{
      stroke: #94a3b8;
      stroke-width: 1.4;
      opacity: 0.65;
    }}
    .graph-node circle {{
      cursor: pointer;
      filter: drop-shadow(0 2px 3px rgb(15 23 42 / 0.16));
      stroke: white;
      stroke-width: 2;
    }}
    .graph-node text {{
      fill: #0f172a;
      font-size: 11px;
      pointer-events: none;
    }}
    .graph-node.dim, .graph-edge.dim {{
      opacity: 0.08;
    }}
    .graph-node.active circle {{
      stroke: #0f172a;
      stroke-width: 3;
    }}
    .detail-empty {{
      color: #64748b;
      font-size: 13px;
      line-height: 1.45;
    }}
    .detail-kv {{
      color: #334155;
      font-size: 12px;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }}
    .detail-text {{
      border-top: 1px solid #e2e8f0;
      color: #0f172a;
      font-size: 13px;
      line-height: 1.45;
      margin-top: 10px;
      max-height: 230px;
      overflow: auto;
      padding-top: 10px;
    }}
    .summary {{
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }}
    .metric {{
      background: white;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
    }}
    .cards {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px;
    }}
    .node-card {{
      background: white;
      border: 1px solid #e2e8f0;
      border-left: 6px solid #334155;
      padding: 14px;
      min-height: 140px;
    }}
    .node-card h2 {{
      margin: 4px 0 8px;
      font-size: 16px;
      overflow-wrap: anywhere;
    }}
    .node-card p {{
      color: #334155;
      font-size: 13px;
      line-height: 1.45;
      max-height: 110px;
      overflow: auto;
    }}
    .node-type {{
      color: #64748b;
      font-size: 12px;
      font-weight: 700;
    }}
    .node-meta {{
      color: #475569;
      font-size: 12px;
      line-height: 1.45;
      margin: 8px 0;
      overflow-wrap: anywhere;
    }}
    li {{
      font-size: 12px;
      margin-bottom: 4px;
      overflow-wrap: anywhere;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      background: white;
      font-size: 12px;
    }}
    th, td {{
      border: 1px solid #e2e8f0;
      padding: 8px;
      text-align: left;
      overflow-wrap: anywhere;
    }}
    th {{
      background: #e2e8f0;
    }}
    @media (max-width: 920px) {{
      .workbench {{
        grid-template-columns: 1fr;
      }}
      #graph-canvas {{
        height: 440px;
      }}
    }}
  </style>
</head>
<body>
  <header>
    <h1>Doppl Knowledge Space</h1>
    <div>Local graph projection from the durable JSONL ledger. Neo4j can import the sibling Cypher file.</div>
  </header>
  <main>
    <section class="summary">
      <div class="metric"><strong>{len(nodes)}</strong><br>nodes</div>
      <div class="metric"><strong>{len(edges)}</strong><br>edges</div>
      <div class="metric"><strong>{sum(1 for node in nodes if node['type'] == 'KnowledgeRecord')}</strong><br>KnowledgeRecord nodes</div>
    </section>
    <section class="workbench" aria-label="Interactive knowledge graph workbench">
      <aside class="panel controls">
        <h2>Filter</h2>
        <label for="graph-search">
          Search nodes
          <input id="graph-search" type="search" placeholder="case, tag, citation, text">
        </label>
        <div class="filter-grid" role="group" aria-label="Node type filter">
          <button type="button" class="active" data-filter="all">All</button>
          <button type="button" data-filter="KnowledgeRecord">Records</button>
          <button type="button" data-filter="Run">Runs</button>
          <button type="button" data-filter="Candidate">Candidates</button>
          <button type="button" data-filter="CriticReview">Critics</button>
          <button type="button" data-filter="Case">Cases</button>
          <button type="button" data-filter="Source">Sources</button>
          <button type="button" data-filter="Tag">Tags</button>
        </div>
      </aside>
      <section class="panel graph-panel">
        <h2>Graph</h2>
        <svg id="graph-canvas" role="img" aria-label="Knowledge graph projection"></svg>
      </section>
      <aside class="panel" id="node-detail">
        <h2>Selection</h2>
        <div class="detail-empty">Select a node to inspect its text, source citation, and outgoing relationships.</div>
      </aside>
    </section>
    <section class="cards">
      {''.join(rows)}
    </section>
    <section>
      <h2>Edges</h2>
      <table>
        <thead><tr><th>Type</th><th>Source</th><th>Target</th></tr></thead>
        <tbody>{edge_rows}</tbody>
      </table>
    </section>
  </main>
  <script type="application/json" id="graph-data">{graph_json}</script>
  <script>
    const graphData = JSON.parse(document.getElementById("graph-data").textContent);
    const colors = {{
      Case: "#0f766e",
      Candidate: "#2563eb",
      CriticReview: "#be123c",
      KnowledgeRecord: "#7c3aed",
      Run: "#0f172a",
      Source: "#475569",
      Tag: "#c2410c"
    }};
    const svg = document.getElementById("graph-canvas");
    const detail = document.getElementById("node-detail");
    const search = document.getElementById("graph-search");
    let activeFilter = "all";
    let selectedNodeId = null;

    function nodeMatches(node) {{
      const term = search.value.trim().toLowerCase();
      const typeMatches = activeFilter === "all" || node.type === activeFilter;
      if (!typeMatches) return false;
      if (!term) return true;
      return [
        node.id,
        node.label,
        node.type,
        node.kind,
        node.text,
        node.citation,
        node.sourceChunkId,
        node.heading,
        node.runId,
        node.candidateId,
        node.criticId,
        node.agenomeId
      ].filter(Boolean).join(" ").toLowerCase().includes(term);
    }}

    function layoutNodes(width, height) {{
      const buckets = ["Run", "Candidate", "CriticReview", "Case", "Source", "KnowledgeRecord", "Tag"];
      const byType = Object.fromEntries(buckets.map((type) => [type, []]));
      graphData.nodes.forEach((node) => {{
        (byType[node.type] || byType.KnowledgeRecord).push(node);
      }});
      const positions = new Map();
      buckets.forEach((type, column) => {{
        const items = byType[type] || [];
        const x = 70 + column * ((width - 140) / Math.max(1, buckets.length - 1));
        items.forEach((node, index) => {{
          const y = 58 + index * ((height - 116) / Math.max(1, items.length - 1));
          positions.set(node.id, {{ x, y }});
        }});
      }});
      return positions;
    }}

    function showDetail(node) {{
      selectedNodeId = node.id;
      const outgoing = graphData.edges
        .filter((edge) => edge.source === node.id)
        .slice(0, 12)
        .map((edge) => {{
          const target = graphData.nodes.find((candidate) => candidate.id === edge.target);
          return `<li>${{edge.type}} -> ${{target ? escapeHtml(target.label) : escapeHtml(edge.target)}}</li>`;
        }})
        .join("");
      const citation = node.citation ? `<div class="detail-kv"><strong>Citation:</strong> ${{escapeHtml(node.citation)}}</div>` : "";
      const chunk = node.sourceChunkId ? `<div class="detail-kv"><strong>Chunk:</strong> ${{escapeHtml(node.sourceChunkId)}}</div>` : "";
      const heading = node.heading ? `<div class="detail-kv"><strong>Heading:</strong> ${{escapeHtml(node.heading)}}</div>` : "";
      const run = node.runId ? `<div class="detail-kv"><strong>Run:</strong> ${{escapeHtml(node.runId)}}</div>` : "";
      const candidate = node.candidateId ? `<div class="detail-kv"><strong>Candidate:</strong> ${{escapeHtml(node.candidateId)}}</div>` : "";
      const critic = node.criticId ? `<div class="detail-kv"><strong>Critic:</strong> ${{escapeHtml(node.criticId)}}</div>` : "";
      const agenome = node.agenomeId ? `<div class="detail-kv"><strong>Agenome:</strong> ${{escapeHtml(node.agenomeId)}}</div>` : "";
      const text = node.text ? `<div class="detail-text">${{escapeHtml(node.text)}}</div>` : "";
      detail.innerHTML = `
        <h2>${{escapeHtml(node.label)}}</h2>
        <div class="detail-kv"><strong>Type:</strong> ${{escapeHtml(node.type)}}</div>
        ${{citation}}${{chunk}}${{heading}}${{run}}${{candidate}}${{critic}}${{agenome}}${{text}}
        <div class="detail-kv"><strong>Outgoing:</strong></div>
        <ul>${{outgoing || "<li>None</li>"}}</ul>
      `;
      renderGraph();
    }}

    function escapeHtml(value) {{
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }}

    function renderGraph() {{
      const width = svg.clientWidth || 900;
      const height = svg.clientHeight || 520;
      svg.setAttribute("viewBox", `0 0 ${{width}} ${{height}}`);
      svg.innerHTML = "";
      const positions = layoutNodes(width, height);
      const visible = new Set(graphData.nodes.filter(nodeMatches).map((node) => node.id));
      graphData.edges.forEach((edge) => {{
        const from = positions.get(edge.source);
        const to = positions.get(edge.target);
        if (!from || !to) return;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", from.x);
        line.setAttribute("y1", from.y);
        line.setAttribute("x2", to.x);
        line.setAttribute("y2", to.y);
        line.setAttribute("class", "graph-edge" + (visible.has(edge.source) && visible.has(edge.target) ? "" : " dim"));
        svg.appendChild(line);
      }});
      graphData.nodes.forEach((node) => {{
        const position = positions.get(node.id);
        if (!position) return;
        const matched = visible.has(node.id);
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("class", "graph-node" + (matched ? "" : " dim") + (selectedNodeId === node.id ? " active" : ""));
        group.setAttribute("tabindex", "0");
        group.setAttribute("role", "button");
        group.setAttribute("aria-label", `${{node.type}} ${{node.label}}`);
        group.addEventListener("click", () => showDetail(node));
        group.addEventListener("keydown", (event) => {{
          if (event.key === "Enter" || event.key === " ") {{
            event.preventDefault();
            showDetail(node);
          }}
        }});
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", position.x);
        circle.setAttribute("cy", position.y);
        circle.setAttribute("r", node.type === "KnowledgeRecord" ? 12 : 10);
        circle.setAttribute("fill", colors[node.type] || "#334155");
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", position.x + 15);
        label.setAttribute("y", position.y + 4);
        label.textContent = String(node.label).slice(0, 34);
        group.appendChild(circle);
        group.appendChild(label);
        svg.appendChild(group);
      }});
    }}

    search.addEventListener("input", renderGraph);
    document.querySelectorAll("[data-filter]").forEach((button) => {{
      button.addEventListener("click", () => {{
        activeFilter = button.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach((candidate) => candidate.classList.remove("active"));
        button.classList.add("active");
        renderGraph();
      }});
    }});
    window.addEventListener("resize", renderGraph);
    renderGraph();
  </script>
</body>
</html>
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Prototype Doppl Knowledge Space")
    parser.add_argument("--demo", action="store_true", help="run the FSD memory demo")
    parser.add_argument("--ingest-case", action="append", default=[], help="case-study folder name to ingest")
    parser.add_argument("--query-case", help="case-study folder name to query")
    parser.add_argument("--research-problem-file", help="problem statement file to research against the local corpus")
    parser.add_argument("--exclude-case", action="append", default=[], help="case folder name to exclude from research")
    parser.add_argument("--openrouter", action="store_true", help="use a cheap OpenRouter call to enrich the research report")
    parser.add_argument("--openrouter-model", default=DEFAULT_OPENROUTER_MODEL, help="OpenRouter model id")
    args = parser.parse_args()

    if args.demo or (not args.ingest_case and not args.query_case and not args.research_problem_file):
        demo(use_openrouter=args.openrouter, model=args.openrouter_model)
        return

    space = KnowledgeSpace(DEFAULT_LEDGER)
    if args.research_problem_file:
        problem = Path(args.research_problem_file).read_text(encoding="utf-8")
        report = space.research_problem(
            problem,
            CASE_ROOT,
            exclude_cases=set(args.exclude_case),
        )
        if args.openrouter:
            api_key = load_openrouter_key()
            if not api_key:
                raise RuntimeError("OPENROUTER_API_KEY not found in environment or tokens and keys.md")
            report["openrouter_summary"] = openrouter_research_summary(
                problem,
                report,
                api_key,
                model=args.openrouter_model,
            )
        print(json.dumps(report, indent=2, sort_keys=True))
    for case in args.ingest_case:
        created = space.ingest_case(CASE_ROOT / case)
        print(f"ingested {len(created)} record(s) from {case}")
    if args.query_case:
        query = (CASE_ROOT / args.query_case / "problem-statement.md").read_text(encoding="utf-8")
        packet = space.retrieve(query)
        print(json.dumps(packet.to_json(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
