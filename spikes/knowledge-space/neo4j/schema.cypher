CREATE CONSTRAINT knowledge_record_id IF NOT EXISTS FOR (r:KnowledgeRecord) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT case_id IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT tag_id IF NOT EXISTS FOR (t:Tag) REQUIRE t.id IS UNIQUE;
CREATE CONSTRAINT source_id IF NOT EXISTS FOR (s:Source) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT run_id IF NOT EXISTS FOR (run:Run) REQUIRE run.id IS UNIQUE;
CREATE CONSTRAINT candidate_id IF NOT EXISTS FOR (cand:Candidate) REQUIRE cand.id IS UNIQUE;
CREATE CONSTRAINT critic_id IF NOT EXISTS FOR (critic:CriticReview) REQUIRE critic.id IS UNIQUE;
CREATE CONSTRAINT run_event_receipt_id IF NOT EXISTS FOR (receipt:RunEventReceipt) REQUIRE receipt.id IS UNIQUE;
CREATE CONSTRAINT run_event_watermark_id IF NOT EXISTS FOR (watermark:RunEventWatermark) REQUIRE watermark.id IS UNIQUE;

CREATE INDEX knowledge_record_trust_tier IF NOT EXISTS FOR (r:KnowledgeRecord) ON (r.trustTier);
CREATE INDEX knowledge_record_visibility IF NOT EXISTS FOR (r:KnowledgeRecord) ON (r.visibility);
CREATE INDEX knowledge_record_run_id IF NOT EXISTS FOR (r:KnowledgeRecord) ON (r.runId);
CREATE INDEX run_event_receipt_run_sequence IF NOT EXISTS FOR (receipt:RunEventReceipt) ON (receipt.runId, receipt.sequence);
CREATE INDEX run_event_receipt_event_type IF NOT EXISTS FOR (receipt:RunEventReceipt) ON (receipt.eventType);
CREATE INDEX run_event_watermark_run_id IF NOT EXISTS FOR (watermark:RunEventWatermark) ON (watermark.runId);
