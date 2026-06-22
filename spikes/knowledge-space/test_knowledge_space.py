#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
import json
from pathlib import Path

from knowledge_space import (
    KnowledgeSpace,
    KnowledgePacketRequest,
    KnowledgeRecord,
    LocalKnowledgeGateway,
    approximate_token_count,
    build_case_packets,
    load_graph_snapshot,
    load_run_events,
    load_openrouter_key,
    validate_collapse_packet,
    validate_packet_event,
)


ROOT = Path(__file__).resolve().parents[2]
CASES = ROOT / "case-studies"
FIXTURES = Path(__file__).resolve().parent / "fixtures"
SNAPSHOT = Path(__file__).resolve().parent / "snapshots" / "2026-06-22-receipt-watermark-skeleton"
NEO4J = Path(__file__).resolve().parent / "neo4j"


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

    def test_local_gateway_select_packet_enforces_runtime_budget_and_warning_slot(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_case(CASES / "fsd-accident-economy")
            space.ingest_case(CASES / "fsd-mobility-and-time")
            warning = KnowledgeRecord(
                id="ks_warning_budget",
                kind="warning",
                text=(
                    "FSD crash economy prior warning: insurance finance mobility and enforcement "
                    "shifts can dominate the result when autonomous crashes are removed."
                ),
                tags=["fsd", "warning", "insurance", "finance", "mobility"],
                source_case="fsd-accident-economy",
                source_path="case-studies/fsd-accident-economy/problem-statement.md",
                visibility="public",
                trust_tier="candidate",
                source_chunk_id="chunk:warning-budget",
                line_start=1,
                line_end=1,
                heading="Synthetic warning",
                citation="case-studies/fsd-accident-economy/problem-statement.md:1-1",
            )
            oversized = KnowledgeRecord(
                id="ks_oversized_budget",
                kind="claim",
                text=" ".join(["fsd", "insurance", "finance", "mobility"] * 80),
                tags=["fsd", "insurance", "finance", "mobility"],
                source_case="fsd-accident-economy",
                source_path="case-studies/fsd-accident-economy/problem-statement.md",
                visibility="public",
                trust_tier="candidate",
                source_chunk_id="chunk:oversized-budget",
                line_start=2,
                line_end=2,
                heading="Synthetic oversized prior",
                citation="case-studies/fsd-accident-economy/problem-statement.md:2-2",
            )
            space.records[warning.id] = warning
            space.records[oversized.id] = oversized
            query = (CASES / "fsd-ownership-unwind" / "problem-statement.md").read_text(
                encoding="utf-8"
            )

            packet = LocalKnowledgeGateway(space).select_packet(
                KnowledgePacketRequest(
                    problem_summary=query,
                    target_case="fsd-ownership-unwind",
                    max_items=3,
                    max_tokens=75,
                    required_warning_slots=1,
                    excluded_cases=["fsd-ownership-unwind"],
                    role="candidate",
                )
            )
            event = packet.to_run_event(run_id="demo-run-1", sequence=9)

            self.assertEqual(validate_packet_event(event), [])
            self.assertLessEqual(len(packet.items), 3)
            self.assertLessEqual(
                sum(approximate_token_count(item.record.text) for item in packet.items),
                75,
            )
            self.assertTrue(any(item.record.kind == "warning" for item in packet.items))
            self.assertNotIn("ks_oversized_budget", {item.record.id for item in packet.items})
            self.assertEqual(event["payload"]["request"]["max_tokens"], 75)
            self.assertEqual(event["payload"]["request"]["required_warning_slots"], 1)
            self.assertEqual(event["payload"]["request"]["role"], "candidate")
            self.assertIn(
                "over packet token budget",
                {item["reason"] for item in event["payload"]["excluded"]},
            )

    def test_local_gateway_excludes_withheld_for_candidate_roles(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            public = KnowledgeRecord(
                id="ks_public_runtime",
                kind="claim",
                text="FSD insurance finance memory should be reusable by later candidate runs.",
                tags=["fsd", "insurance", "finance"],
                source_case="fsd-public-prior",
                source_path="case-studies/fsd-public-prior/problem-statement.md",
                visibility="public",
                trust_tier="candidate",
                source_chunk_id="chunk:public-runtime",
                line_start=1,
                line_end=1,
                heading="Public prior",
                citation="case-studies/fsd-public-prior/problem-statement.md:1-1",
            )
            withheld = KnowledgeRecord(
                id="ks_withheld_runtime",
                kind="claim",
                text="FSD insurance finance hidden evaluator answer must never leak.",
                tags=["fsd", "insurance", "finance"],
                source_case="fsd-hidden-evaluator",
                source_path="case-studies/fsd-hidden-evaluator/withheld-solution.md",
                visibility="withheld_evaluator",
                trust_tier="candidate",
                source_chunk_id="chunk:withheld-runtime",
                line_start=1,
                line_end=1,
                heading="Withheld evaluator answer",
                citation="case-studies/fsd-hidden-evaluator/withheld-solution.md:1-1",
            )
            space.records[public.id] = public
            space.records[withheld.id] = withheld

            packet = LocalKnowledgeGateway(space).select_packet(
                KnowledgePacketRequest(
                    problem_summary="FSD insurance finance candidate run",
                    target_case="fsd-next-case",
                    max_items=4,
                    role="candidate",
                )
            )

            self.assertIn(public.id, {item.record.id for item in packet.items})
            self.assertNotIn(withheld.id, {item.record.id for item in packet.items})
            self.assertIn(
                "withheld from candidate-producing role",
                {item.reason for item in packet.excluded},
            )

    def test_local_gateway_applies_graph_filters_before_scoring(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            valid = KnowledgeRecord(
                id="ks_valid_graph_filter",
                kind="claim",
                text="FSD insurance finance crash memory should survive graph filtering.",
                tags=["fsd", "insurance", "finance"],
                source_case="fsd-accident-economy",
                source_path="case-studies/fsd-accident-economy/problem-statement.md",
                visibility="public",
                trust_tier="candidate",
                source_chunk_id="chunk:valid-graph-filter",
                line_start=1,
                line_end=1,
                heading="Valid prior",
                citation="case-studies/fsd-accident-economy/problem-statement.md:1-1",
            )
            missing_tag = KnowledgeRecord(
                id="ks_missing_graph_tag",
                kind="claim",
                text="FSD insurance finance crash memory has tempting lexical overlap.",
                tags=["fsd", "crash"],
                source_case="fsd-mobility-and-time",
                source_path="case-studies/fsd-mobility-and-time/problem-statement.md",
                visibility="public",
                trust_tier="candidate",
                source_chunk_id="chunk:missing-graph-tag",
                line_start=1,
                line_end=1,
                heading="Missing tag prior",
                citation="case-studies/fsd-mobility-and-time/problem-statement.md:1-1",
            )
            draft = KnowledgeRecord(
                id="ks_draft_graph_filter",
                kind="claim",
                text="FSD insurance finance crash memory is draft and should be held back.",
                tags=["fsd", "insurance", "finance"],
                source_case="fsd-enforcement-economy",
                source_path="case-studies/fsd-enforcement-economy/problem-statement.md",
                visibility="public",
                trust_tier="draft",
                source_chunk_id="chunk:draft-graph-filter",
                line_start=1,
                line_end=1,
                heading="Draft prior",
                citation="case-studies/fsd-enforcement-economy/problem-statement.md:1-1",
            )
            target_case_record = KnowledgeRecord(
                id="ks_target_graph_filter",
                kind="claim",
                text="FSD insurance finance crash memory from the active case must not leak into priors.",
                tags=["fsd", "insurance", "finance"],
                source_case="fsd-ownership-unwind",
                source_path="case-studies/fsd-ownership-unwind/problem-statement.md",
                visibility="public",
                trust_tier="candidate",
                source_chunk_id="chunk:target-graph-filter",
                line_start=1,
                line_end=1,
                heading="Target case prior",
                citation="case-studies/fsd-ownership-unwind/problem-statement.md:1-1",
            )
            for record in [valid, missing_tag, draft, target_case_record]:
                space.records[record.id] = record

            packet = LocalKnowledgeGateway(space).select_packet(
                KnowledgePacketRequest(
                    problem_summary="FSD insurance finance crash",
                    target_case="fsd-ownership-unwind",
                    max_items=5,
                    required_tags=["insurance", "finance"],
                    min_trust_tier="candidate",
                )
            )
            selected_ids = {item.record.id for item in packet.items}
            excluded_reasons = {item.record_id: item.reason for item in packet.excluded}
            event = packet.to_run_event(run_id="demo-run-1", sequence=10)

            self.assertIn(valid.id, selected_ids)
            self.assertNotIn(missing_tag.id, selected_ids)
            self.assertNotIn(draft.id, selected_ids)
            self.assertNotIn(target_case_record.id, selected_ids)
            self.assertEqual(excluded_reasons[missing_tag.id], "missing required graph tag")
            self.assertEqual(excluded_reasons[draft.id], "below minimum trust tier")
            self.assertEqual(
                excluded_reasons[target_case_record.id],
                "target case excluded from prior-memory retrieval",
            )
            self.assertEqual(event["payload"]["request"]["required_tags"], ["insurance", "finance"])
            self.assertEqual(event["payload"]["request"]["min_trust_tier"], "candidate")

    def test_build_case_packets_exports_gateway_packets_for_each_case(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            case_paths = [
                CASES / "fsd-accident-economy",
                CASES / "fsd-mobility-and-time",
                CASES / "fsd-enforcement-economy",
                CASES / "fsd-ownership-unwind",
            ]
            for case_path in case_paths:
                space.ingest_case(case_path)
            packets = build_case_packets(space, case_paths, limit=4)

            self.assertEqual(set(packets.keys()), {case_path.name for case_path in case_paths})
            for case_name, packet_json in packets.items():
                self.assertEqual(packet_json["request"]["target_case"], case_name)
                self.assertLessEqual(len(packet_json["items"]), 4)
                self.assertGreaterEqual(len(packet_json["items"]), 1)
                self.assertNotIn(
                    case_name,
                    {item["record"]["source_case"] for item in packet_json["items"]},
                )
                self.assertIn(
                    case_name,
                    {item["case"] for item in packet_json["excluded"]},
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

    def test_receipt_watermark_snapshot_is_preserved(self) -> None:
        expected = [
            "README.md",
            "knowledge.jsonl",
            "graph.html",
            "neo4j.cypher",
            "collapse_packet.json",
            "knowledge_packet.json",
            "knowledge_packet_event.json",
            "report.md",
        ]

        for name in expected:
            self.assertTrue((SNAPSHOT / name).exists(), name)

        readme = (SNAPSHOT / "README.md").read_text(encoding="utf-8")
        ledger = (SNAPSHOT / "knowledge.jsonl").read_text(encoding="utf-8")
        graph = (SNAPSHOT / "graph.html").read_text(encoding="utf-8")

        self.assertIn("receipt/watermark skeleton", readme)
        self.assertIn("run_event_watermark", ledger)
        self.assertIn("RunEventWatermark", graph)

    def test_neo4j_dev_harness_documents_local_projection_import(self) -> None:
        expected = [
            "README.md",
            "docker-compose.yml",
            "import.sh",
            "live.html",
            "open-live.sh",
            "schema.cypher",
            "smoke.cypher",
        ]

        for name in expected:
            self.assertTrue((NEO4J / name).exists(), name)

        compose = (NEO4J / "docker-compose.yml").read_text(encoding="utf-8")
        readme = (NEO4J / "README.md").read_text(encoding="utf-8")
        schema = (NEO4J / "schema.cypher").read_text(encoding="utf-8")
        smoke = (NEO4J / "smoke.cypher").read_text(encoding="utf-8")
        importer = (NEO4J / "import.sh").read_text(encoding="utf-8")
        live = (NEO4J / "live.html").read_text(encoding="utf-8")
        live_opener = (NEO4J / "open-live.sh").read_text(encoding="utf-8")

        self.assertIn("neo4j:5", compose)
        self.assertIn("NEO4J_AUTH=none", compose)
        self.assertNotIn("NEO4J_browser_post__connect__cmd", compose)
        self.assertIn("JSONL remains the source of truth", readme)
        self.assertIn("auth disabled", readme)
        self.assertIn("Zero-Click Live Graph", readme)
        self.assertIn("RunEventReceipt", schema)
        self.assertIn("RunEventWatermark", schema)
        self.assertIn("DERIVED_FROM_RECEIPT", smoke)
        self.assertIn("spikes/knowledge-space/out/neo4j.cypher", importer)
        self.assertNotIn("doppl-local-dev", importer)
        self.assertIn("http://localhost:7474/db/neo4j/query/v2", live)
        self.assertIn("run-rich-runtime-1", live)
        self.assertIn("parsePaths", live)
        self.assertIn("open \"$SCRIPT_DIR/live.html\"", live_opener)

    def test_graph_snapshot_export_rebuilds_stable_ids_and_links(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            events = load_run_events(FIXTURES / "raw_run_events.json")
            space.ingest_case(CASES / "fsd-accident-economy")
            space.ingest_run_events(events, source_path="fixtures/raw_run_events.json")
            space.ingest_collapse_packet(space.request_collapse(events, extractor="heuristic"))

            snapshot_dir = Path(tmp) / "snapshot"
            jsonl_path, markdown_path = space.export_graph_snapshot(snapshot_dir)
            rebuilt = load_graph_snapshot(jsonl_path)
            original = space.graph_projection()

            original_node_ids = {node["id"] for node in original["nodes"]}
            rebuilt_node_ids = {node["id"] for node in rebuilt["nodes"]}
            original_edges = {(edge["source"], edge["target"], edge["type"]) for edge in original["edges"]}
            rebuilt_edges = {(edge["source"], edge["target"], edge["type"]) for edge in rebuilt["edges"]}
            markdown = markdown_path.read_text(encoding="utf-8")

            self.assertEqual(original_node_ids, rebuilt_node_ids)
            self.assertEqual(original_edges, rebuilt_edges)
            self.assertIn("RunEventReceipt", markdown)
            self.assertIn("DERIVED_FROM_RECEIPT", markdown)
            self.assertIn("snapshot_node", jsonl_path.read_text(encoding="utf-8"))

    def test_whole_run_import_mirrors_richer_runtime_nodes(self) -> None:
        run = {
            "id": "run-rich-1",
            "prompt": {"id": "fsd-accident-economy", "title": "FSD accident economy"},
            "generations": [
                {"index": 0, "agenomes": [{"id": "agenome-cold", "name": "Cold Scout", "generation": 0}]}
            ],
            "candidates": [
                {
                    "id": "cand-rich",
                    "agenomeId": "agenome-cold",
                    "generation": 0,
                    "title": "Accident substrate",
                    "summary": "Crash risk crosses insurance and care.",
                    "proposal": "Track liability shifts.",
                    "groundedCheck": {"score": 0.77, "notes": "Grounded in case receipts."},
                }
            ],
            "fitnessRecords": [
                {
                    "id": "fit-rich",
                    "candidateId": "cand-rich",
                    "totalFitness": 0.82,
                    "noveltyScore": 0.64,
                }
            ],
            "verdicts": [
                {
                    "candidateId": "cand-rich",
                    "criticMandate": "factual-grounding",
                    "score": 0.81,
                    "praise": ["Good substrate mapping."],
                }
            ],
            "comparison": {"winnerCandidateId": "cand-rich"},
        }

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "run.json"
            path.write_text(json.dumps(run), encoding="utf-8")
            events = load_run_events(path)
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_run_events(events, source_path="run.json")
            graph = space.graph_projection()
            node_types = {node["type"] for node in graph["nodes"]}
            edge_types = {edge["type"] for edge in graph["edges"]}
            cypher = space.to_cypher()

            self.assertIn("Generation", node_types)
            self.assertIn("Agenome", node_types)
            self.assertIn("FitnessScore", node_types)
            self.assertIn("NoveltyScore", node_types)
            self.assertIn("CheckResult", node_types)
            self.assertIn("RECEIPT_OF_GENERATION", edge_types)
            self.assertIn("RECEIPT_OF_AGENOME", edge_types)
            self.assertIn("RECEIPT_OF_FITNESS", edge_types)
            self.assertIn("RECEIPT_OF_NOVELTY", edge_types)
            self.assertIn("RECEIPT_OF_CHECK", edge_types)
            self.assertIn("MERGE (generation:Generation", cypher)
            self.assertIn("MERGE (fitness:FitnessScore", cypher)
            self.assertIn("MERGE (check:CheckResult", cypher)

    def test_graph_html_defaults_to_readable_runtime_workbench(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            space = KnowledgeSpace(Path(tmp) / "knowledge.jsonl")
            space.ingest_case(CASES / "fsd-accident-economy")
            space.ingest_run_events(
                load_run_events(FIXTURES / "rich_run_export.json"),
                source_path="fixtures/rich_run_export.json",
            )
            html_path = Path(tmp) / "graph.html"
            space.write_graph_html(html_path)
            html = html_path.read_text(encoding="utf-8")

            self.assertIn('class="active" data-filter="runtime"', html)
            self.assertIn('let activeFilter = "runtime";', html)
            self.assertIn("const filterGroups = {", html)
            self.assertIn('data-filter="memory"', html)
            self.assertIn('data-filter="provenance"', html)
            self.assertIn("visible.size <= 42", html)
            self.assertIn('<details class="cards-shell">', html)
            self.assertIn("Runtime graph", html)


def json_fixture(name: str) -> list[dict]:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
