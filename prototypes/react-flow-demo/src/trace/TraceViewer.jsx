import React, { useMemo, useState } from 'react';

const TONE_VARS = {
  cyan: 'var(--cyan)',
  blue: 'var(--blue)',
  green: 'var(--green)',
  gold: 'var(--gold)',
  pink: 'var(--pink)',
  violet: 'var(--violet)',
  mint: 'var(--mint)',
  child: 'var(--cyan)',
};

const ROLE_LABEL = {
  seed: 'seed',
  parent: 'parent',
  child: 'bred child',
  survivor: 'survivor',
};

const EVENT_GLYPH = {
  breed: '⊕ breed',
  fuse: '✶ fuse',
  cull: '✕ cull',
  survive: '→ survive',
};

const ATOM_TABS = [
  { id: 'promptResponse', label: 'Prompt & Response' },
  { id: 'criticBreakdown', label: 'Critic Breakdown' },
  { id: 'inheritance', label: 'Inheritance' },
];

function toneColor(tone) {
  return TONE_VARS[tone] || 'var(--cyan)';
}

function deltaText(value) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

function Bars({ metrics }) {
  return (
    <div className="trace-bars">
      {['energy', 'fitness', 'novelty'].map((key) => (
        <div key={key} className="trace-bar">
          <span>{key}</span>
          <i><b style={{ width: `${metrics[key]}%` }} /></i>
          <strong>{metrics[key]}</strong>
        </div>
      ))}
    </div>
  );
}

function IndividualCard({ individual, onOpen }) {
  const color = toneColor(individual.tone);
  return (
    <button
      type="button"
      className="trace-card"
      style={{ '--tone': color }}
      onClick={() => onOpen(individual.id)}
    >
      <div className="trace-card-head">
        <span className="trace-role">{ROLE_LABEL[individual.role] || individual.role}</span>
        {individual.delta && (
          <span className={`trace-delta ${individual.delta.fitness >= 0 ? 'up' : 'down'}`}>
            fitness {deltaText(individual.delta.fitness)}
          </span>
        )}
      </div>
      <h4>{individual.title}</h4>
      <p className="trace-skill">{individual.label}</p>
      <Bars metrics={individual.metrics} />
      <span className="trace-dive">dive in →</span>
    </button>
  );
}

