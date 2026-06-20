import React from 'react';

const phases = [
  {
    id: 'source',
    stage: '01',
    title: 'Find the real problem',
    modules: [
      { tab: 'discovery', label: 'Discovery radar' },
      { tab: 'intake', label: 'Case intake' },
      { tab: 'contracts', label: 'Contract freeze' },
    ],
    summary:
      'Doppl starts by turning a messy source into a case packet, then separates what agents may see from evaluator-only anchors and validates the shared shapes before the run begins.',
    visual: ['messy source', 'problem frame', 'run seed packet', 'frozen contracts'],
    handoff: 'RunSeedPacket + validated contract shapes',
    proof: 'The next modules receive a bounded problem, not a leaked answer.',
  },
  {
    id: 'configure',
    stage: '02',
    title: 'Prepare the organism',
    modules: [
      { tab: 'agenomes', label: 'Agenome pool' },
      { tab: 'operator', label: 'Operator console' },
    ],
    summary:
      'The run gets a starting population, mutagen traits, caps, and operator controls. This is where exploration is made energetic but still bounded.',
    visual: ['mutagens', 'run caps', 'starting population', 'operator mode'],
    handoff: 'RunConfig + selected Agenome[] + cap policy',
    proof: 'A run can be ambitious without becoming unbounded or theatrical.',
  },
  {
    id: 'route',
    stage: '03',
    title: 'Route every intelligence call',
    modules: [
      { tab: 'gateway', label: 'Gateway forge' },
      { tab: 'replay', label: 'Replay spine' },
    ],
    summary:
      'Model output crosses one accountable gateway. Accepted payloads, rejected payloads, repairs, costs, and provider metadata become replayable events.',
    visual: ['request', 'schema gate', 'repair or reject', 'append event'],
    handoff: 'ModelGatewayResponse + RunEventEnvelope',
    proof: 'Replay can reconstruct what happened without fresh model calls.',
  },
  {
    id: 'evolve',
    stage: '04',
    title: 'Spend, select, and breed',
    modules: [
      { tab: 'energy', label: 'Energy metabolism' },
      { tab: 'fusion', label: 'Fusion lab' },
      { tab: 'trace', label: 'Trace viewer' },
    ],
    summary:
      'Agenomes consume energy, produce candidate ideas, and fuse useful parent traits into children. The trace viewer makes the lineage inspectable at meta, individual, and atom levels.',
    visual: ['parent A', 'parent B', 'energy pressure', 'bred child'],
    handoff: 'Lineage edge + child Agenome + candidate draft',
    proof: 'The child is not just a new answer; it has inherited reasons.',
  },
  {
    id: 'judge',
    stage: '05',
    title: 'Attack the candidate',
    modules: [
      { tab: 'critic', label: 'Critic council' },
      { tab: 'subtype', label: 'Subtype checks' },
      { tab: 'novelty', label: 'Novelty radar' },
    ],
    summary:
      'Verifier modules review factual grounding, subtype fit, feasibility, novelty, and prior-art overlap. Fitness is evidence-weighted instead of vibes-weighted.',
    visual: ['candidate', 'critics', 'subtype checks', 'novelty score'],
    handoff: 'CheckResult[] + NoveltyScore + FitnessScore inputs',
    proof: 'Selection can explain why one generation beats another.',
  },
  {
    id: 'prove',
    stage: '06',
    title: 'Show the survivor and what was learned',
    modules: [
      { tab: 'survivor', label: 'Survivor proof' },
      { tab: 'spend', label: 'Spend ledger' },
      { tab: 'distillation', label: 'Distillation gate' },
      { tab: 'fallback', label: 'Fallback ladder' },
    ],
    summary:
      'The final surface explains the winning idea, its evidence trail, its spend, and whether any proposed learning should be promoted for future runs. Demo fallback keeps liveness honest.',
    visual: ['survivor', 'evidence', 'spend', 'learning review'],
    handoff: 'Selected CandidateIdea + proof bundle + LearningPromotionReview',
    proof: 'The audience sees both the answer and the audit trail that made it win.',
  },
];

function ConnectorVisual({ items }) {
  return (
    <ol className="chain-visual" aria-label="Phase flow">
      {items.map((item, index) => (
        <li key={item}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{item}</strong>
        </li>
      ))}
    </ol>
  );
}

export default function ProcessChain({ selectedCase, onOpenPrototype }) {
  return (
    <section className="prototype chain-prototype">
      <div className="prototype-heading chain-heading">
        <div>
          <p className="eyebrow">faux linked prototype</p>
          <h2>One Run, Many Organisms</h2>
          <p>
            A guided pass through the Doppl prototype suite. Each phase shows the essential handoff
            between prototypes for the active case study, without opening every workbench drawer.
          </p>
        </div>
        <div className="case-card chain-case-card">
          <span>active case</span>
          <strong>{selectedCase.title}</strong>
          <p>{selectedCase.fixtureNote}</p>
        </div>
      </div>

      <div className="chain-scroll-map" aria-hidden="true">
        {phases.map((phase) => (
          <a key={phase.id} href={`#chain-${phase.id}`}>{phase.stage}</a>
        ))}
      </div>

      <div className="chain-phase-list">
        {phases.map((phase, index) => (
          <article className="chain-phase" id={`chain-${phase.id}`} key={phase.id}>
            <div className="chain-phase-copy">
              <p className="eyebrow">phase {phase.stage}</p>
              <h3>{phase.title}</h3>
              <p>{phase.summary}</p>
              <div className="chain-handoff">
                <span>handoff</span>
                <strong>{phase.handoff}</strong>
                <p>{phase.proof}</p>
              </div>
            </div>

            <div className="chain-phase-visual">
              <ConnectorVisual items={phase.visual} />
              <div className="chain-module-links" aria-label={`${phase.title} prototypes`}>
                {phase.modules.map((module) => (
                  <button key={module.tab} type="button" onClick={() => onOpenPrototype(module.tab)}>
                    {module.label}
                  </button>
                ))}
              </div>
            </div>

            {index < phases.length - 1 && (
              <a className="chain-next" href={`#chain-${phases[index + 1].id}`}>
                <span>next phase</span>
                <b>{phases[index + 1].title}</b>
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
