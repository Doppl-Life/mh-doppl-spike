MATCH (run:Run)
RETURN "runs" AS check, count(run) AS count;

MATCH (receipt:RunEventReceipt)-[:RECEIPT_OF_RUN]->(:Run)
RETURN "receipts linked to runs" AS check, count(receipt) AS count;

MATCH (watermark:RunEventWatermark)-[:WATERMARK_FOR_RUN]->(:Run)
RETURN "watermarks linked to runs" AS check, count(watermark) AS count;

MATCH (record:KnowledgeRecord)-[:DERIVED_FROM_RECEIPT]->(receipt:RunEventReceipt)
RETURN "records derived from receipts" AS check, count(record) AS count;

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
