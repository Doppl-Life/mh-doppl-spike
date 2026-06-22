# Knowledge Graph Snapshot

Nodes: `101`
Edges: `268`

## Node Types

- `Agenome`: `2`
- `Candidate`: `2`
- `Case`: `4`
- `CheckResult`: `1`
- `CriticReview`: `2`
- `FitnessScore`: `1`
- `Generation`: `1`
- `KnowledgeRecord`: `49`
- `NoveltyScore`: `1`
- `Run`: `2`
- `RunEventReceipt`: `11`
- `RunEventWatermark`: `2`
- `Source`: `4`
- `Tag`: `19`

## Provenance Edges

- `DERIVED_FROM_RECEIPT`: `record:ks_790a6a42a3e0d827` -> `receipt:ks-demo-run-culled-1:3`
- `DERIVED_FROM_RECEIPT`: `record:ks_ee78a17aedd6a531` -> `receipt:ks-demo-run-culled-1:3`
- `RECEIPT_OF_CANDIDATE`: `receipt:ks-demo-run-culled-1:2` -> `candidate:candidate-cold-ownership-1`
- `RECEIPT_OF_CANDIDATE`: `receipt:run-rich-runtime-1:4` -> `candidate:cand-rich-accident`
- `RECEIPT_OF_CRITIC`: `receipt:ks-demo-run-culled-1:3` -> `critic:critic-market-structure`
- `RECEIPT_OF_CRITIC`: `receipt:run-rich-runtime-1:8` -> `critic:factual-grounding`
- `RECEIPT_OF_RUN`: `receipt:ks-demo-run-culled-1:1` -> `run:ks-demo-run-culled-1`
- `RECEIPT_OF_RUN`: `receipt:ks-demo-run-culled-1:2` -> `run:ks-demo-run-culled-1`
- `RECEIPT_OF_RUN`: `receipt:ks-demo-run-culled-1:3` -> `run:ks-demo-run-culled-1`
- `RECEIPT_OF_RUN`: `receipt:run-rich-runtime-1:1` -> `run:run-rich-runtime-1`
- `RECEIPT_OF_RUN`: `receipt:run-rich-runtime-1:2` -> `run:run-rich-runtime-1`
- `RECEIPT_OF_RUN`: `receipt:run-rich-runtime-1:3` -> `run:run-rich-runtime-1`
- `RECEIPT_OF_RUN`: `receipt:run-rich-runtime-1:4` -> `run:run-rich-runtime-1`
- `RECEIPT_OF_RUN`: `receipt:run-rich-runtime-1:5` -> `run:run-rich-runtime-1`
- `RECEIPT_OF_RUN`: `receipt:run-rich-runtime-1:6` -> `run:run-rich-runtime-1`
- `RECEIPT_OF_RUN`: `receipt:run-rich-runtime-1:7` -> `run:run-rich-runtime-1`
- `RECEIPT_OF_RUN`: `receipt:run-rich-runtime-1:8` -> `run:run-rich-runtime-1`
- `WATERMARK_FOR_RUN`: `watermark:ks-demo-run-culled-1` -> `run:ks-demo-run-culled-1`
- `WATERMARK_FOR_RUN`: `watermark:run-rich-runtime-1` -> `run:run-rich-runtime-1`

## Sample Nodes

- `agenome:agenome-cold-scout` [Agenome] Cold Scout
- `agenome:cold-scout` [Agenome] cold-scout
- `candidate:cand-rich-accident` [Candidate] cand-rich-accident
- `candidate:candidate-cold-ownership-1` [Candidate] candidate-cold-ownership-1
- `case:fsd-accident-economy` [Case] fsd-accident-economy
- `case:fsd-enforcement-economy` [Case] fsd-enforcement-economy
- `case:fsd-mobility-and-time` [Case] fsd-mobility-and-time
- `case:fsd-ownership-unwind` [Case] fsd-ownership-unwind
- `check:check:cand-rich-accident:grounded` [CheckResult] check:cand-rich-accident:grounded
- `critic:critic-market-structure` [CriticReview] critic-market-structure
- `critic:factual-grounding` [CriticReview] factual-grounding
- `fitness:fit-rich-accident` [FitnessScore] fit-rich-accident
- `generation:run-rich-runtime-1:generation:0` [Generation] generation 0
- `novelty:novelty:cand-rich-accident` [NoveltyScore] novelty:cand-rich-accident
- `receipt:ks-demo-run-culled-1:1` [RunEventReceipt] run.configured #1
- `receipt:ks-demo-run-culled-1:2` [RunEventReceipt] candidate.produced #2
- `receipt:ks-demo-run-culled-1:3` [RunEventReceipt] critic.review #3
- `receipt:run-rich-runtime-1:1` [RunEventReceipt] run.configured #1
- `receipt:run-rich-runtime-1:2` [RunEventReceipt] generation.created #2
- `receipt:run-rich-runtime-1:3` [RunEventReceipt] agenome.spawned #3
- `receipt:run-rich-runtime-1:4` [RunEventReceipt] candidate.produced #4
- `receipt:run-rich-runtime-1:5` [RunEventReceipt] check.completed #5
- `receipt:run-rich-runtime-1:6` [RunEventReceipt] fitness.scored #6
- `receipt:run-rich-runtime-1:7` [RunEventReceipt] novelty.scored #7
