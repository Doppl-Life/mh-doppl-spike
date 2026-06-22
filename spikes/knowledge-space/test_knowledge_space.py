#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
import json
from pathlib import Path

from knowledge_space import (
    KnowledgeSpace,
    load_run_events,
    load_openrouter_key,
    validate_collapse_packet,
    validate_packet_event,
)


ROOT = Path(__file__).resolve().parents[2]
CASES = ROOT / "case-studies"
FIXTURES = Path(__file__).resolve().parent / "fixtures"


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

    def test_records_preserve_citation_metadata_and_packet_handles(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_case(CASES / "fsd-accident-economy")

            query = (CASES / "fsd-ownership-unwind" / "problem-statement.md").read_text(
                encoding="utf-8"
            )
            packet = space.retrieve(query, limit=3)

            self.assertGreaterEqual(len(packet.items), 1)
            item = packet.items[0]
            record_json = item.record.to_json()
            packet_json = packet.to_json()["items"][0]
            self.assertTrue(record_json["source_chunk_id"].startswith("chunk:"))
            self.assertGreaterEqual(record_json["line_start"], 1)
            self.assertGreaterEqual(record_json["line_end"], record_json["line_start"])
            self.assertIn("citation", record_json)
            self.assertIn(record_json["source_path"], record_json["citation"])
            self.assertTrue(packet_json["cite_handle"].startswith("K"))
            self.assertEqual(packet_json["record"]["source_chunk_id"], record_json["source_chunk_id"])

    def test_select_packet_exports_future_run_event_contract(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_case(CASES / "fsd-accident-economy")
            query = (CASES / "fsd-ownership-unwind" / "problem-statement.md").read_text(
                encoding="utf-8"
            )

            packet = space.select_packet(
                query,
                target_case="fsd-ownership-unwind",
                limit=4,
                exclude_cases={"fsd-ownership-unwind"},
            )
            event = packet.to_run_event(run_id="demo-run-1", sequence=7)

            self.assertEqual(event["type"], "knowledge.packet_selected")
            self.assertEqual(event["runId"], "demo-run-1")
            self.assertEqual(event["sequence"], 7)
            self.assertEqual(event["payload"]["request"]["target_case"], "fsd-ownership-unwind")
            self.assertEqual(event["payload"]["request"]["max_items"], 4)
            self.assertGreaterEqual(len(event["payload"]["items"]), 1)
            first_item = event["payload"]["items"][0]
            self.assertIn("cite_handle", first_item)
            self.assertIn("citation", first_item)
            self.assertIn("source_chunk_id", first_item)
            self.assertEqual(
                event["payload"]["excluded"][0]["case"],
                "fsd-ownership-unwind",
            )
            self.assertEqual(
                event["payload"]["excluded"][0]["reason"],
                "target case excluded from prior-memory retrieval",
            )

    def test_validate_packet_event_rejects_missing_provenance_and_leakage(self) -> None:
        valid_event = {
            "type": "knowledge.packet_selected",
            "runId": "demo-run-1",
            "sequence": 1,
            "payload": {
                "request": {"target_case": "case-a", "max_items": 1},
                "items": [
                    {
                        "cite_handle": "KABC123",
                        "record_id": "ks_abc123",
                        "source_chunk_id": "chunk:abc123",
                        "citation": "case-studies/example/problem-statement.md:1-2",
                        "record": {
                            "visibility": "public",
                            "trust_tier": "candidate",
                            "source_chunk_id": "chunk:abc123",
                            "citation": "case-studies/example/problem-statement.md:1-2",
                        },
                    }
                ],
                "excluded": [],
            },
        }
        self.assertEqual(validate_packet_event(valid_event), [])

        missing_provenance = dict(valid_event)
        missing_provenance["payload"] = dict(valid_event["payload"])
        missing_provenance["payload"]["items"] = [dict(valid_event["payload"]["items"][0])]
        missing_provenance["payload"]["items"][0].pop("source_chunk_id")
        self.assertIn(
            "item 1 missing source_chunk_id",
            validate_packet_event(missing_provenance),
        )

        withheld = dict(valid_event)
        withheld["payload"] = dict(valid_event["payload"])
        withheld["payload"]["items"] = [dict(valid_event["payload"]["items"][0])]
        withheld["payload"]["items"][0]["record"] = dict(valid_event["payload"]["items"][0]["record"])
        withheld["payload"]["items"][0]["record"]["visibility"] = "withheld_evaluator"
        self.assertIn(
            "item 1 has evaluator-only visibility",
            validate_packet_event(withheld),
        )

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
            self.assertIn("sourceChunkId", cypher)
            self.assertIn("citation", cypher)
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
            self.assertIn("Citation:", html)

    def test_html_graph_is_an_interactive_workbench(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_case(CASES / "fsd-accident-economy")
            html_path = Path(tmp) / "graph.html"

            space.write_graph_html(html_path)
            html = html_path.read_text(encoding="utf-8")

            self.assertIn('id="graph-search"', html)
            self.assertIn('data-filter="KnowledgeRecord"', html)
            self.assertIn('id="graph-canvas"', html)
            self.assertIn('id="node-detail"', html)
            self.assertIn('application/json" id="graph-data"', html)
            self.assertIn("renderGraph()", html)
            graph_json = html.split('id="graph-data">', 1)[1].split("</script>", 1)[0]
            self.assertNotIn("&quot;", graph_json)
            self.assertIn('"nodes"', graph_json)

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

    def test_collapse_culled_run_writes_back_searchable_findings(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            events = json_fixture("mock_run_events.json")

            collapse = space.request_collapse(events)
            records = space.ingest_collapse_packet(collapse)

            self.assertEqual(collapse["type"], "knowledge.collapse_packet")
            self.assertEqual(collapse["run_id"], "ks-demo-run-culled-1")
            self.assertEqual(len(records), 2)
            self.assertEqual({record.kind for record in records}, {"ResearchFinding", "NegativeFinding"})
            self.assertTrue(all(record.run_id == "ks-demo-run-culled-1" for record in records))
            self.assertTrue(all(record.candidate_id == "candidate-cold-ownership-1" for record in records))

            packet = space.retrieve(
                "What ownership-unwind priors mention dealer finance inventory risk?",
                limit=4,
            )
            packet_text = "\n".join(item.record.text.lower() for item in packet.items)
            self.assertIn("dealer finance inventory", packet_text)
            self.assertIn("candidate-cold-ownership-1", packet.to_json()["items"][0]["record"]["candidate_id"])

    def test_validate_collapse_packet_rejects_bad_shape(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            collapse = space.request_collapse(json_fixture("mock_run_events.json"))

            self.assertEqual(validate_collapse_packet(collapse), [])

            invalid = json.loads(json.dumps(collapse))
            invalid["items"][0].pop("citation")
            invalid["items"][0]["trust_tier"] = "totally-real"

            errors = validate_collapse_packet(invalid)
            self.assertIn("item 0 missing citation", errors)
            self.assertIn("item 0 has invalid trust_tier: totally-real", errors)

            with self.assertRaisesRegex(ValueError, "invalid collapse packet"):
                space.ingest_collapse_packet(invalid)

    def test_heuristic_collapse_extracts_from_raw_run_events(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            events = json_fixture("raw_run_events.json")

            fixture_collapse = space.request_collapse(events)
            heuristic_collapse = space.request_collapse(events, extractor="heuristic")
            records = space.ingest_collapse_packet(heuristic_collapse)

            self.assertEqual(fixture_collapse["items"], [])
            self.assertGreaterEqual(len(records), 1)
            self.assertEqual(validate_collapse_packet(heuristic_collapse), [])
            self.assertTrue(all(record.trust_tier == "draft" for record in records))
            self.assertIn("candidate-raw-accident-1", {record.candidate_id for record in records})
            self.assertIn("crash", "\n".join(record.text.lower() for record in records))

    def test_collapse_rejects_unknown_extractor(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            with self.assertRaisesRegex(ValueError, "unknown collapse extractor"):
                space.request_collapse(json_fixture("mock_run_events.json"), extractor="mystery")

    def test_load_run_events_accepts_jsonl_exports(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "events.jsonl"
            events = json_fixture("raw_run_events.json")
            path.write_text("\n".join(json.dumps(event) for event in events), encoding="utf-8")

            loaded = load_run_events(path)

            self.assertEqual([event["sequence"] for event in loaded], [1, 2, 3])
            self.assertEqual(loaded[1]["type"], "candidate.produced")

    def test_load_run_events_normalizes_my_doppl_run_exports(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "run.json"
            path.write_text(
                json.dumps(
                    {
                        "id": "run-current-doppl-1",
                        "prompt": {"id": "fsd-accident-economy", "title": "FSD accident economy collapse"},
                        "comparison": {"winnerCandidateId": "cand-survivor"},
                        "candidates": [
                            {
                                "id": "cand-cold",
                                "agenomeId": "cold-scout",
                                "title": "Crash liability cascade",
                                "summary": "FSD crash risk crosses insurance, care, media, and dealer finance.",
                                "proposal": "Track liability before regulator blame settles.",
                                "risks": ["may overclaim timing"],
                                "evidence": ["case notes"],
                            }
                        ],
                        "verdicts": [
                            {
                                "candidateId": "cand-cold",
                                "criticMandate": "factual-grounding",
                                "score": 0.42,
                                "objections": ["The crash liability timing is underspecified."],
                                "praise": ["Useful cross-system accident economy signal."],
                            }
                        ],
                    }
                ),
                encoding="utf-8",
            )

            events = load_run_events(path)
            collapse = KnowledgeSpace(Path(tmp) / "knowledge.jsonl").request_collapse(
                events,
                extractor="heuristic",
            )

            self.assertEqual(events[0]["type"], "run.configured")
            self.assertEqual(events[0]["payload"]["target_case"], "fsd-accident-economy")
            self.assertEqual(validate_collapse_packet(collapse), [])
            self.assertGreaterEqual(len(collapse["items"]), 1)
            self.assertIn("cand-cold", {item["candidate_id"] for item in collapse["items"]})

    def test_import_run_event_receipts_is_idempotent(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            events = load_run_events(FIXTURES / "raw_run_events.json")

            first = space.ingest_run_events(events, source_path="fixtures/raw_run_events.json")
            second = space.ingest_run_events(events, source_path="fixtures/raw_run_events.json")
            reloaded = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")

            self.assertEqual(len(first), 3)
            self.assertEqual(second, [])
            self.assertEqual(len(reloaded.run_event_receipts), 3)
            self.assertEqual(first[0].run_id, "ks-demo-run-raw-1")
            self.assertEqual(first[0].sequence, 1)
            self.assertEqual(first[0].event_type, "run.configured")
            self.assertEqual(first[0].source_path, "fixtures/raw_run_events.json")
            self.assertTrue(first[0].event_hash.startswith("evt_"))
            self.assertTrue(first[0].payload_hash.startswith("payload_"))
            self.assertEqual(first[0].event_hash, reloaded.run_event_receipts[first[0].id].event_hash)
            self.assertEqual(reloaded.run_event_watermarks["watermark:ks-demo-run-raw-1"].high_watermark, 3)
            self.assertEqual(reloaded.run_event_watermarks["watermark:ks-demo-run-raw-1"].max_sequence_seen, 3)
            self.assertEqual(reloaded.run_event_watermarks["watermark:ks-demo-run-raw-1"].missing_sequences, [])

    def test_run_event_watermark_detects_sequence_gaps(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            events = load_run_events(FIXTURES / "raw_run_events.json")
            gapped = [events[0], events[2]]

            space.ingest_run_events(gapped, source_path="fixtures/raw_run_events.json")
            watermark = space.run_event_watermarks["watermark:ks-demo-run-raw-1"]
            reloaded = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")

            self.assertEqual(watermark.high_watermark, 1)
            self.assertEqual(watermark.max_sequence_seen, 3)
            self.assertEqual(watermark.missing_sequences, [2])
            self.assertEqual(watermark.receipt_count, 2)
            self.assertEqual(reloaded.run_event_watermarks[watermark.id].missing_sequences, [2])

    def test_graph_projection_links_receipts_to_run_entities_and_records(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            events = load_run_events(FIXTURES / "raw_run_events.json")

            space.ingest_run_events(events, source_path="fixtures/raw_run_events.json")
            records = space.ingest_collapse_packet(
                space.request_collapse(events, extractor="heuristic")
            )
            graph = space.graph_projection()
            node_ids = {node["id"] for node in graph["nodes"]}
            edge_types = {edge["type"] for edge in graph["edges"]}
            cypher = space.to_cypher()
            html_path = Path(tmp) / "graph.html"
            space.write_graph_html(html_path)
            html = html_path.read_text(encoding="utf-8")

            self.assertGreaterEqual(len(records), 1)
            self.assertIn("receipt:ks-demo-run-raw-1:1", node_ids)
            self.assertIn("receipt:ks-demo-run-raw-1:2", node_ids)
            self.assertIn("receipt:ks-demo-run-raw-1:3", node_ids)
            self.assertIn("watermark:ks-demo-run-raw-1", node_ids)
            self.assertIn("RECEIPT_OF_RUN", edge_types)
            self.assertIn("WATERMARK_FOR_RUN", edge_types)
            self.assertIn("RECEIPT_OF_CANDIDATE", edge_types)
            self.assertIn("RECEIPT_OF_CRITIC", edge_types)
            self.assertIn("DERIVED_FROM_RECEIPT", edge_types)
            self.assertIn("MERGE (receipt:RunEventReceipt", cypher)
            self.assertIn("MERGE (watermark:RunEventWatermark", cypher)
            self.assertIn('data-filter="RunEventReceipt"', html)
            self.assertIn('data-filter="RunEventWatermark"', html)

    def test_graph_projection_includes_run_candidate_and_critic_provenance(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            records = space.ingest_collapse_packet(
                space.request_collapse(json_fixture("mock_run_events.json"))
            )

            graph = space.graph_projection()
            node_ids = {node["id"] for node in graph["nodes"]}
            edge_types = {edge["type"] for edge in graph["edges"]}
            cypher = space.to_cypher()
            html_path = Path(tmp) / "graph.html"
            space.write_graph_html(html_path)
            html = html_path.read_text(encoding="utf-8")

            self.assertGreaterEqual(len(records), 1)
            self.assertIn("run:ks-demo-run-culled-1", node_ids)
            self.assertIn("candidate:candidate-cold-ownership-1", node_ids)
            self.assertIn("critic:critic-market-structure", node_ids)
            self.assertIn("DERIVED_FROM_RUN", edge_types)
            self.assertIn("SUPPORTED_BY_CANDIDATE", edge_types)
            self.assertIn("FLAGGED_BY_CRITIC", edge_types)
            self.assertIn("MERGE (run:Run", cypher)
            self.assertIn("MERGE (cand:Candidate", cypher)
            self.assertIn('data-filter="Run"', html)
            self.assertIn("ks-demo-run-culled-1", html)


def json_fixture(name: str) -> list[dict]:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
