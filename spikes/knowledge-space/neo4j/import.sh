#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SPIKE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SPIKE_DIR/../.." && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
CYPHER_FILE="$REPO_ROOT/spikes/knowledge-space/out/neo4j.cypher"

cd "$REPO_ROOT"
python3 spikes/knowledge-space/knowledge_space.py --demo

docker compose -f "$COMPOSE_FILE" up -d

echo "Waiting for local Neo4j..."
for _ in $(seq 1 45); do
  if docker compose -f "$COMPOSE_FILE" exec -T neo4j cypher-shell "RETURN 1;" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

docker compose -f "$COMPOSE_FILE" exec -T neo4j cypher-shell < "$SCRIPT_DIR/schema.cypher"
docker compose -f "$COMPOSE_FILE" exec -T neo4j cypher-shell < "$CYPHER_FILE"
docker compose -f "$COMPOSE_FILE" exec -T neo4j cypher-shell < "$SCRIPT_DIR/smoke.cypher"
