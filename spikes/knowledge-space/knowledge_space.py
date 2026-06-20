#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parents[1]
CASE_ROOT = REPO_ROOT / "case-studies"
DEFAULT_LEDGER = ROOT / "data" / "knowledge.jsonl"
OUT_DIR = ROOT / "out"

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
        )


@dataclass(frozen=True)
class PacketItem:
    record: KnowledgeRecord
    score: float
    reason: str


@dataclass(frozen=True)
class KnowledgePacket:
    query_tags: list[str]
    items: list[PacketItem]

    def to_json(self) -> dict[str, Any]:
        return {
            "query_tags": self.query_tags,
            "items": [
                {
                    "score": item.score,
                    "reason": item.reason,
                    "record": item.record.to_json(),
                }
                for item in self.items
            ],
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


def cypher_value(value: str) -> str:
    return json.dumps(value)


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
            for sentence in self._research_sentences(text):
                kind = infer_kind(sentence)
                source_case = case_dir.name
                source_ref = str(path.relative_to(REPO_ROOT))
                record = KnowledgeRecord(
                    id=record_id(kind, source_case, source_ref, sentence),
                    kind=kind,
                    text=sentence,
                    tags=infer_tags(sentence, source_case),
                    source_case=source_case,
                    source_path=source_ref,
                    visibility=visibility,
                    trust_tier="candidate" if visibility == "public" else "withheld",
                )
                if record.id not in existing_ids:
                    self.records[record.id] = record
                    created.append(record)
                    existing_ids.add(record.id)

        self._append(created)
        return created

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
            }
            edges.append({"source": record_id_value, "target": case_id, "type": "FROM_CASE"})
            edges.append({"source": record_id_value, "target": source_id, "type": "SUPPORTED_BY"})

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
                        ]
                    )
                    + ";",
                    f"MATCH (r:KnowledgeRecord {{id: {cypher_value(record.id)}}}), (c:Case {{id: {cypher_value(case_id)}}})",
                    "MERGE (r)-[:FROM_CASE]->(c);",
                    f"MATCH (r:KnowledgeRecord {{id: {cypher_value(record.id)}}}), (s:Source {{id: {cypher_value(source_id)}}})",
                    "MERGE (r)-[:SUPPORTED_BY]->(s);",
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


def demo() -> None:
    ledger = DEFAULT_LEDGER
    if ledger.exists():
        ledger.unlink()
    space = KnowledgeSpace(ledger)
    seed_cases = ["fsd-accident-economy", "fsd-mobility-and-time"]
    ingest_counts: dict[str, int] = {}
    for case in seed_cases:
        ingest_counts[case] = len(space.ingest_case(CASE_ROOT / case))

    target_case = CASE_ROOT / "fsd-ownership-unwind"
    query = (target_case / "problem-statement.md").read_text(encoding="utf-8")
    packet = space.retrieve(query, limit=10)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "knowledge_packet.json").write_text(
        json.dumps(packet.to_json(), indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (OUT_DIR / "report.md").write_text(render_report(ingest_counts, target_case.name, packet), encoding="utf-8")
    space.write_cypher(OUT_DIR / "neo4j.cypher")
    space.write_graph_html(OUT_DIR / "graph.html")

    print(f"Knowledge ledger: {ledger.relative_to(ROOT)}")
    print(f"Report: {(OUT_DIR / 'report.md').relative_to(ROOT)}")
    print(f"Packet: {(OUT_DIR / 'knowledge_packet.json').relative_to(ROOT)}")
    print(f"Graph: {(OUT_DIR / 'graph.html').relative_to(ROOT)}")
    print(f"Neo4j import: {(OUT_DIR / 'neo4j.cypher').relative_to(ROOT)}")
    print(f"Retrieved {len(packet.items)} memory item(s) for {target_case.name}")


def render_report(
    ingest_counts: dict[str, int], target_case: str, packet: KnowledgePacket
) -> str:
    lines = [
        "# Knowledge Space Demo Report",
        "",
        "## Ingested Research",
        "",
    ]
    for case, count in ingest_counts.items():
        lines.append(f"- `{case}`: {count} knowledge records")
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
                f"### {index}. {item.record.kind} from `{item.record.source_case}`",
                "",
                f"Score: `{item.score}`",
                "",
                f"Reason: {item.reason}",
                "",
                item.record.text,
                "",
                f"Source: `{item.record.source_path}`",
                "",
            ]
        )
    return "\n".join(lines)


def render_graph_html(graph: dict[str, Any]) -> str:
    nodes = graph["nodes"]
    edges = graph["edges"]
    type_colors = {
        "Case": "#0f766e",
        "KnowledgeRecord": "#7c3aed",
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
        related = []
        for edge in adjacency.get(node["id"], []):
            target = node_lookup.get(edge["target"], {"label": edge["target"], "type": "Unknown"})
            related.append(f"{html.escape(edge['type'])} -> {html.escape(str(target['label']))}")
        rows.append(
            f"""
            <article class="node-card" style="border-left-color:{color}">
              <div class="node-type">[{html.escape(node['type'])}]</div>
              <h2>{html.escape(str(node['label']))}</h2>
              <p>{text}</p>
              <ul>{''.join(f'<li>{item}</li>' for item in related[:8])}</ul>
            </article>
            """
        )

    edge_rows = "\n".join(
        f"<tr><td>{html.escape(edge['type'])}</td><td>{html.escape(edge['source'])}</td><td>{html.escape(edge['target'])}</td></tr>"
        for edge in edges
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
</body>
</html>
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Prototype Doppl Knowledge Space")
    parser.add_argument("--demo", action="store_true", help="run the FSD memory demo")
    parser.add_argument("--ingest-case", action="append", default=[], help="case-study folder name to ingest")
    parser.add_argument("--query-case", help="case-study folder name to query")
    args = parser.parse_args()

    if args.demo or (not args.ingest_case and not args.query_case):
        demo()
        return

    space = KnowledgeSpace(DEFAULT_LEDGER)
    for case in args.ingest_case:
        created = space.ingest_case(CASE_ROOT / case)
        print(f"ingested {len(created)} record(s) from {case}")
    if args.query_case:
        query = (CASE_ROOT / args.query_case / "problem-statement.md").read_text(encoding="utf-8")
        packet = space.retrieve(query)
        print(json.dumps(packet.to_json(), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
