# Doppl run-trace schema (v1)

One trace format, one viewer. Every experiment (lineage / fusion / inter-stratum /
crossover) emits this shape; the `TraceViewer` ingests it and gives you the same
**meta → individual → atom** zoom for free. This is the `harness/`-reserved
"comparable traces" idea made concrete (see repo `harness/README.md`).

The point: **drill-down is a property of the viewer, not of each experiment.** An
experiment's only job is to fill this schema honestly down to the atom (the literal
prompt, the per-critic reasoning, the inheritance math).

## Top level

```ts
type Trace = {
  schemaVersion: 1;
  kind: 'lineage' | 'fusion' | 'interstratum' | 'crossover';
  id: string;
  title: string;
  source: 'live' | 'sample';          // 'sample' = hand-shaped seed; 'live' = real model run
  generatedAt: string;                // ISO
  case: { id: string; title: string; prompt: string };
  models: { generation: string; critic: string };
  scoreNames: string[];               // the critic dimensions, in display order
  generations: Generation[];          // time → ; index 0 is the seed population
};
```

## Generation (the META level)

```ts
type Generation = {
  index: number;
  label: string;                      // e.g. "Gen 0 — seed population"
  summary: string;                    // one line: what happened this generation
  energy: { budget: number; spent: number; remaining: number };
  individuals: Individual[];
  events: SelectionEvent[];           // breed / cull / fuse / survive between this gen and the next
};

type SelectionEvent = {
  type: 'breed' | 'cull' | 'fuse' | 'survive';
  from: string[];                     // individual ids in this generation
  to: string | null;                  // individual id in the next generation (null for cull)
  reason: string;
};
```

## Individual (the INDIVIDUAL level)

```ts
type Individual = {
  id: string;
  skillId: string;                    // which agenome/skill expressed (or "x" fusion of two)
  label: string;
  title: string;
  tone: string;                       // color key reused from the existing palette
  role: 'seed' | 'parent' | 'child' | 'survivor';
  proposal: string;
  verdict: string;
  metrics: { energy: number; fitness: number; novelty: number };
  scores: Record<string, number>;     // keyed by scoreNames
  delta: { energy: number; fitness: number; novelty: number } | null; // vs prior gen / parent avg
  atoms: Atoms;
};
```

## Atoms (the ATOM level — switchable, all three)

The deepest zoom. Whatever the viewer shows here must be real evidence, not a summary.

```ts
type Atoms = {
  promptResponse: {
    systemPrompt: string;
    userPrompt: string;
    rawResponse: string;              // the model's literal JSON/text reply
  };
  criticBreakdown: Array<{
    dimension: string;                // one of scoreNames
    score: number;
    reasoning: string;                // why the critic gave that score
  }>;
  inheritance: {
    ratio: string | null;             // e.g. "57:43" (null for pure seeds)
    logic: string;                    // how traits were combined
    parents: Array<{ id: string; share: number; traitsTaken: string[] }>;
  };
};
```

## Conformance

- A pure seed individual has `role: 'seed'`, `delta: null`, and
  `atoms.inheritance.parents: []`.
- `scores` keys must equal `scoreNames`.
- `events[].to` ids must exist in the *next* generation (or be `null` for `cull`).
- The live generational runner (step 2) emits exactly this; `sampleTrace.js` is a
  hand-shaped instance of it for building the viewer with zero spend.
