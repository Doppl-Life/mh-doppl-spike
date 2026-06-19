# skill-lineage

Parse `SKILL.md` lineage frontmatter into a typed **studbook graph**, diff it
against a hand-maintained `LINEAGE.md`, and regenerate that table from the
frontmatter (the source of truth). Pure logic; all I/O is injected.

This is the crucible's **first promotion** to `ts-modules/` — see the shelf
contract in [`../README.md`](../README.md).

## Boundary contract (the 5-node view)

```
[ Host expression layer ]                     entersFrom (datastore)
   .cursor/skills · .claude/skills · .codex/skills
      → ⟦ in:  Lineage ⟧                       input contract
         → ( skill-lineage )                   the module
      → ⟦ out: LineageGraphProjection ⟧        output contract
[ Lineage registry + React Flow dashboard ]   exitsTo (datastore)
```

The module exports this as a machine-readable `boundary: BoundaryContract`. The
same descriptor (a) renders as the React Flow diagram, (b) is the promotion
gate's "typed public API + injected I/O" made checkable, and (c) maps 1:1 onto
a Doppl-Prime import-direction DAG edge.

## Layout (portable-folder convention)

```
skill-lineage/                 # dev harness (package.json, tsconfig) — NOT promoted
  skill-lineage/               # the portable folder — copy this into a host project
    index.ts                   # public boundary
    contract/index.ts          # Zod schemas → Prime packages/contracts
    core/index.ts              # pure logic   → Prime apps/api/skill-lineage
```

The inner folder is named after the module (not `src/`) so it drops uniquely
into another repo's source tree; the host's package.json/tsconfig already exist
at the higher level — you move one folder and fix imports.

## Interface

```ts
import {
  parseSkill, parseLineage, buildStudbook,
  diffStudbook, renderLineageTable, toReactFlow, boundary,
} from 'skill-lineage';

const skills = files.map((f) => parseSkill(f.text, { expressesAt: [f.path] }));
const graph = buildStudbook(skills);              // LineageGraphProjection

const drift = diffStudbook(graph, lineageMdText); // DriftReport (frontmatter wins)
if (!drift.ok) console.error(drift);

const table = renderLineageTable(graph);          // regenerated LINEAGE.md
const { nodes, edges } = toReactFlow(graph);      // ready for @xyflow/react
```

| Function | In | Out |
| --- | --- | --- |
| `parseSkill(md, opts?)` | one SKILL.md string | `Skill` (name + description + lineage) |
| `parseLineage(md)` | one SKILL.md string | `Lineage` (pedigree only) |
| `buildStudbook(skills)` | `Skill[]` | `LineageGraphProjection` |
| `diffStudbook(graph, table)` | graph + LINEAGE.md text | `DriftReport` |
| `renderLineageTable(graph)` | graph | LINEAGE.md markdown |
| `toReactFlow(graph)` | graph | `{ nodes, edges }` |

## Dependencies

`zod` (contracts, Prime's contract language) and `yaml` (frontmatter parse).
No server, DB, or key. Tests: `pnpm test`.

## Lexicon stub

So the module isn't semantically naked outside this repo:

- **Lineage** — a skill's heritable pedigree: `{ id, parent, progenitor,
  generation, mutagenClass, mutation, stratum, status, bedrock }`. The genome of
  a skill, carried in its own frontmatter.
- **Studbook** — the derived family tree of all lineages (nodes = skills, edges
  = parent/progenitor relations). The registry is computed, not hand-typed.
- **Boundary contract** — the typed seam where a module meets the spaces around
  it: what enters, the contract, what exits. Doppl-Prime calls these frozen
  seam contracts; here it's also the unit of the React Flow diagram.
- **Space** — a producer or consumer surface on either side of the boundary
  (a datastore, a stratum, or another module).
- **Mutagen class** — the operator that produced a skill from its progenitor
  (`valence-flip`, `basis-transform`, `scarcity-operator`, `domain-transfer`).

## Promotion to Doppl-Prime

| Piece | Lands as |
| --- | --- |
| `contract/index.ts` | `packages/contracts` (Zod; `LineageGraphProjection` is already on Prime's freeze list) |
| `core/index.ts` | `apps/api/skill-lineage/` |
| `boundary` descriptor | `packages/contracts` (reusable seam type) |
| `toReactFlow` output | `apps/web` lineage dashboard |
