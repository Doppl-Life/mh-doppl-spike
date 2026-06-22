// Neo4j projection generated from the portable knowledge.jsonl ledger.
// The ledger remains the durable substrate; this is a query/read projection.
CREATE CONSTRAINT knowledge_record_id IF NOT EXISTS FOR (r:KnowledgeRecord) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT case_id IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT tag_id IF NOT EXISTS FOR (t:Tag) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT source_id IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT run_id IF NOT EXISTS FOR (run:Run) REQUIRE run.id IS UNIQUE;
CREATE CONSTRAINT candidate_id IF NOT EXISTS FOR (cand:Candidate) REQUIRE cand.id IS UNIQUE;
CREATE CONSTRAINT critic_id IF NOT EXISTS FOR (critic:CriticReview) REQUIRE critic.id IS UNIQUE;
CREATE CONSTRAINT run_event_receipt_id IF NOT EXISTS FOR (receipt:RunEventReceipt) REQUIRE receipt.id IS UNIQUE;
CREATE CONSTRAINT run_event_watermark_id IF NOT EXISTS FOR (watermark:RunEventWatermark) REQUIRE watermark.id IS UNIQUE;
CREATE CONSTRAINT generation_id IF NOT EXISTS FOR (generation:Generation) REQUIRE generation.id IS UNIQUE;
CREATE CONSTRAINT agenome_id IF NOT EXISTS FOR (agenome:Agenome) REQUIRE agenome.id IS UNIQUE;
CREATE CONSTRAINT fitness_score_id IF NOT EXISTS FOR (fitness:FitnessScore) REQUIRE fitness.id IS UNIQUE;
CREATE CONSTRAINT novelty_score_id IF NOT EXISTS FOR (novelty:NoveltyScore) REQUIRE novelty.id IS UNIQUE;
CREATE CONSTRAINT check_result_id IF NOT EXISTS FOR (check:CheckResult) REQUIRE check.id IS UNIQUE;

MERGE (run:Run {id: "ks-demo-run-culled-1"}) SET run.title = "ks-demo-run-culled-1";
MERGE (watermark:RunEventWatermark {id: "watermark:ks-demo-run-culled-1"})
  SET watermark.runId = "ks-demo-run-culled-1", watermark.highWatermark = 3, watermark.maxSequenceSeen = 3, watermark.receiptCount = 3, watermark.missingSequences = [], watermark.sourcePaths = ["fixtures/mock_run_events.json"];
