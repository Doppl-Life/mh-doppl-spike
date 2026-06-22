# Neo4j Dev Harness

This folder runs a local Neo4j projection for the Doppl Knowledge Space.

JSONL remains the source of truth. Neo4j is a rebuildable query projection
generated from `spikes/knowledge-space/data/knowledge.jsonl` via
`spikes/knowledge-space/out/neo4j.cypher`.

No hosted Neo4j account is required. The Docker Compose harness disables auth
for local development only:

- browser: `http://localhost:7474`
- bolt: `bolt://localhost:7687`

Do not replace this with real hosted credentials in Git. If the project later
uses Neo4j Aura or another hosted database, keep `NEO4J_URI`, `NEO4J_USERNAME`,
and `NEO4J_PASSWORD` in environment variables or an ignored local file.

Neo4j Browser still requires a Browser-side connection action before it will run
queries. For a true zero-click local view, use the live Query API page instead:

```bash
spikes/knowledge-space/neo4j/open-live.sh
```

That script rebuilds/imports the projection and opens
`spikes/knowledge-space/neo4j/live.html`, which automatically runs:

```cypher
MATCH path = (:Run {id: "run-rich-runtime-1"})-[*1..3]-()
RETURN path
LIMIT 80;
```

## Import

From the repository root:

```bash
chmod +x spikes/knowledge-space/neo4j/import.sh
spikes/knowledge-space/neo4j/import.sh
```

The script:

1. Regenerates the local demo ledger and `out/neo4j.cypher`.
2. Starts Neo4j with `docker-compose.yml`.
3. Applies `schema.cypher` constraints and indexes.
4. Imports `spikes/knowledge-space/out/neo4j.cypher`.
5. Runs `smoke.cypher`.

`open-live.sh` wraps the import and opens the auto-query graph page.

## Manual Commands

```bash
docker compose -f spikes/knowledge-space/neo4j/docker-compose.yml up -d
docker compose -f spikes/knowledge-space/neo4j/docker-compose.yml exec -T neo4j \
  cypher-shell < spikes/knowledge-space/neo4j/schema.cypher
docker compose -f spikes/knowledge-space/neo4j/docker-compose.yml exec -T neo4j \
  cypher-shell < spikes/knowledge-space/out/neo4j.cypher
docker compose -f spikes/knowledge-space/neo4j/docker-compose.yml exec -T neo4j \
  cypher-shell < spikes/knowledge-space/neo4j/smoke.cypher
```

## What The Smoke Checks Prove

- Runs exist.
- Imported `RunEventReceipt` nodes link to runs.
- `RunEventWatermark` nodes link to runs.
- Rich runtime nodes such as `Generation`, `Agenome`, `FitnessScore`,
  `NoveltyScore`, and `CheckResult` link back to run-event receipts.
- Collapse-derived knowledge records link back to the exact run-event receipt
  they came from.
- Tag/trust/provenance queries can be run against the projection without making
  Neo4j authoritative.

## Zero-Click Live Graph

Run:

```bash
spikes/knowledge-space/neo4j/open-live.sh
```

The page calls Neo4j's local HTTP Query API at
`http://localhost:7474/db/neo4j/query/v2`, parses returned paths, and renders the
runtime graph without a login prompt, paste step, or manual query run.

## Visual Graph In Neo4j Browser

Open `http://localhost:7474`. The local dev harness has auth disabled, but the
Browser UI may still ask you to connect to `neo4j://localhost:7687`. Leave the
password blank. To prefill the local connection modal, open:

```text
http://localhost:7474/browser/?connectURL=neo4j://localhost:7687&db=neo4j&instanceName=Doppl%20Knowledge%20Space
```

For the broader graph, run:

```cypher
MATCH path = (:Run)-[*1..3]-()
RETURN path
LIMIT 120;
```

For the richer runtime fixture specifically:

```cypher
MATCH path = (:Run {id: "run-rich-runtime-1"})-[*1..3]-()
RETURN path
LIMIT 80;
```

Neo4j Browser will render the returned paths as an interactive graph. This is the
"cool visual" Neo4j layer; `graph.html` remains the repo-native static view.
