MATCH (run:Run)
RETURN "runs" AS check, count(run) AS count;

MATCH (receipt:RunEventReceipt)-[:RECEIPT_OF_RUN]->(:Run)
RETURN "receipts linked to runs" AS check, count(receipt) AS count;

MATCH (watermark:RunEventWatermark)-[:WATERMARK_FOR_RUN]->(:Run)
RETURN "watermarks linked to runs" AS check, count(watermark) AS count;

MATCH (record:KnowledgeRecord)-[:DERIVED_FROM_RECEIPT]->(receipt:RunEventReceipt)
RETURN "records derived from receipts" AS check, count(record) AS count;

MATCH (:Generation)-[:GENERATION_OF_RUN]->(:Run)
RETURN "generations linked to runs" AS check, count(*) AS count;

MATCH (:Agenome)-[:AGENOME_IN_GENERATION]->(:Generation)
RETURN "agenomes linked to generations" AS check, count(*) AS count;

MATCH (:FitnessScore)-[:SCORES_CANDIDATE]->(:Candidate)
RETURN "fitness linked to candidates" AS check, count(*) AS count;

MATCH (:NoveltyScore)-[:SCORES_CANDIDATE]->(:Candidate)
RETURN "novelty linked to candidates" AS check, count(*) AS count;

MATCH (:CheckResult)-[:CHECKS_CANDIDATE]->(:Candidate)
RETURN "checks linked to candidates" AS check, count(*) AS count;

MATCH (record:KnowledgeRecord)-[:DERIVED_FROM_RECEIPT]->(receipt:RunEventReceipt)-[:RECEIPT_OF_RUN]->(run:Run)
RETURN
  record.kind AS recordKind,
  record.citation AS citation,
  receipt.eventType AS eventType,
  receipt.sequence AS sequence,
  run.id AS runId
ORDER BY runId, sequence, recordKind
LIMIT 12;

MATCH (record:KnowledgeRecord)-[:HAS_TAG]->(tag:Tag)
WHERE tag.id IN ["fsd", "finance", "ownership"]
RETURN tag.id AS tag, collect(record.kind)[0..8] AS exampleKinds, count(record) AS count
ORDER BY count DESC;

MATCH path = (:Run {id: "run-rich-runtime-1"})-[*1..3]-()
RETURN path
LIMIT 80;