MATCH (watermark:RunEventWatermark {id: "watermark:ks-demo-run-culled-1"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (watermark)-[:WATERMARK_FOR_RUN]->(run);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (watermark:RunEventWatermark {id: "watermark:run-rich-runtime-1"})
  SET watermark.runId = "run-rich-runtime-1", watermark.highWatermark = 8, watermark.maxSequenceSeen = 8, watermark.receiptCount = 8, watermark.missingSequences = [], watermark.sourcePaths = ["fixtures/rich_run_export.json"];
MATCH (watermark:RunEventWatermark {id: "watermark:run-rich-runtime-1"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (watermark)-[:WATERMARK_FOR_RUN]->(run);

MERGE (run:Run {id: "ks-demo-run-culled-1"}) SET run.title = "ks-demo-run-culled-1";
MERGE (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:1"})
  SET receipt.runId = "ks-demo-run-culled-1", receipt.sequence = 1, receipt.eventType = "run.configured", receipt.eventHash = "evt_3696171a7372cb48", receipt.payloadHash = "payload_eebfce9f3810708b", receipt.sourcePath = "fixtures/mock_run_events.json", receipt.candidateId = "", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:1"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);

MERGE (run:Run {id: "ks-demo-run-culled-1"}) SET run.title = "ks-demo-run-culled-1";
MERGE (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:2"})
  SET receipt.runId = "ks-demo-run-culled-1", receipt.sequence = 2, receipt.eventType = "candidate.produced", receipt.eventHash = "evt_c51c87acd1c18bb1", receipt.payloadHash = "payload_1da4a55270e8bf5c", receipt.sourcePath = "fixtures/mock_run_events.json", receipt.candidateId = "candidate-cold-ownership-1", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:2"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (cand:Candidate {id: "candidate-cold-ownership-1"});
MATCH (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:2"}), (cand:Candidate {id: "candidate-cold-ownership-1"})
MERGE (receipt)-[:RECEIPT_OF_CANDIDATE]->(cand);
MATCH (cand:Candidate {id: "candidate-cold-ownership-1"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (cand)-[:PART_OF_RUN]->(run);
MERGE (agenome:Agenome {id: "agenome:cold-scout"}) SET agenome.runId = "ks-demo-run-culled-1";
MATCH (cand:Candidate {id: "candidate-cold-ownership-1"}), (agenome:Agenome {id: "agenome:cold-scout"})
MERGE (cand)-[:PRODUCED_BY_AGENOME]->(agenome);

MERGE (run:Run {id: "ks-demo-run-culled-1"}) SET run.title = "ks-demo-run-culled-1";
MERGE (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:3"})
  SET receipt.runId = "ks-demo-run-culled-1", receipt.sequence = 3, receipt.eventType = "critic.review", receipt.eventHash = "evt_2513a7b9da4120c7", receipt.payloadHash = "payload_b87e0f22075dda7b", receipt.sourcePath = "fixtures/mock_run_events.json", receipt.candidateId = "candidate-cold-ownership-1", receipt.criticId = "critic-market-structure";
MATCH (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:3"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (critic:CriticReview {id: "critic-market-structure"}) SET critic.title = "critic-market-structure";
MATCH (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:3"}), (critic:CriticReview {id: "critic-market-structure"})
MERGE (receipt)-[:RECEIPT_OF_CRITIC]->(critic);
MATCH (critic:CriticReview {id: "critic-market-structure"}), (cand:Candidate {id: "candidate-cold-ownership-1"})
MERGE (critic)-[:REVIEWED_CANDIDATE]->(cand);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:1"})
  SET receipt.runId = "run-rich-runtime-1", receipt.sequence = 1, receipt.eventType = "run.configured", receipt.eventHash = "evt_bc51b26e13259708", receipt.payloadHash = "payload_54e202205b9d70aa", receipt.sourcePath = "fixtures/rich_run_export.json", receipt.candidateId = "", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:1"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:2"})
  SET receipt.runId = "run-rich-runtime-1", receipt.sequence = 2, receipt.eventType = "generation.created", receipt.eventHash = "evt_3d849f728528f8b1", receipt.payloadHash = "payload_becfd4989cf15b18", receipt.sourcePath = "fixtures/rich_run_export.json", receipt.candidateId = "", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:2"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (generation:Generation {id: "generation:run-rich-runtime-1:generation:0"}) SET generation.runId = "run-rich-runtime-1", generation.generationIndex = 0;
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:2"}), (generation:Generation {id: "generation:run-rich-runtime-1:generation:0"})
MERGE (receipt)-[:RECEIPT_OF_GENERATION]->(generation);
MATCH (generation:Generation {id: "generation:run-rich-runtime-1:generation:0"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (generation)-[:GENERATION_OF_RUN]->(run);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:3"})
  SET receipt.runId = "run-rich-runtime-1", receipt.sequence = 3, receipt.eventType = "agenome.spawned", receipt.eventHash = "evt_35db7b99a51b41cf", receipt.payloadHash = "payload_e8edc1ae0e5be40f", receipt.sourcePath = "fixtures/rich_run_export.json", receipt.candidateId = "", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:3"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (agenome:Agenome {id: "agenome:agenome-cold-scout"}) SET agenome.runId = "run-rich-runtime-1", agenome.label = "Cold Scout";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:3"}), (agenome:Agenome {id: "agenome:agenome-cold-scout"})
MERGE (receipt)-[:RECEIPT_OF_AGENOME]->(agenome);
MERGE (generation:Generation {id: "generation:run-rich-runtime-1:generation:0"}) SET generation.runId = "run-rich-runtime-1";
MATCH (agenome:Agenome {id: "agenome:agenome-cold-scout"}), (generation:Generation {id: "generation:run-rich-runtime-1:generation:0"})
MERGE (agenome)-[:AGENOME_IN_GENERATION]->(generation);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:4"})
  SET receipt.runId = "run-rich-runtime-1", receipt.sequence = 4, receipt.eventType = "candidate.produced", receipt.eventHash = "evt_28d80b76d13742f9", receipt.payloadHash = "payload_dd444214a27f3b61", receipt.sourcePath = "fixtures/rich_run_export.json", receipt.candidateId = "cand-rich-accident", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:4"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (cand:Candidate {id: "cand-rich-accident"});
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:4"}), (cand:Candidate {id: "cand-rich-accident"})
MERGE (receipt)-[:RECEIPT_OF_CANDIDATE]->(cand);
MATCH (cand:Candidate {id: "cand-rich-accident"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (cand)-[:PART_OF_RUN]->(run);
MERGE (agenome:Agenome {id: "agenome:agenome-cold-scout"}) SET agenome.runId = "run-rich-runtime-1";
MATCH (cand:Candidate {id: "cand-rich-accident"}), (agenome:Agenome {id: "agenome:agenome-cold-scout"})
MERGE (cand)-[:PRODUCED_BY_AGENOME]->(agenome);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:5"})
  SET receipt.runId = "run-rich-runtime-1", receipt.sequence = 5, receipt.eventType = "check.completed", receipt.eventHash = "evt_4fda5fc4a4b87627", receipt.payloadHash = "payload_1d69cfaadb4dfeaf", receipt.sourcePath = "fixtures/rich_run_export.json", receipt.candidateId = "cand-rich-accident", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:5"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (check:CheckResult {id: "check:check:cand-rich-accident:grounded"}) SET check.runId = "run-rich-runtime-1", check.candidateId = "cand-rich-accident", check.checkType = "grounded", check.score = 0.77;
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:5"}), (check:CheckResult {id: "check:check:cand-rich-accident:grounded"})
MERGE (receipt)-[:RECEIPT_OF_CHECK]->(check);
MERGE (cand:Candidate {id: "cand-rich-accident"});
MATCH (check:CheckResult {id: "check:check:cand-rich-accident:grounded"}), (cand:Candidate {id: "cand-rich-accident"})
MERGE (check)-[:CHECKS_CANDIDATE]->(cand);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:6"})
  SET receipt.runId = "run-rich-runtime-1", receipt.sequence = 6, receipt.eventType = "fitness.scored", receipt.eventHash = "evt_f1e801c5a31ecade", receipt.payloadHash = "payload_7a38e28daddf4c72", receipt.sourcePath = "fixtures/rich_run_export.json", receipt.candidateId = "cand-rich-accident", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:6"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (fitness:FitnessScore {id: "fitness:fit-rich-accident"}) SET fitness.runId = "run-rich-runtime-1", fitness.candidateId = "cand-rich-accident", fitness.totalFitness = 0.82;
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:6"}), (fitness:FitnessScore {id: "fitness:fit-rich-accident"})
MERGE (receipt)-[:RECEIPT_OF_FITNESS]->(fitness);
MERGE (cand:Candidate {id: "cand-rich-accident"});
MATCH (fitness:FitnessScore {id: "fitness:fit-rich-accident"}), (cand:Candidate {id: "cand-rich-accident"})
MERGE (fitness)-[:SCORES_CANDIDATE]->(cand);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:7"})
  SET receipt.runId = "run-rich-runtime-1", receipt.sequence = 7, receipt.eventType = "novelty.scored", receipt.eventHash = "evt_74ab70e4eaa91bff", receipt.payloadHash = "payload_5f075245bb38a413", receipt.sourcePath = "fixtures/rich_run_export.json", receipt.candidateId = "cand-rich-accident", receipt.criticId = "";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:7"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (novelty:NoveltyScore {id: "novelty:novelty:cand-rich-accident"}) SET novelty.runId = "run-rich-runtime-1", novelty.candidateId = "cand-rich-accident", novelty.score = 0.64;
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:7"}), (novelty:NoveltyScore {id: "novelty:novelty:cand-rich-accident"})
MERGE (receipt)-[:RECEIPT_OF_NOVELTY]->(novelty);
MERGE (cand:Candidate {id: "cand-rich-accident"});
MATCH (novelty:NoveltyScore {id: "novelty:novelty:cand-rich-accident"}), (cand:Candidate {id: "cand-rich-accident"})
MERGE (novelty)-[:SCORES_CANDIDATE]->(cand);

MERGE (run:Run {id: "run-rich-runtime-1"}) SET run.title = "run-rich-runtime-1";
MERGE (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:8"})
  SET receipt.runId = "run-rich-runtime-1", receipt.sequence = 8, receipt.eventType = "critic.review", receipt.eventHash = "evt_cc15bac8ee1368de", receipt.payloadHash = "payload_35f02881358c4059", receipt.sourcePath = "fixtures/rich_run_export.json", receipt.candidateId = "cand-rich-accident", receipt.criticId = "factual-grounding";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:8"}), (run:Run {id: "run-rich-runtime-1"})
MERGE (receipt)-[:RECEIPT_OF_RUN]->(run);
MERGE (critic:CriticReview {id: "factual-grounding"}) SET critic.title = "factual-grounding";
MATCH (receipt:RunEventReceipt {id: "receipt:run-rich-runtime-1:8"}), (critic:CriticReview {id: "factual-grounding"})
MERGE (receipt)-[:RECEIPT_OF_CRITIC]->(critic);
MATCH (critic:CriticReview {id: "factual-grounding"}), (cand:Candidate {id: "cand-rich-accident"})
MERGE (critic)-[:REVIEWED_CANDIDATE]->(cand);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_013d66ad76779d55"})
  SET r.kind = "signal", r.text = "Figures are real/cited but applied to a forward projection; the municipal-fine dependency is drawn at its *concentrated* edge (fine-reliant towns) and flagged, not overstated as a macro line.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:05a41d7a1c07", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:55-57", r.lineStart = 55, r.lineEnd = 57, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_013d66ad76779d55"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_013d66ad76779d55"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_013d66ad76779d55"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"})
  SET r.kind = "hidden_variable", r.text = "That visibility is exactly why this is worth a dedicated case \u2014 not to stop at the obvious, but to take the obvious and press it for **breadth then depth**: what is the *full* web of institutions that exists because humans crash, and then, for each, what is the second- and third-order effect of removing the crash that almost no one is pricing?", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:82536b8310bf", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:9-13", r.lineStart = 9, r.lineEnd = 13, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_0770e6e35816d3df"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"})
  SET r.kind = "warning", r.text = "Sibling to the accident > economy (A, harm), mobility & time (B), and the ownership unwind (D); governed by > the adoption-asymmetry lens.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:2ea36f550288", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:5-7", r.lineStart = 5, r.lineEnd = 7, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "accident"}) SET t.name = "accident";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "accident"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "mobility"}) SET t.name = "mobility";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "mobility"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "ownership"}) SET t.name = "ownership";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "ownership"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "sibling"}) SET t.name = "sibling";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "sibling"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_11109aa0df49ddaf"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"})
  SET r.kind = "signal", r.text = "Signal sources (cited in the with-solution file and `../sources.md` Signal Set D6): NHTSA crash counts/cost; US Treasury FIO + IBISWorld on the auto-insurance pool; AutoInsurance.com / AM Best on insurer ad spend; SRTR / trauma-donor literature on organ supply.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:07b6c1180de8", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:48-51", r.lineStart = 48, r.lineEnd = 51, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_1e6e46b941caf62e"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"})
  SET r.kind = "case_frame", r.text = "# Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock) > **Doppl subtype:** `zeitgeist_synthesis` (see `../subtype-index.md`).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:c549d560683d", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:1-3", r.lineStart = 1, r.lineEnd = 3, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "mobility"}) SET t.name = "mobility";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "mobility"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_24a61e27c77ae552"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"})
  SET r.kind = "hidden_variable", r.text = "Ask the system to recover the actual problem (removal of the *enforcement/compliance substrate*, not \"fewer tickets\"), map the web (breadth), game out the non-obvious second/third-order effects (depth) \u2014 including the state's revenue-replacement fight \u2014 and synthesize what it converges to.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:8867ed267356", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:46-49", r.lineStart = 46, r.lineEnd = 49, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "enforcement"}) SET t.name = "enforcement";
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (t:Tag {id: "enforcement"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_3939f5a0799cd8bc"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"})
  SET r.kind = "case_frame", r.text = "When you remove the driver and the cost/friction of distance, a single convergence fires across travel, work, and geography.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:a7af393d63ef", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:9-10", r.lineStart = 9, r.lineEnd = 10, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "travel"}) SET t.name = "travel";
MATCH (r:KnowledgeRecord {id: "ks_48afd4e078f132d4"}), (t:Tag {id: "travel"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"})
  SET r.kind = "claim", r.text = "Five years ago there was no credible removal of the crash; five years out the unwind is consensus.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:ce901162b1de", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:32-33", r.lineStart = 32, r.lineEnd = 33, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5823561ddc53b2c9"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_58a24eaeebb5f84c"})
  SET r.kind = "signal", r.text = "## Source Notes - Synthetic case built from public reporting; the thesis is an analytical projection for use as an eval fixture, not an audited forecast.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:4a528ada7014", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:51-54", r.lineStart = 51, r.lineEnd = 54, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_58a24eaeebb5f84c"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_58a24eaeebb5f84c"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_58a24eaeebb5f84c"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5a5e11078530985e"})
  SET r.kind = "signal", r.text = "partial), a **$175\u2013200B/yr** industry, each often the **largest taxpayer/employer** in its town.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:ff5b5afa97cf", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:35-36", r.lineStart = 35, r.lineEnd = 36, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_5a5e11078530985e"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5a5e11078530985e"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5a5e11078530985e"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"})
  SET r.kind = "warning", r.text = "These read like separate topics but they are **chapters of one story** \u2014 different forces acting on the same puck \u2014 so this case holds them together and asks: *what does it all add up to?* (The sibling story, **Sub-cluster A \u2014 the accident economy**, removes a *different* substrate, the crash; it is `fsd-accident-economy`, not part of this case.) **Chapter 1 \u2014 door-to-door travel (the 200\u2013700-mile band).** The obvious travel story is \"robotaxis in cities.\" The fertile one is *intercity*: autonomy collapses **door-to-door** travel economics in the band where the existing system is already weakest.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:d00210b74196", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:10-19", r.lineStart = 10, r.lineEnd = 19, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "accident"}) SET t.name = "accident";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "accident"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "sibling"}) SET t.name = "sibling";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "sibling"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "travel"}) SET t.name = "travel";
MATCH (r:KnowledgeRecord {id: "ks_5b8103df7f2521c5"}), (t:Tag {id: "travel"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"})
  SET r.kind = "case_frame", r.text = "> **Cluster:** this is **Sub-cluster B** of the `full-self-driving-unlock` family > \u2014 the \"mobility & time\" convergence (\"perfect Pepsis\" \u2014 see > `../zeitgeist-synthesis-notes.md`).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:83abb5fa65f3", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:4-6", r.lineStart = 4, r.lineEnd = 6, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "mobility"}) SET t.name = "mobility";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (t:Tag {id: "mobility"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_5d4e25516970c8bf"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"})
  SET r.kind = "case_frame", r.text = "This is `zeitgeist_synthesis` because the timing is load-bearing: the trigger is autonomy crossing to deployment (see the umbrella `full-self-driving-unlock` case) colliding with a short-haul air system already in secular decline and a commute/work pattern reverting to pre-pandemic norms.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:c093fefc6ecb", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:49-52", r.lineStart = 49, r.lineEnd = 52, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5e2dec158c8d0cc5"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"})
  SET r.kind = "signal", r.text = "Signal sources (cited in the with-solution file and `../sources.md` Signal Set D7): Brookings / NPR / BTS on short-haul share and decline; ERAU on car dominance and the short-haul-vs-autonomous-mobility modal choice; Valor Flights on the 3-hour door-to-door rule (Brightline West); BLS on driver employment; NATSO on the travel-center industry; Census ACS on commute time.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:c527bf4d12c6", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:68-72", r.lineStart = 68, r.lineEnd = 72, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_5fb704a2bef3e119"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"})
  SET r.kind = "claim", r.text = "And the deep edges are where it gets strange: auto insurers are among the largest advertisers in America (so ad-supported media is partly funded by the crash), and trauma deaths are a declining but disproportionately *high-quality* source of donor organs (so removing young crash victims tightens the best part of the transplant supply).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:00a568595fbe", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:20-24", r.lineStart = 20, r.lineEnd = 24, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "crash"}) SET t.name = "crash";
MATCH (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"}), (t:Tag {id: "crash"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_6c3edd9f72be7f5b"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"})
  SET r.kind = "case_frame", r.text = "Chapter 2 \u2014 labor + reclaimed time (the supply/work side).** Driving is also a *job* and a *tax on time*.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:661d82e9f144", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:30-31", r.lineStart = 30, r.lineEnd = 31, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_6d8ee52ab9d817f7"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-ownership-unwind"})
  SET c.title = "fsd-ownership-unwind";
MERGE (s:Source {id: "run-events/ks-demo-run-culled-1.json"})
  SET s.path = "run-events/ks-demo-run-culled-1.json";
MERGE (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"})
  SET r.kind = "ResearchFinding", r.text = "Dealer finance inventory risk is an early ownership-unwind signal: floorplan lenders, used-car inventory marks, and warranty reserve assumptions may move before households fully abandon cars.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:c813b240558d", r.citation = "run-events/ks-demo-run-culled-1.json#sequence-3", r.lineStart = 3, r.lineEnd = 3, r.heading = "Collapse from ks-demo-run-culled-1", r.runId = "ks-demo-run-culled-1", r.candidateId = "candidate-cold-ownership-1", r.criticId = "critic-market-structure", r.agenomeId = "cold-scout";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (c:Case {id: "fsd-ownership-unwind"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (s:Source {id: "run-events/ks-demo-run-culled-1.json"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:3"})
MERGE (r)-[:DERIVED_FROM_RECEIPT]->(receipt);
MERGE (run:Run {id: "ks-demo-run-culled-1"}) SET run.title = "ks-demo-run-culled-1";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (r)-[:DERIVED_FROM_RUN]->(run);
MERGE (cand:Candidate {id: "candidate-cold-ownership-1"}) SET cand.agenomeId = "cold-scout";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (cand:Candidate {id: "candidate-cold-ownership-1"})
MERGE (r)-[:SUPPORTED_BY_CANDIDATE]->(cand);
MATCH (cand:Candidate {id: "candidate-cold-ownership-1"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (cand)-[:PART_OF_RUN]->(run);
MERGE (critic:CriticReview {id: "critic-market-structure"}) SET critic.title = "critic-market-structure";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (critic:CriticReview {id: "critic-market-structure"})
MERGE (r)-[:FLAGGED_BY_CRITIC]->(critic);
MATCH (critic:CriticReview {id: "critic-market-structure"}), (cand:Candidate {id: "candidate-cold-ownership-1"})
MERGE (critic)-[:REVIEWED_CANDIDATE]->(cand);
MERGE (t:Tag {id: "dealer"}) SET t.name = "dealer";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (t:Tag {id: "dealer"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "finance"}) SET t.name = "finance";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (t:Tag {id: "finance"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "inventory"}) SET t.name = "inventory";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (t:Tag {id: "inventory"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "ownership"}) SET t.name = "ownership";
MATCH (r:KnowledgeRecord {id: "ks_790a6a42a3e0d827"}), (t:Tag {id: "ownership"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_7a95906b90ef92b9"})
  SET r.kind = "signal", r.text = "## Source Notes - Synthetic case built from public reporting; the thesis is an analytical projection for use as an eval fixture, not an audited forecast.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:6412a984d853", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:40-43", r.lineStart = 40, r.lineEnd = 43, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_7a95906b90ef92b9"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_7a95906b90ef92b9"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_7a95906b90ef92b9"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"})
  SET r.kind = "signal", r.text = "This is `zeitgeist_synthesis` because the timing is load-bearing: the trigger is autonomy crossing from solved-demo to legal-deployment in 2025\u20132026 (the umbrella `full-self-driving-unlock` case).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:c6e5687ff4f1", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:40-42", r.lineStart = 40, r.lineEnd = 42, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_7b5b0fa1c63b8e70"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"})
  SET r.kind = "claim", r.text = "Autonomy removes the **driver-fatigue ceiling** (sleep en route, wake there) and the **cost** at once, so a cheap, sleepable ground trip competes not with the 75-minute flight but with its *four-hour door-to-door reality* \u2014 and wins across the band that is half of US aviation.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:b331c38d6401", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:24-27", r.lineStart = 24, r.lineEnd = 27, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_7c2c9241ed129bfc"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"})
  SET r.kind = "claim", r.text = "Most people, once prompted, can see the first move: if cars stop crashing, car insurance and the body shop are in trouble.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:adde34d70380", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:8-9", r.lineStart = 8, r.lineEnd = 9, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "insurance"}) SET t.name = "insurance";
MATCH (r:KnowledgeRecord {id: "ks_837ccfab0442f7f1"}), (t:Tag {id: "insurance"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_85c44099a7d75b41"})
  SET r.kind = "hidden_variable", r.text = "The non-obvious counter-current: **the state wants its money.** Governments don't let a revenue line die quietly.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:247d60871d34", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:33-34", r.lineStart = 33, r.lineEnd = 34, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_85c44099a7d75b41"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_85c44099a7d75b41"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_85c44099a7d75b41"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_87155355d10aad90"})
  SET r.kind = "signal", r.text = "The mirror image is the **reclaimed time**: the average American commute is **27.2 min one-way** (\u22481 hr/day round trip; ACS 2024) with 69.2% driving alone \u2014 autonomy hands that hour back as attention/productivity, the new prize.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:80306709c366", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:37-40", r.lineStart = 37, r.lineEnd = 40, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_87155355d10aad90"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"})
  SET r.kind = "hidden_variable", r.text = "Ask the system to recover the actual problem (the removal of a ~$1T+ accident *substrate*, not a car-service upgrade), then to map the web (breadth) and game out the non-obvious second/third-order effects (depth), ending with what it converges to.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:0536290b6198", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:35-38", r.lineStart = 35, r.lineEnd = 38, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "accident"}) SET t.name = "accident";
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (t:Tag {id: "accident"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_8a464491ea6290ab"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"})
  SET r.kind = "claim", r.text = "Remove the driver and that wage pool and roadside economy unwind, while freight cost collapses (reshaping logistics, retail margins, and reshoring math).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:e3d177f3d999", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:36-37", r.lineStart = 36, r.lineEnd = 37, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_90e8d48618e9ec97"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"})
  SET r.kind = "case_frame", r.text = "Ask the system to recover the actual problem (a convergence re-pricing mobility and time across travel/labor/geography, mis-narrated as \"robotaxis in cities\" or as three unrelated trends), then game out the multi-chapter cascade into a `ZeitgeistSynthesisPayload`.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:6423549a15cd", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:56-59", r.lineStart = 56, r.lineEnd = 59, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "mobility"}) SET t.name = "mobility";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (t:Tag {id: "mobility"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "travel"}) SET t.name = "travel";
MATCH (r:KnowledgeRecord {id: "ks_94686333cdbee8bb"}), (t:Tag {id: "travel"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_98a75e563469dec5"})
  SET r.kind = "signal", r.text = "## Source Notes - Synthetic case built from public reporting; the thesis is an analytical projection for use as an eval fixture, not an audited forecast.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:bb32010902ae", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:61-64", r.lineStart = 61, r.lineEnd = 64, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_98a75e563469dec5"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_98a75e563469dec5"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_98a75e563469dec5"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"})
  SET r.kind = "case_frame", r.text = "> **Cluster:** one convergence within the `full-self-driving-unlock` family (the > \"perfect Pepsis\" \u2014 see `../zeitgeist-synthesis-notes.md`).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:8f8511febaf8", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:4-5", r.lineStart = 4, r.lineEnd = 5, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_9f8f2741ae730d9d"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_a75fae561994a53b"})
  SET r.kind = "claim", r.text = "The **culpability unit vanishes** \u2014 you can't cite a passenger \u2014 so liability moves from ~240M individual drivers to a few fleet operators/OEMs, emptying the highest-volume court docket in the country.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:2d5ac3bf17da", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:27-29", r.lineStart = 27, r.lineEnd = 29, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_a75fae561994a53b"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_a75fae561994a53b"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_a75fae561994a53b"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_acf838257ae1c4f7"})
  SET r.kind = "hidden_variable", r.text = "United States*) to vehicle searches, drug interdiction, warrant service, and **civil-asset forfeiture** \u2014 a pipeline that forfeits **$2\u20133B/yr federally** and mostly funds law-enforcement budgets.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:d725b7a76a53", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:23-25", r.lineStart = 23, r.lineEnd = 25, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_acf838257ae1c4f7"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_acf838257ae1c4f7"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_acf838257ae1c4f7"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"})
  SET r.kind = "signal", r.text = "The United States runs a ~$350 billion personal-auto insurance pool (about a third of all property-and- casualty premium), a multi-billion-dollar plaintiff bar, a trauma-medicine system, and a collision-repair industry, all of which exist to *price, litigate, repair, and treat human error behind the wheel*.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:163a9d5fbbc0", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:15-19", r.lineStart = 15, r.lineEnd = 19, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "insurance"}) SET t.name = "insurance";
MATCH (r:KnowledgeRecord {id: "ks_b1d1b823e80fac95"}), (t:Tag {id: "insurance"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"})
  SET r.kind = "hidden_variable", r.text = "These revenues and powers are collected *whether or not anyone ever crashes*, so they are their own substrate and their own convergence.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:4b7e46558863", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:12-14", r.lineStart = 12, r.lineEnd = 14, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_b4644feff268b3c8"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_bba9e18c2abc9cac"})
  SET r.kind = "signal", r.text = "The traffic stop is the single **most common reason for police-citizen contact in America** (~12.4M drivers + 3.8M passengers stopped in 2022; 58% of all police-initiated contact), and it is the **legal gateway** (the pretext stop, blessed by *Whren v.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:d97c9510331d", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:20-23", r.lineStart = 20, r.lineEnd = 23, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_bba9e18c2abc9cac"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_bba9e18c2abc9cac"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_bba9e18c2abc9cac"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"})
  SET r.kind = "claim", r.text = "Five years ago there was no credible removal of the violating driver; five years out the unwind \u2014 and the metering regime that replaces it \u2014 is consensus.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:d8477c40d068", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:42-44", r.lineStart = 42, r.lineEnd = 44, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_c29339ea5782e73b"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_c49a6031f986803f"})
  SET r.kind = "case_frame", r.text = "This chapter rides on Chapters 1 and 2 \u2014 it is the spatial consequence of cheap, sleepable, driver-free movement.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:3e8458fc9fad", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:46-47", r.lineStart = 46, r.lineEnd = 47, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_c49a6031f986803f"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_c49a6031f986803f"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_c49a6031f986803f"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_c6a0e022f013a6a3"})
  SET r.kind = "signal", r.text = "Short-haul flights under 500 miles are ~**half of all US domestic flights but only ~30% of passengers**; the car already wins 82\u201391% of 100\u2013500-mile trips and air doesn't decisively cross over until ~700 miles.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:3b83cf8d7f1a", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:19-21", r.lineStart = 19, r.lineEnd = 21, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_c6a0e022f013a6a3"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_c6a0e022f013a6a3"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_c6a0e022f013a6a3"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"})
  SET r.kind = "case_frame", r.text = "(Traffic fines, forfeiture, licensing, and the license-as-national-ID ride a *different* substrate \u2014 the driver as a policeable subject \u2014 and are handled in the sibling case `fsd-enforcement-economy`, Sub-cluster C; this case stays harm-only.) This is `zeitgeist_synthesis` because the timing is load-bearing: the trigger is autonomy crossing from solved-demo to legal-deployment in 2025\u20132026 (the umbrella case argues the capability is *solved*; this case takes that as given and asks what the accident economy does about it).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:e119a8478d26", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:24-32", r.lineStart = 24, r.lineEnd = 32, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "accident"}) SET t.name = "accident";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "accident"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "sibling"}) SET t.name = "sibling";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "sibling"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "substrate"}) SET t.name = "substrate";
MATCH (r:KnowledgeRecord {id: "ks_c9b4e98f2fe4425f"}), (t:Tag {id: "substrate"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"})
  SET r.kind = "case_frame", r.text = "> **Cluster:** **Sub-cluster C** of the `full-self-driving-unlock` family (the > \"perfect Pepsis\" \u2014 see `../zeitgeist-synthesis-notes.md`).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:4807fe8e1aff", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:4-5", r.lineStart = 4, r.lineEnd = 5, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "cluster"}) SET t.name = "cluster";
MATCH (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"}), (t:Tag {id: "cluster"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_d5e1dc3982822856"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"})
  SET r.kind = "claim", r.text = "Five years ago the car trip was capped by driver fatigue and there was no autonomy; five years out the substitution and the labor/time/geography re-pricing are consensus.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:8bae22477761", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:52-54", r.lineStart = 52, r.lineEnd = 54, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_de6275f81d0cd314"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"})
  SET r.kind = "case_frame", r.text = "Chapter 3 \u2014 geography / real estate (where people live).** If you can sleep or work en route, the commute radius detaches from \"daily drive time.\" Exurban/rural land within a sleeper-commute arc re-rates; parking (a large share of urban land) gets reclaimed; megaregions (BosWash, Texas Triangle, Piedmont Atlantic) weld into single labor markets.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:f81764408af7", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:42-46", r.lineStart = 42, r.lineEnd = 46, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "time"}) SET t.name = "time";
MATCH (r:KnowledgeRecord {id: "ks_dea97fbb794cbca4"}), (t:Tag {id: "time"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"})
  SET r.kind = "claim", r.text = "This case is about removing something different that autonomy also takes away: the human driver as a **policeable, fineable, registrable subject** \u2014 and the privately-operated vehicle as a registrable, inspectable object.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:07c7b4861e70", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:9-12", r.lineStart = 9, r.lineEnd = 12, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e0f4610d97be57f3"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e5d724e48fd900d0"})
  SET r.kind = "signal", r.text = "Figures are real and cited but applied to a forward projection; some dependencies (organ supply, ad budgets) are deliberately drawn at their *concentrated* edges and flagged as such \u2014 do not overstate them as macro lines.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:e9ceab2af9c3", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:44-47", r.lineStart = 44, r.lineEnd = 47, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_e5d724e48fd900d0"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e5d724e48fd900d0"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e5d724e48fd900d0"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e6090356b4ae7272"})
  SET r.kind = "signal", r.text = "Travel-share, driver-count, truck-stop, and commute-time figures are real/cited; the substitution thesis and predictions are bets.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:cbbda4cc0888", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:65-67", r.lineStart = 65, r.lineEnd = 67, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_e6090356b4ae7272"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e6090356b4ae7272"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e6090356b4ae7272"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e810e181edfba949"})
  SET r.kind = "case_frame", r.text = "# Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\") > **Doppl subtype:** `zeitgeist_synthesis` (see `../subtype-index.md`).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:dcc6f431d4e8", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:1-3", r.lineStart = 1, r.lineEnd = 3, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "enforcement"}) SET t.name = "enforcement";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (t:Tag {id: "enforcement"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e810e181edfba949"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_e965efcb5505b5ee"})
  SET r.kind = "signal", r.text = "Signal sources (cited in the with-solution file and `../sources.md` Signal Set D9): BJS Police-Public Contact Survey (traffic stops); *Whren v.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:f233411a534e", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:59-60", r.lineStart = 59, r.lineEnd = 60, r.heading = "Source Notes", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_e965efcb5505b5ee"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_e965efcb5505b5ee"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_e965efcb5505b5ee"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-mobility-and-time"})
  SET c.title = "fsd-mobility-and-time";
MERGE (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
  SET s.path = "case-studies/fsd-mobility-and-time/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_eda848ab218b06ac"})
  SET r.kind = "signal", r.text = "~**3 million** Americans drive for a living (\u22482.07M heavy/tractor-trailer + \u22481M light/delivery; BLS 2024), plus millions of rideshare/ delivery gig drivers; trucking is the most common job in many states.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:d8aa34e9d73c", r.citation = "case-studies/fsd-mobility-and-time/problem-statement.md:31-33", r.lineStart = 31, r.lineEnd = 33, r.heading = "Problem Statement: Autonomy Re-Prices Mobility & Time (the Driver/Friction Unlock)", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_eda848ab218b06ac"}), (c:Case {id: "fsd-mobility-and-time"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_eda848ab218b06ac"}), (s:Source {id: "case-studies/fsd-mobility-and-time/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_eda848ab218b06ac"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-ownership-unwind"})
  SET c.title = "fsd-ownership-unwind";
MERGE (s:Source {id: "run-events/ks-demo-run-culled-1.json"})
  SET s.path = "run-events/ks-demo-run-culled-1.json";
MERGE (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"})
  SET r.kind = "NegativeFinding", r.text = "Do not model ownership unwind as only an insurance or household-demand collapse; the dealer financing stack can fail first.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:6a1ceda6c1dc", r.citation = "run-events/ks-demo-run-culled-1.json#sequence-3", r.lineStart = 3, r.lineEnd = 3, r.heading = "Collapse from ks-demo-run-culled-1", r.runId = "ks-demo-run-culled-1", r.candidateId = "candidate-cold-ownership-1", r.criticId = "critic-market-structure", r.agenomeId = "cold-scout";
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (c:Case {id: "fsd-ownership-unwind"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (s:Source {id: "run-events/ks-demo-run-culled-1.json"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (receipt:RunEventReceipt {id: "receipt:ks-demo-run-culled-1:3"})
MERGE (r)-[:DERIVED_FROM_RECEIPT]->(receipt);
MERGE (run:Run {id: "ks-demo-run-culled-1"}) SET run.title = "ks-demo-run-culled-1";
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (r)-[:DERIVED_FROM_RUN]->(run);
MERGE (cand:Candidate {id: "candidate-cold-ownership-1"}) SET cand.agenomeId = "cold-scout";
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (cand:Candidate {id: "candidate-cold-ownership-1"})
MERGE (r)-[:SUPPORTED_BY_CANDIDATE]->(cand);
MATCH (cand:Candidate {id: "candidate-cold-ownership-1"}), (run:Run {id: "ks-demo-run-culled-1"})
MERGE (cand)-[:PART_OF_RUN]->(run);
MERGE (critic:CriticReview {id: "critic-market-structure"}) SET critic.title = "critic-market-structure";
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (critic:CriticReview {id: "critic-market-structure"})
MERGE (r)-[:FLAGGED_BY_CRITIC]->(critic);
MATCH (critic:CriticReview {id: "critic-market-structure"}), (cand:Candidate {id: "candidate-cold-ownership-1"})
MERGE (critic)-[:REVIEWED_CANDIDATE]->(cand);
MERGE (t:Tag {id: "finance"}) SET t.name = "finance";
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (t:Tag {id: "finance"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "ownership"}) SET t.name = "ownership";
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (t:Tag {id: "ownership"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "warning"}) SET t.name = "warning";
MATCH (r:KnowledgeRecord {id: "ks_ee78a17aedd6a531"}), (t:Tag {id: "warning"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-enforcement-economy"})
  SET c.title = "fsd-enforcement-economy";
MERGE (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-enforcement-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"})
  SET r.kind = "claim", r.text = "And the **compliance apparatus** \u2014 registration, inspection, emissions (already dying via EVs), driver licensing and the **driver's-license-as-national-ID** \u2014 loses its subject.", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:5a22f0c27a3f", r.citation = "case-studies/fsd-enforcement-economy/problem-statement.md:29-31", r.lineStart = 29, r.lineEnd = 31, r.heading = "Problem Statement: The Enforcement & Compliance Economy After Autonomy (the \"Traffic-State\")", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"}), (c:Case {id: "fsd-enforcement-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"}), (s:Source {id: "case-studies/fsd-enforcement-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "driver"}) SET t.name = "driver";
MATCH (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"}), (t:Tag {id: "driver"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_f7c9e70e2c539ef8"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);

MERGE (c:Case {id: "fsd-accident-economy"})
  SET c.title = "fsd-accident-economy";
MERGE (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
  SET s.path = "case-studies/fsd-accident-economy/problem-statement.md";
MERGE (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"})
  SET r.kind = "case_frame", r.text = "# Problem Statement: The Accident-Dependent Economy After Autonomy > **Doppl subtype:** `zeitgeist_synthesis` (see `../subtype-index.md`).", r.trustTier = "candidate", r.visibility = "public", r.sourceChunkId = "chunk:e9fbca8e1c79", r.citation = "case-studies/fsd-accident-economy/problem-statement.md:1-3", r.lineStart = 1, r.lineEnd = 3, r.heading = "Problem Statement: The Accident-Dependent Economy After Autonomy", r.runId = "", r.candidateId = "", r.criticId = "", r.agenomeId = "";
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (c:Case {id: "fsd-accident-economy"})
MERGE (r)-[:FROM_CASE]->(c);
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (s:Source {id: "case-studies/fsd-accident-economy/problem-statement.md"})
MERGE (r)-[:SUPPORTED_BY]->(s);
MERGE (t:Tag {id: "autonomy"}) SET t.name = "autonomy";
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (t:Tag {id: "autonomy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "economy"}) SET t.name = "economy";
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (t:Tag {id: "economy"})
MERGE (r)-[:HAS_TAG]->(t);
MERGE (t:Tag {id: "fsd"}) SET t.name = "fsd";
MATCH (r:KnowledgeRecord {id: "ks_ffe2bb2bd9b115d7"}), (t:Tag {id: "fsd"})
MERGE (r)-[:HAS_TAG]->(t);