function GenerationColumn({ generation, isLast, onOpen }) {
  const topFitness = Math.max(...generation.individuals.map((item) => item.metrics.fitness));
  const energyPct = Math.round((generation.energy.remaining / generation.energy.budget) * 100);
  return (
    <div className="trace-gen">
      <div className="trace-gen-head">
        <p className="eyebrow">{generation.label}</p>
        <p className="trace-gen-summary">{generation.summary}</p>
        <div className="trace-energy">
          <span>energy {generation.energy.remaining}/{generation.energy.budget}</span>
          <i><b style={{ width: `${energyPct}%` }} /></i>
          <span className="trace-topfit">peak fitness {topFitness}</span>
        </div>
      </div>

      <div className="trace-gen-cards">
        {generation.individuals.map((individual) => (
          <IndividualCard key={individual.id} individual={individual} onOpen={onOpen} />
        ))}
      </div>

      {!isLast && (
        <div className="trace-events">
          <p className="eyebrow">selection pressure →</p>
          {generation.events.map((event, index) => (
            <div key={index} className={`trace-event trace-event-${event.type}`}>
              <span className="trace-event-kind">{EVENT_GLYPH[event.type] || event.type}</span>
              <p>{event.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreGrid({ scores, scoreNames }) {
  return (
    <div className="trace-score-grid">
      {scoreNames.map((name) => (
        <div key={name}>
          <span>{name.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
          <strong>{scores[name]}</strong>
          <i><b style={{ width: `${scores[name]}%` }} /></i>
        </div>
      ))}
    </div>
  );
}

function AtomPanel({ atomTab, atoms }) {
  if (atomTab === 'promptResponse') {
    const { systemPrompt, userPrompt, rawResponse } = atoms.promptResponse;
    return (
      <div className="trace-atom">
        <p className="trace-atom-label">system prompt</p>
        <pre>{systemPrompt}</pre>
        <p className="trace-atom-label">user prompt</p>
        <pre>{userPrompt}</pre>
        <p className="trace-atom-label">raw model response</p>
        <pre className="trace-raw">{rawResponse}</pre>
      </div>
    );
  }

  if (atomTab === 'criticBreakdown') {
    return (
      <div className="trace-atom">
        {atoms.criticBreakdown.map((row) => (
          <div key={row.dimension} className="trace-critic-row">
            <div className="trace-critic-head">
              <span>{row.dimension.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              <strong>{row.score}</strong>
            </div>
            <i><b style={{ width: `${row.score}%` }} /></i>
            <p>{row.reasoning}</p>
          </div>
        ))}
      </div>
    );
  }

  // inheritance
  const { ratio, logic, parents } = atoms.inheritance;
  return (
    <div className="trace-atom">
      <div className="trace-ratio">
        <span>fusion ratio</span>
        <strong>{ratio || 'pure seed'}</strong>
      </div>
      <p className="trace-logic">{logic}</p>
      {parents.length === 0 ? (
        <p className="trace-empty">No parents — this individual is a seed.</p>
      ) : (
        <div className="trace-parents">
          {parents.map((parent) => (
            <div key={parent.id} className="trace-parent">
              <div className="trace-parent-head">
                <strong>{parent.id}</strong>
                <span>{parent.share}%</span>
              </div>
              <i><b style={{ width: `${parent.share}%` }} /></i>
              <div className="trace-traits">
                {parent.traitsTaken.map((trait) => (
                  <span key={trait}>{trait}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailView({ trace, location, onBack, atomTab, setAtomTab }) {
  const { generation, individual } = location;
  const color = toneColor(individual.tone);
  return (
    <div className="trace-detail" style={{ '--tone': color }}>
      <div className="trace-breadcrumb">
        <button type="button" onClick={onBack}>{trace.title}</button>
        <span>▸</span>
        <button type="button" onClick={onBack}>{generation.label}</button>
        <span>▸</span>
        <strong>{individual.title}</strong>
      </div>

      <div className="trace-detail-grid">
        <section className="trace-individual">
          <p className="eyebrow">{ROLE_LABEL[individual.role] || individual.role} · {individual.label}</p>
          <h3>{individual.title}</h3>
          <p className="trace-proposal">{individual.proposal}</p>
          <div className="trace-verdict">
            <span>critic verdict</span>
            <p>{individual.verdict}</p>
          </div>
          <Bars metrics={individual.metrics} />
          <ScoreGrid scores={individual.scores} scoreNames={trace.scoreNames} />
        </section>

        <section className="trace-atom-shell">
          <p className="eyebrow">atom — the evidence underneath</p>
          <div className="trace-atom-tabs">
            {ATOM_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-selected={atomTab === tab.id}
                onClick={() => setAtomTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <AtomPanel atomTab={atomTab} atoms={individual.atoms} />
        </section>
      </div>
    </div>
  );
}

export default function TraceViewer({ trace, selectedCase = null, boundaryRail = null }) {
  const displayTrace = selectedCase
    ? {
        ...trace,
        title: `Lineage over time — ${selectedCase.title}`,
        case: {
          ...trace.case,
          id: selectedCase.id,
          title: selectedCase.title,
          prompt: selectedCase.prompt,
        },
      }
    : trace;
  const [selectedId, setSelectedId] = useState(null);
  const [atomTab, setAtomTab] = useState('promptResponse');

  const location = useMemo(() => {
    if (!selectedId) return null;
    for (const generation of displayTrace.generations) {
      const individual = generation.individuals.find((item) => item.id === selectedId);
      if (individual) return { generation, individual };
    }
    return null;
  }, [selectedId, displayTrace]);

  return (
    <section className="prototype trace-viewer">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype 04 · trace ingestor</p>
          <h2>Run Trace Viewer</h2>
          <p>
            One schema, one lens. This viewer ingests any run trace (lineage, fusion, inter-stratum,
            crossover) and gives the same zoom: <strong>meta</strong> (the population over time) →
            <strong> individual</strong> (one agenome's run) → <strong>atom</strong> (the literal
            prompt, the per-critic reasoning, the inheritance math). Drill-down lives in the viewer,
            not in each experiment.
          </p>
        </div>
        <div className="case-card">
          <span>{trace.source === 'live' ? 'live model run' : 'sample trace'} · {trace.kind}</span>
          <strong>{displayTrace.case.title}</strong>
          <p>
            {displayTrace.generations.length} generations · gen/critic model {displayTrace.models.generation}.
            {displayTrace.source === 'sample' && ' Sample mechanics shown with selected case packet context.'}
          </p>
        </div>
      </div>

      <div className="prototype-with-boundary trace-with-boundary">
        <div className="trace-main">
          {location ? (
            <DetailView
              trace={displayTrace}
              location={location}
              onBack={() => setSelectedId(null)}
              atomTab={atomTab}
              setAtomTab={setAtomTab}
            />
          ) : (
            <div className="trace-board">
              {displayTrace.generations.map((generation, index) => (
                <GenerationColumn
                  key={generation.index}
                  generation={generation}
                  isLast={index === displayTrace.generations.length - 1}
                  onOpen={setSelectedId}
                />
              ))}
            </div>
          )}
        </div>
        {boundaryRail}
      </div>
    </section>
  );
}
