#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from knowledge_space import KnowledgeSpace, load_openrouter_key


ROOT = Path(__file__).resolve().parents[2]
CASES = ROOT / "case-studies"


class KnowledgeSpaceTest(unittest.TestCase):
    def test_ingest_fsd_accident_preserves_substrate_research(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            records = space.ingest_case(CASES / "fsd-accident-economy")

            self.assertGreaterEqual(len(records), 5)
            texts = "\n".join(record.text.lower() for record in records)
            self.assertIn("crash", texts)
            self.assertIn("substrate", texts)
            self.assertTrue("organ" in texts or "donor" in texts)
            self.assertTrue("advertis" in texts or "media" in texts)

    def test_retrieve_prior_fsd_research_for_different_problem(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_case(CASES / "fsd-accident-economy")
            space.ingest_case(CASES / "fsd-mobility-and-time")

            query = (CASES / "fsd-ownership-unwind" / "problem-statement.md").read_text(
                encoding="utf-8"
            )
            packet = space.retrieve(query, limit=8)

            source_cases = {item.record.source_case for item in packet.items}
            self.assertIn("fsd-accident-economy", source_cases)
            self.assertIn("fsd-mobility-and-time", source_cases)
            self.assertNotIn("fsd-ownership-unwind", source_cases)
            self.assertTrue(any("sibling" in item.reason.lower() for item in packet.items))

    def test_ledger_persists_and_reloads_for_later_problem(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            ledger = Path(tmp) / "knowledge.jsonl"
            writer = KnowledgeSpace(ledger)
            writer.ingest_case(CASES / "fsd-accident-economy")

            reader = KnowledgeSpace(ledger)
            query = (CASES / "fsd-enforcement-economy" / "problem-statement.md").read_text(
                encoding="utf-8"
            )
            packet = reader.retrieve(query, limit=5)

            self.assertGreaterEqual(len(packet.items), 1)
            self.assertEqual(packet.items[0].record.source_case, "fsd-accident-economy")
            self.assertIn("fsd", packet.query_tags)

    def test_exports_neo4j_projection_without_replacing_ledger(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_case(CASES / "fsd-accident-economy")

            cypher = space.to_cypher()

            self.assertIn("MERGE (c:Case", cypher)
            self.assertIn("MERGE (r:KnowledgeRecord", cypher)
            self.assertIn("[:FROM_CASE]", cypher)
            self.assertIn("[:HAS_TAG]", cypher)
            self.assertIn("fsd-accident-economy", cypher)
            self.assertTrue(space.ledger_path.exists())

    def test_writes_local_html_graph_for_visual_inspection(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_case(CASES / "fsd-accident-economy")
            html_path = Path(tmp) / "graph.html"

            space.write_graph_html(html_path)
            html = html_path.read_text(encoding="utf-8")

            self.assertIn("Doppl Knowledge Space", html)
            self.assertIn("fsd-accident-economy", html)
            self.assertIn("KnowledgeRecord", html)
            self.assertIn("FROM_CASE", html)

    def test_research_problem_finds_and_ingests_relevant_cases(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            problem = """
            Autonomy is about to change car ownership. I want to understand the
            neighboring FSD cases: accident substrate, mobility and time, and the
            enforcement economy, before working on ownership unwind.
            """

            report = space.research_problem(problem, CASES, limit=3)

            chosen_cases = {item["case"] for item in report["chosen_sources"]}
            self.assertIn("fsd-accident-economy", chosen_cases)
            self.assertIn("fsd-mobility-and-time", chosen_cases)
            self.assertGreaterEqual(report["records_ingested"], 10)

            query = (CASES / "fsd-ownership-unwind" / "problem-statement.md").read_text(
                encoding="utf-8"
            )
            packet = space.retrieve(query, limit=8)
            packet_cases = {item.record.source_case for item in packet.items}
            self.assertTrue(chosen_cases & packet_cases)

    def test_research_problem_excludes_target_case_when_requested(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            problem = (CASES / "fsd-ownership-unwind" / "problem-statement.md").read_text(
                encoding="utf-8"
            )

            report = space.research_problem(
                problem,
                CASES,
                limit=4,
                exclude_cases={"fsd-ownership-unwind"},
            )

            chosen_cases = {item["case"] for item in report["chosen_sources"]}
            self.assertNotIn("fsd-ownership-unwind", chosen_cases)
            self.assertTrue(any(case.startswith("fsd-") for case in chosen_cases))

    def test_load_openrouter_key_reads_secret_file_without_exposing_value(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            key_file = Path(tmp) / "tokens and keys.md"
            key_file.write_text("openrouter api key: placeholder-value\n", encoding="utf-8")

            self.assertEqual(load_openrouter_key(key_file), "placeholder-value")


if __name__ == "__main__":
    unittest.main()
