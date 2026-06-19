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

const traceCaseOverlays = {
  'loft-insulation-adoption': {
    title: 'Lineage over time — Loft Insulation Adoption Failure',
    generationSummaries: {
      0: 'Four mutagen agenomes propose against the withheld loft case; critic scores them cold.',
      1: 'Two children breed around the hidden friction: clearing junk before insulation can happen.',
      2: 'A single fused champion removes the practical blocker while preserving the financial case.',
    },
    individuals: {
      'g0-blindside': {
        title: 'The Clutter Is The Barrier',
        proposal:
          'Treat the loft contents, not insulation belief, as the blocker. The offer starts with a low-cost clearing slot: two workers box, label, and move stored items to a temporary ground-floor zone before the installer arrives.',
        verdict:
          'Strong hidden-constraint diagnosis. It explains why good economics failed: the household had to do an unpleasant preparatory job first.',
        rawResponse:
          '{"title":"The Clutter Is The Barrier","proposal":"Bundle a low-cost loft-clearing slot before installation.","whyThisFits":"The real failure is practical friction, not disbelief.","inheritedTrait":"find the blocker behind the stated objection"}',
        criticReasons: {
          grounding: 'Grounded in the case facts: financially sensible insulation still failed because the loft was full.',
          novelty: 'Shifts from persuasion/subsidy to removing the hidden household task.',
          feasibility: 'Uses simple labor and scheduling rather than new technology.',
          falsification: 'Fails if households refuse handling of stored possessions.',
          operationalFit: 'Crew-simple and easy to attach to an installation booking.',
        },
      },
      'g0-addition-by-subtraction': {
        title: 'Remove The Pre-Install Chore',
        proposal:
          'Delete the customer’s hardest step. The insulation appointment includes clearing, bagging, and returning loft items, so adoption no longer depends on the homeowner spending a weekend sorting a dusty storage space.',
        verdict:
          'Elegant subtraction move. It removes the labor burden that silently made the rational purchase feel impossible.',
        rawResponse:
          '{"title":"Remove The Pre-Install Chore","proposal":"Take the clearing chore out of the customer journey.","inheritedTrait":"remove the step that blocks action"}',
        criticReasons: {
          grounding: 'Matches the adoption failure: people wanted savings but avoided the loft task.',
          novelty: 'Less obvious than more information or bigger discounts.',
          feasibility: 'Requires labor coordination but no behavior-change miracle.',
          falsification: 'May not work where clutter is valuable, private, or unsafe to move.',
          operationalFit: 'Simple to explain at booking time.',
        },
      },
      'g0-breakthrough': {
        title: 'Insulation With Clearing Bundle',
        proposal:
          'Make the offer concrete: insulation plus a fixed-price loft-clearing add-on. The installer books clearing labor first, photographs the reset loft, then completes insulation once access is open.',
        verdict:
          'Strong accretive package. The clearing add-on turns a deferred sensible choice into a scheduled service.',
        rawResponse:
          '{"title":"Insulation With Clearing Bundle","proposal":"Sell insulation with a fixed-price clearing add-on.","inheritedTrait":"add the missing service layer"}',
        criticReasons: {
          grounding: 'Directly addresses the loft-access bottleneck.',
          novelty: 'The bundle reframes insulation as a done-for-you retrofit, not advice.',
          feasibility: 'Needs operational partners and liability handling.',
          falsification: 'Weak if clearing costs exceed perceived savings.',
          operationalFit: 'Works well as a menu option in an installer workflow.',
        },
      },
      'g0-first-principles': {
        title: 'Access Before Economics',
        proposal:
          'The protected outcome is not belief in insulation; it is a physically installable loft. A financially good offer still fails when the path to installation requires clearing storage, deciding what to keep, and tolerating mess.',
        verdict:
          'Cleanest framing of the real objective, but still needs a concrete service mechanism.',
        rawResponse:
          '{"title":"Access Before Economics","proposal":"The first requirement is installable access, not persuasion.","inheritedTrait":"optimize the physical path to action"}',
        criticReasons: {
          grounding: 'Anchors on the physical precondition for insulation.',
          novelty: 'Good first-principles reframe of a behavioral adoption problem.',
          feasibility: 'The principle is sound but incomplete without an execution path.',
          falsification: 'Does not yet distinguish clutter from other access blockers.',
          operationalFit: 'Useful aiming rule for the next generation.',
        },
      },
      'g1-masking-mist': {
        title: 'Clear-Then-Install Service',
        proposal:
          'Book a two-step service: clearing crew first, insulation crew second. The clearing team boxes and stages contents with a numbered photo record, leaving the loft install-ready without asking the homeowner to do the painful prep.',
        verdict:
          'The child combines hidden-blocker diagnosis with the missing service layer. Highest fitness so far.',
        rawResponse:
          '{"title":"Clear-Then-Install Service","proposal":"Clearing crew first, insulation crew second.","fusionLogic":"Blindside identifies clutter; breakthrough adds the bundled service.","inheritedTraits":["hidden constraint","done-for-you clearing","install-ready handoff"]}',
        criticReasons: {
          grounding: 'Every step follows from the loft-access blocker.',
          novelty: 'More specific than a generic concierge service.',
          feasibility: 'Two crews add coordination, but the handoff is clear.',
          falsification: 'Tests whether booked clearing increases completion rates.',
          operationalFit: 'Simple sequence: clear, inspect, insulate.',
        },
      },
      'g1-dark-asset': {
        title: 'No-Sort Clearing Slot',
        proposal:
          'Reduce the emotional burden by making the clearing slot no-sort by default: items are boxed, labeled by area, moved aside, and returned after insulation. The customer can sort later, but sorting is no longer a prerequisite.',
        verdict:
          'Inherits the subtraction move and first-principles access target, fixing the “I must decide what to do with everything” penalty.',
        rawResponse:
          '{"title":"No-Sort Clearing Slot","proposal":"Box and move items without requiring sorting first.","fusionLogic":"Subtraction removes the decision chore; first-principles aims at installable access.","inheritedTraits":["remove sorting","protect access","lower emotional friction"]}',
        criticReasons: {
          grounding: 'Matches the junk-filled loft blocker without overcomplicating the offer.',
          novelty: 'The no-sort rule is a useful hidden-friction reducer.',
          feasibility: 'Needs labeling discipline and customer consent.',
          falsification: 'Fails if customers distrust temporary handling.',
          operationalFit: 'Fast and easy to sell as part of booking.',
        },
      },
      'g1-blindside': {
        title: 'Standing Objection',
        proposal:
          'Carried forward as a falsifier: if the service makes people sort, decide, clean, or feel judged, the hidden friction returns. The population must keep the clearing offer low-shame and low-decision.',
        verdict: 'Kept as pressure, not a contender. Its objection protects the practical-friction insight.',
        rawResponse:
          '{"title":"Standing Objection","proposal":"If the service creates sorting or shame, adoption stalls again.","inheritedTrait":"do not reintroduce the hidden chore"}',
        criticReasons: {
          grounding: 'Grounded in the practical and emotional cost of clearing stored items.',
          novelty: 'Same objection as gen 0, so novelty decays.',
          feasibility: 'Not a plan; a critique.',
          falsification: 'Valuable because it names how the intervention can fail.',
          operationalFit: 'Keeps the service designed around household tolerance.',
        },
      },
      'g2-champion': {
        title: 'Low-Cost Loft Clearing Bundle',
        proposal:
          'The insulation offer includes a low-cost, no-sort clearing crew that boxes and labels loft contents, stages them safely, confirms install-ready access, and returns items after installation. The homeowner buys savings without first doing the dreaded loft job.',
        verdict:
          'Passes the held-out bar: identifies the hidden blocker, removes it with cheap labor, and preserves the original financial logic.',
        rawResponse:
          '{"title":"Low-Cost Loft Clearing Bundle","proposal":"No-sort clearing plus insulation installation in one scheduled bundle.","fusionLogic":"Clear-then-install supplies the mechanism; no-sort staging removes the emotional chore.","inheritedTraits":["hidden constraint","low-cost labor","install-ready access","no-sort customer journey"]}',
        criticReasons: {
          grounding: 'Directly matches the known solution pattern.',
          novelty: 'Classic hidden-constraint move, expressed as an operational offer.',
          feasibility: 'Labor, scheduling, and labeling are manageable.',
          falsification: 'Can be tested by completion rate lift versus insulation-only offers.',
          operationalFit: 'One booking, clear handoff, low shame, low effort.',
        },
      },
    },
    events: {
      0: [
        'Two highest-fitness seeds combine hidden-blocker diagnosis with the missing service layer.',
        'Subtraction move grounded by the first-principles access target.',
        'Kept as living critic evidence: do not reintroduce sorting or shame.',
        'Strong frame, weak service mechanism; its value was donated into g1-dark-asset.',
      ],
      1: [
        'Best clearing mechanism fused with the no-sort decision-friction reducer.',
        'Objection satisfied by no-sort staging and clear handoff, so pressure retires.',
      ],
      2: ['Promoted to the run artifact; the hidden constraint is removed before installation.'],
    },
  },
  'heinz-ketchup-authenticity': {
    title: 'Lineage over time — Heinz Ketchup Authenticity',
    generationSummaries: {
      0: 'Four mutagen agenomes propose against the withheld ketchup authenticity case; critic scores them cold.',
      1: 'Two children breed around visible trust cues and substitution friction.',
      2: 'A single fused champion makes authenticity inspectable at the table without heavy enforcement.',
    },
    individuals: {
      'g0-blindside': {
        title: 'Make Substitution Visible',
        proposal:
          'Do not try to police every kitchen. Make substitution easy for guests and staff to notice: a bottle shape, label mark, and fill-color cue that look wrong when refilled with off-brand ketchup.',
        verdict:
          'Strong hidden-incentive diagnosis. The problem is not taste alone; it is substitution that stays invisible.',
        rawResponse:
          '{"title":"Make Substitution Visible","proposal":"Use bottle and label cues that make off-brand refills obvious.","inheritedTrait":"surface the invisible failure"}',
        criticReasons: {
          grounding: 'Grounded in the brand-authenticity problem: restaurants may substitute while preserving appearance.',
          novelty: 'Moves from auditing kitchens to changing what the table reveals.',
          feasibility: 'Packaging changes are easier than constant enforcement.',
          falsification: 'Fails if counterfeiters can cheaply mimic the cue.',
          operationalFit: 'Works at the moment of use without staff training burden.',
        },
      },
      'g0-addition-by-subtraction': {
        title: 'Remove The Refill Ambiguity',
        proposal:
          'Remove the generic refill path. Use a service bottle that is difficult to refill cleanly without breaking a visible seal or misaligning the label, so the easiest path is serving the real product.',
        verdict:
          'Elegant subtraction move: it removes the invisible loophole rather than adding more inspections.',
        rawResponse:
          '{"title":"Remove The Refill Ambiguity","proposal":"Make generic refilling visibly awkward or seal-breaking.","inheritedTrait":"remove the loophole"}',
        criticReasons: {
          grounding: 'Targets the substitution pathway rather than customer belief.',
          novelty: 'Better than warning labels or periodic audits.',
          feasibility: 'Depends on packaging costs and restaurant compliance.',
          falsification: 'Can be bypassed by pouring into unbranded containers.',
          operationalFit: 'Simple if aligned with normal restaurant supply flow.',
        },
      },
      'g0-breakthrough': {
        title: 'Color-Match Table Cue',
        proposal:
          'Add a small printed red calibration swatch on the bottle label. Real Heinz ketchup visually matches the swatch under normal table lighting; common substitutes drift orange, brown, or watery red.',
        verdict:
          'Strong accretive addition. The calibration cue makes authenticity inspectable without asking guests to be experts.',
        rawResponse:
          '{"title":"Color-Match Table Cue","proposal":"Print a red calibration swatch so substitution becomes visible.","inheritedTrait":"add the inspection cue"}',
        criticReasons: {
          grounding: 'Fits the visible product and table-service context.',
          novelty: 'Borrowed from calibration and anti-counterfeit patterns.',
          feasibility: 'Cheap to print, harder to standardize under all lighting.',
          falsification: 'Weak if substitutes color-match closely.',
          operationalFit: 'No app, no training, no confrontation.',
        },
      },
      'g0-first-principles': {
        title: 'Trust Is The Asset',
        proposal:
          'The protected asset is not the bottle; it is the customer’s trust that Heinz is what is being served. The mechanism must make authenticity observable at the table, not hidden in procurement or back-of-house audits.',
        verdict:
          'Cleanest framing of the true asset, but thin on the concrete enforcement move.',
        rawResponse:
          '{"title":"Trust Is The Asset","proposal":"Protect visible authenticity at the table, not only supply-chain compliance.","inheritedTrait":"protect trust at the moment of use"}',
        criticReasons: {
          grounding: 'Correctly identifies the brand-trust failure.',
          novelty: 'Useful reframe of a packaging/authenticity problem.',
          feasibility: 'Needs a downstream mechanism.',
          falsification: 'Does not yet name its own bypass.',
          operationalFit: 'Good aiming rule for the next generation.',
        },
      },
      'g1-masking-mist': {
        title: 'Visible Authenticity Cue',
        proposal:
          'Combine the color swatch with bottle geometry that makes bad refills look visibly off: fill line, label window, and red-match cue all need to agree before the table signal reads authentic.',
        verdict:
          'The child combines visible detection with packaging friction. Highest fitness so far.',
        rawResponse:
          '{"title":"Visible Authenticity Cue","proposal":"Use fill line, label window, and red-match cue together.","fusionLogic":"Blindside surfaces substitution; breakthrough adds the calibration cue.","inheritedTraits":["visible failure","color swatch","table inspection"]}',
        criticReasons: {
          grounding: 'Every cue exists at the table where substitution matters.',
          novelty: 'A compact anti-counterfeit pattern for condiments.',
          feasibility: 'Packaging redesign is manageable but needs testing.',
          falsification: 'Can be tested against common substitute ketchups.',
          operationalFit: 'Works without confrontation or kitchen audits.',
        },
      },
      'g1-dark-asset': {
        title: 'Tamper-Evident Service Path',
        proposal:
          'The bottle is shipped and served through a path where refilling creates visible disorder: seal, label alignment, and neck insert are designed so off-brand refill attempts leave a table-visible cue.',
        verdict:
          'Inherits the subtraction instinct and trust target, fixing the ambiguous refill pathway.',
        rawResponse:
          '{"title":"Tamper-Evident Service Path","proposal":"Make refill attempts leave a visible seal or alignment cue.","fusionLogic":"Subtraction removes ambiguity; first-principles aims at table trust.","inheritedTraits":["remove refill ambiguity","protect trust","visible tamper cue"]}',
        criticReasons: {
          grounding: 'Targets how substitution can happen in restaurant service.',
          novelty: 'More concrete than brand-policing.',
          feasibility: 'Requires package design and supply-chain rollout.',
          falsification: 'Fails if restaurants discard the bottle.',
          operationalFit: 'Aligned with normal table service when bottles remain branded.',
        },
      },
      'g1-blindside': {
        title: 'Standing Objection',
        proposal:
          'Carried forward as a falsifier: if the cue can be ignored, hidden, or cheaply imitated, substitution remains invisible. The population must keep the signal hard to fake and easy to see.',
        verdict: 'Kept as pressure, not a contender. Its objection protects the authenticity insight.',
        rawResponse:
          '{"title":"Standing Objection","proposal":"If the cue is ignorable or easy to fake, substitution remains invisible.","inheritedTrait":"make the failure hard to hide"}',
        criticReasons: {
          grounding: 'Grounded in the incentive to substitute while preserving apparent brand value.',
          novelty: 'Same objection as gen 0, so novelty decays.',
          feasibility: 'Not a plan; a critique.',
          falsification: 'Names the bypass condition clearly.',
          operationalFit: 'Keeps the design table-visible and low-friction.',
        },
      },
      'g2-champion': {
        title: 'Tabletop Color-Match Cue',
        proposal:
          'Use a Heinz bottle with a label window, fill line, and deep-red calibration swatch. Real product visually aligns; common substitutes or watered-down refills look off. The table itself becomes the authenticity check.',
        verdict:
          'Passes the held-out bar: authenticity becomes visible at the moment of use without relying on constant audits or confrontation.',
        rawResponse:
          '{"title":"Tabletop Color-Match Cue","proposal":"Bottle window, fill line, and deep-red swatch make substitution visible at the table.","fusionLogic":"Visible cue supplies inspection; tamper-evident service path raises refill friction.","inheritedTraits":["table-visible trust","color calibration","refill friction","low-confrontation check"]}',
        criticReasons: {
          grounding: 'Directly matches the authenticity/substitution problem.',
          novelty: 'A concise transfer from calibration and anti-counterfeit design.',
          feasibility: 'Cheap enough to prototype with packaging tests.',
          falsification: 'Can be tested against common substitute/refill scenarios.',
          operationalFit: 'Passive, visible, and compatible with normal restaurant service.',
        },
      },
    },
    events: {
      0: [
        'Two highest-fitness seeds combine visible-substitution diagnosis with the calibration cue.',
        'Subtraction move grounded by the first-principles trust target.',
        'Kept as living critic evidence: the cue must be hard to ignore or fake.',
        'Strong frame, weak packaging mechanism; its value was donated into g1-dark-asset.',
      ],
      1: [
        'Best visible cue fused with the tamper-evident service path.',
        'Objection satisfied by multi-cue design and refill friction, so pressure retires.',
      ],
      2: ['Promoted to the run artifact; table-visible authenticity becomes the check.'],
    },
  },
};

