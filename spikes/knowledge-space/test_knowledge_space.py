#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from knowledge_space import KnowledgeSpace


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


if __name__ == "__main__":
    unittest.main()