function toneColor(tone) {
  return TONE_VARS[tone] || 'var(--cyan)';
}

function deltaText(value) {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

function promptForCase(basePrompt, selectedCase) {
  if (!selectedCase) return basePrompt;
  return basePrompt
    .replace('[full Jack superyacht drone-privacy case text]', `[${selectedCase.title} withheld-solution case packet]`)
    .replace('[full Jack superyacht drone-privacy case text]', `[${selectedCase.title} withheld-solution case packet]`);
}

function applyIndividualOverlay(individual, selectedCase, overlay) {
  const individualOverlay = overlay?.individuals?.[individual.id];
  const atoms = {
    ...individual.atoms,
    promptResponse: {
      ...individual.atoms.promptResponse,
      userPrompt: promptForCase(individual.atoms.promptResponse.userPrompt, selectedCase),
    },
  };

  if (!individualOverlay) return { ...individual, atoms };

  return {
    ...individual,
    title: individualOverlay.title,
    proposal: individualOverlay.proposal,
    verdict: individualOverlay.verdict,
    atoms: {
      ...atoms,
      promptResponse: {
        ...atoms.promptResponse,
        rawResponse: individualOverlay.rawResponse,
      },
      criticBreakdown: atoms.criticBreakdown.map((row) => ({
        ...row,
        reasoning: individualOverlay.criticReasons?.[row.dimension] || row.reasoning,
      })),
    },
  };
}

function applyGenerationOverlay(generation, selectedCase, overlay) {
  return {
    ...generation,
    summary: overlay?.generationSummaries?.[generation.index] || generation.summary,
    individuals: generation.individuals.map((individual) => applyIndividualOverlay(individual, selectedCase, overlay)),
    events: generation.events.map((event, index) => ({
      ...event,
      reason: overlay?.events?.[generation.index]?.[index] || event.reason,
    })),
  };
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
  const displayTrace = useMemo(() => {
    if (!selectedCase) return trace;
    const overlay = traceCaseOverlays[selectedCase.id];
    return {
        ...trace,
        title: overlay?.title || `Lineage over time — ${selectedCase.title}`,
        case: {
          ...trace.case,
          id: selectedCase.id,
          title: selectedCase.title,
          prompt: selectedCase.prompt,
        },
        generations: trace.generations.map((generation) => applyGenerationOverlay(generation, selectedCase, overlay)),
      };
  }, [trace, selectedCase]);
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
