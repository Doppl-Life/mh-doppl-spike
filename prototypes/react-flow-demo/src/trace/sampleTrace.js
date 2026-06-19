// Hand-shaped instance of the v1 run-trace schema (see ./schema.md).
// kind: 'lineage' — one population evolving over 3 generations on the Jack drone case.
// source: 'sample' — gen-0 reuses real model output from fusionRuns.generated.json;
// gen-1/gen-2 are illustrative evolved offspring. Replaced wholesale by the live
// generational runner in step 2, which emits this exact shape.

const scoreNames = ['grounding', 'novelty', 'feasibility', 'falsification', 'operationalFit'];

const casePrompt =
  'A high-profile person uses a superyacht as private space, but paparazzi drones can film ' +
  'from outside the vessel. Avoid jamming, avoid physical takedown, account for self-returning ' +
  'drones, preserve discretion, and keep the procedure crew-simple. The known evaluator target ' +
  'is withheld from the agents.';

const PARENT_SYSTEM =
  'You are running one Doppl agenome against a withheld-solution case. Produce a concise, ' +
  'concrete solution artifact. Return JSON only.';

const CHILD_SYSTEM =
  'You are running Doppl reproduction. Breed a child agenome from two scored parent artifacts. ' +
  'Produce the child artifact, not commentary. Return JSON only.';

function critic(values, reasons) {
  return scoreNames.map((dimension) => ({
    dimension,
    score: values[dimension],
    reasoning: reasons[dimension],
  }));
}

function parentPrompt(skillId, directive) {
  return (
    `CASE STUDY WITHOUT SOLUTION:\n[full Jack superyacht drone-privacy case text]\n\n` +
    `AGENOME SKILL:\n[.cursor/skills/${skillId}/SKILL.md]\n\n` +
    `PHENOTYPE REQUIREMENT:\n${directive}\n\n` +
    `Act only as the ${skillId} agenome. Generate the best solution this specific agenome would ` +
    `propose. Return JSON with keys: title, proposal, whyThisFits, tradeoffs, validationPlan, ` +
    `inheritedTrait. Keep proposal under 90 words.`
  );
}

function childPrompt(a, b, ratio) {
  return (
    `CASE STUDY WITHOUT SOLUTION:\n[full Jack superyacht drone-privacy case text]\n\n` +
    `PARENT A (${a}) inheritance share ${ratio.split(':')[0]}%\n` +
    `PARENT B (${b}) inheritance share ${ratio.split(':')[1]}%\n\n` +
    `Breed a child that uses the stronger parent's best traits more heavily while preserving the ` +
    `other parent's strongest blind-spot coverage. Return JSON with keys: title, proposal, ` +
    `fusionLogic, inheritedTraits (array of 3), tradeoffs, validationPlan.`
  );
}

// --- Generation 0: real seed population (text drawn from fusionRuns.generated.json) ---

const gen0 = {
  index: 0,
  label: 'Gen 0 — seed population',
  summary: 'Four mutagen agenomes each propose against the withheld case; critic scores them cold.',
  energy: { budget: 350, spent: 220, remaining: 130 },
  individuals: [
    {
      id: 'g0-blindside',
      skillId: 'blindside',
      label: 'blindside',
      title: 'Blindside',
      tone: 'pink',
      role: 'seed',
      proposal:
        "Instead of engaging the drone, the crew initiates a 'Visual Masking' protocol: instantly " +
        'deploying high-intensity, non-blinding infrared (IR) floodlights and rapid-deployment ' +
        "privacy screens around the deck. This saturates the drone's camera sensor with IR glare, " +
        'rendering footage useless while remaining invisible to the human eye and completely silent.',
      verdict:
        'Excellent non-kinetic solution. Correctly identifies privacy as the objective, not drone ' +
        'destruction, with passive, legal, discreet countermeasures.',
      metrics: { energy: 86, fitness: 91, novelty: 78 },
      scores: { grounding: 95, novelty: 90, feasibility: 85, falsification: 90, operationalFit: 95 },
      delta: null,
      atoms: {
        promptResponse: {
          systemPrompt: PARENT_SYSTEM,
          userPrompt: parentPrompt(
            'blindside',
            'Center the non-obvious failure mode and include the hardening move.',
          ),
          rawResponse:
            '{"title":"Visual Masking Protocol","proposal":"...IR floodlights + privacy screens ' +
            'saturate the sensor...","whyThisFits":"Treats privacy as a signal-to-noise problem, ' +
            'not a security threat.","inheritedTrait":"deny the visual data, ignore the device"}',
        },
        criticBreakdown: critic(
          { grounding: 95, novelty: 90, feasibility: 85, falsification: 90, operationalFit: 95 },
          {
            grounding: 'Relies only on plausible yacht systems (deck lighting, screens) and the case facts.',
            novelty: 'Reframes from defeating the drone to denying the data — well clear of generic anti-drone advice.',
            feasibility: 'Needs specific IR hardware and calibration, but no exotic active defense.',
            falsification: 'Names a real failure: high-end sensors with IR filters may be unaffected.',
            operationalFit: 'Silent, legal, no RF, crew-simple — fits discretion constraints tightly.',
          },
        ),
        inheritance: { ratio: null, logic: 'Pure seed — no parents.', parents: [] },
      },
    },
    {
      id: 'g0-addition-by-subtraction',
      skillId: 'addition-by-subtraction',
      label: 'addition-by-subtraction',
      title: 'Addition By Subtraction',
      tone: 'mint',
      role: 'seed',
      proposal:
        "When a drone is detected, trigger a 'Dark Ship' protocol: extinguish all exterior deck " +
        'lighting, retract sunshades, and shift guests to pre-designated interior safe zones with ' +
        "automated privacy glass. The drone operator is left with footage of an empty, dark vessel " +
        'with zero commercial value.',
      verdict:
        "Elegant non-kinetic solution that shifts the objective from defeating the drone to " +
        'devaluing the footage. Respects all legal and safety constraints.',
      metrics: { energy: 74, fitness: 88, novelty: 82 },
      scores: { grounding: 95, novelty: 90, feasibility: 85, falsification: 90, operationalFit: 85 },
      delta: null,
      atoms: {
        promptResponse: {
          systemPrompt: PARENT_SYSTEM,
          userPrompt: parentPrompt(
            'addition-by-subtraction',
            'Improve the situation by removing a tempting response, dependency, or step.',
          ),
          rawResponse:
            '{"title":"Dark Ship Protocol","proposal":"...remove the visual target rather than add ' +
            'a defensive system...","inheritedTrait":"remove the target, not add a defense"}',
        },
        criticBreakdown: critic(
          { grounding: 95, novelty: 90, feasibility: 85, falsification: 90, operationalFit: 85 },
          {
            grounding: 'Uses only existing yacht systems (lighting, shades, interior zones).',
            novelty: 'Subtraction framing is genuinely non-obvious vs. add-a-countermeasure reflex.',
            feasibility: 'Workable but depends on guest cooperation and pre-planning.',
            falsification: 'Honestly flags that exterior architecture stays visible even when dark.',
            operationalFit: 'Disruptive if triggered mid-event — small operational-fit penalty.',
          },
        ),
        inheritance: { ratio: null, logic: 'Pure seed — no parents.', parents: [] },
      },
    },
    {
      id: 'g0-breakthrough',
      skillId: 'breakthrough',
      label: 'breakthrough',
      title: 'Breakthrough',
      tone: 'gold',
      role: 'seed',
      proposal:
        "Deploy a rapid-response 'privacy screen' — high-intensity IR floodlights plus automated " +
        "mist/water-curtain systems triggered by detection sensors. The IR blinds the drone's " +
        'optics without affecting yacht electronics; the mist obscures deck activity, rendering ' +
        'footage useless without violating airspace or safety rules.',
      verdict:
        'Strong accretive addition: the mist layer is the one mechanism that makes the whole ' +
        'answer click and covers the IR-only failure mode.',
      metrics: { energy: 80, fitness: 90, novelty: 86 },
      scores: { grounding: 90, novelty: 92, feasibility: 84, falsification: 88, operationalFit: 90 },
      delta: null,
      atoms: {
        promptResponse: {
          systemPrompt: PARENT_SYSTEM,
          userPrompt: parentPrompt(
            'breakthrough',
            'Name the single best accretive addition that makes the solution click.',
          ),
          rawResponse:
            '{"title":"Privacy Screen","proposal":"...IR + mist curtain privacy barrier...",' +
            '"inheritedTrait":"add the mist layer that covers the IR blind spot"}',
        },
        criticBreakdown: critic(
          { grounding: 90, novelty: 92, feasibility: 84, falsification: 88, operationalFit: 90 },
          {
            grounding: 'Plausible marine systems; mist/water curtains exist on large vessels.',
            novelty: 'Stacking two denial layers is the obvious-in-retrospect move.',
            feasibility: 'Mist systems add plumbing/maintenance overhead.',
            falsification: 'Covers IR-only weakness but does not address thermal sensors.',
            operationalFit: 'Quiet and legal; mist may be visible as mild spectacle.',
          },
        ),
        inheritance: { ratio: null, logic: 'Pure seed — no parents.', parents: [] },
      },
    },
    {
      id: 'g0-first-principles',
      skillId: 'first-principles',
      label: 'first-principles',
      title: 'First Principles',
      tone: 'cyan',
      role: 'seed',
      proposal:
        'The drone is not the protected asset — the useful footage is. Reduce the problem to: ' +
        'prevent footage that has commercial value from ever existing. Everything else (jamming, ' +
        'takedown, detection theater) is inherited assumption. Act on the value of the image, not ' +
        'the presence of the device.',
      verdict:
        'Cleanest framing of the real objective, but thin on the concrete operational move — it ' +
        'sets the target the others should hit.',
      metrics: { energy: 68, fitness: 84, novelty: 72 },
      scores: { grounding: 92, novelty: 74, feasibility: 80, falsification: 82, operationalFit: 78 },
      delta: null,
      atoms: {
        promptResponse: {
          systemPrompt: PARENT_SYSTEM,
          userPrompt: parentPrompt(
            'first-principles',
            'Derive from irreducible truths; separate the real protected asset from inherited assumptions.',
          ),
          rawResponse:
            '{"title":"The Asset Is The Footage","proposal":"...prevent commercially-valuable ' +
            'footage from existing...","inheritedTrait":"protect the image, not the airspace"}',
        },
        criticBreakdown: critic(
          { grounding: 92, novelty: 74, feasibility: 80, falsification: 82, operationalFit: 78 },
          {
            grounding: 'Tightly anchored to the actual asset at stake.',
            novelty: 'The reframe is correct but increasingly common in the population.',
            feasibility: 'No concrete mechanism yet — feasibility is of a principle, not a plan.',
            falsification: 'Testable as a target, but does not name its own failure mode.',
            operationalFit: 'Needs a downstream agenome to make it crew-executable.',
          },
        ),
        inheritance: { ratio: null, logic: 'Pure seed — no parents.', parents: [] },
      },
    },
  ],
  events: [
    {
      type: 'breed',
      from: ['g0-blindside', 'g0-breakthrough'],
      to: 'g1-masking-mist',
      reason: 'Two highest-fitness seeds with complementary denial layers (IR + mist).',
    },
    {
      type: 'breed',
      from: ['g0-addition-by-subtraction', 'g0-first-principles'],
      to: 'g1-dark-asset',
      reason: 'Subtraction move grounded by the first-principles target.',
    },
    {
      type: 'survive',
      from: ['g0-blindside'],
      to: 'g1-blindside',
      reason: 'Kept as living critic evidence — its IR-failure flag must keep applying pressure.',
    },
    {
      type: 'cull',
      from: ['g0-first-principles'],
      to: null,
      reason: 'Strong frame, weak operational fit; its value was donated into g1-dark-asset, not carried whole.',
    },
  ],
};

// --- Generation 1: bred children + one survivor ---

const gen1 = {
  index: 1,
  label: 'Gen 1 — first crossbreed',
  summary: 'Two children bred on blind spots; the blindside seed survives to keep applying pressure.',
  energy: { budget: 300, spent: 196, remaining: 104 },
  individuals: [
    {
      id: 'g1-masking-mist',
      skillId: 'blindside x breakthrough',
      label: 'blindside × breakthrough',
      title: 'Layered Denial',
      tone: 'gold',
      role: 'child',
      proposal:
        'Detection triggers a two-stage denial: instantly fire silent IR saturation, then raise a ' +
        'fine mist curtain only over occupied deck zones. The IR handles standard CMOS sensors; the ' +
        'mist defeats the IR-filtered and thermal cameras the blindside critic flagged. Crew touches ' +
        'one control; no device is engaged.',
      verdict:
        'The child closes its strongest parent blind spot (IR-immune sensors) by inheriting the ' +
        "breakthrough mist layer. Highest fitness so far.",
      metrics: { energy: 92, fitness: 94, novelty: 84 },
      scores: { grounding: 93, novelty: 89, feasibility: 86, falsification: 93, operationalFit: 94 },
      delta: { energy: 9, fitness: 3, novelty: -2 },
      atoms: {
        promptResponse: {
          systemPrompt: CHILD_SYSTEM,
          userPrompt: childPrompt('blindside', 'breakthrough', '54:46'),
          rawResponse:
            '{"title":"Layered Denial","proposal":"...two-stage IR then targeted mist...",' +
            '"fusionLogic":"Blindside contributes the failure-mode map; breakthrough contributes ' +
            'the mist layer that covers it.","inheritedTraits":["deny data not device","mist covers ' +
            'IR blind spot","one-control crew action"]}',
        },
        criticBreakdown: critic(
          { grounding: 93, novelty: 89, feasibility: 86, falsification: 93, operationalFit: 94 },
          {
            grounding: 'Both layers map to real marine hardware.',
            novelty: 'Slightly less novel than parents individually — it is a synthesis, not a new frame.',
            feasibility: 'Two systems to maintain, but each is independently proven.',
            falsification: 'Now explicitly answers the thermal/IR-filter failure mode. Falsification jumps.',
            operationalFit: 'Single-control activation keeps it crew-simple despite two subsystems.',
          },
        ),
        inheritance: {
          ratio: '54:46',
          logic:
            'Blindside (higher fitness) leads on the failure-mode map; breakthrough donates the ' +
            'mist layer that neutralizes blindside\'s own flagged weakness.',
          parents: [
            { id: 'g0-blindside', share: 54, traitsTaken: ['deny the visual data', 'IR saturation', 'silent operation'] },
            { id: 'g0-breakthrough', share: 46, traitsTaken: ['mist curtain layer', 'covers IR blind spot'] },
          ],
        },
      },
    },
    {
      id: 'g1-dark-asset',
      skillId: 'addition-by-subtraction x first-principles',
      label: 'addition-by-subtraction × first-principles',
      title: 'Targeted Dark Ship',
      tone: 'mint',
      role: 'child',
      proposal:
        'Reframed by the first-principles target (protect the image), the Dark Ship move is made ' +
        'surgical: only the occupied deck zone goes dark and screens, not the whole vessel — so a ' +
        'social event continues elsewhere. Removes the disruption tradeoff that hurt the pure ' +
        'subtraction parent.',
      verdict:
        'Inherits the subtraction instinct but spends the first-principles target to fix the ' +
        '"whole ship goes dark mid-dinner" operational penalty.',
      metrics: { energy: 79, fitness: 88, novelty: 80 },
      scores: { grounding: 94, novelty: 82, feasibility: 88, falsification: 86, operationalFit: 90 },
      delta: { energy: 5, fitness: 0, novelty: -2 },
      atoms: {
        promptResponse: {
          systemPrompt: CHILD_SYSTEM,
          userPrompt: childPrompt('addition-by-subtraction', 'first-principles', '52:48'),
          rawResponse:
            '{"title":"Targeted Dark Ship","proposal":"...zone-scoped darkening driven by the ' +
            'footage-value target...","fusionLogic":"Subtraction supplies the move; first-principles ' +
            'supplies the aiming rule (only where footage has value).","inheritedTraits":["remove the ' +
            'target","protect the image not the airspace","zone-scoped to cut disruption"]}',
        },
        criticBreakdown: critic(
          { grounding: 94, novelty: 82, feasibility: 88, falsification: 86, operationalFit: 90 },
          {
            grounding: 'Zone-scoping is realistic with existing deck lighting controls.',
            novelty: 'Recombination of two known moves; modest novelty.',
            feasibility: 'Easier than the whole-ship version — fewer guests disrupted.',
            falsification: 'Still exposed if the valuable subject is in the unscoped zone.',
            operationalFit: 'Big operational-fit gain by not blacking out the whole vessel.',
          },
        ),
        inheritance: {
          ratio: '52:48',
          logic:
            'Addition-by-subtraction leads with the deletion move; first-principles donates the ' +
            'aiming rule that decides which zone to delete.',
          parents: [
            { id: 'g0-addition-by-subtraction', share: 52, traitsTaken: ['remove the target', 'no active defense'] },
            { id: 'g0-first-principles', share: 48, traitsTaken: ['protect the image', 'act on footage value'] },
          ],
        },
      },
    },
    {
      id: 'g1-blindside',
      skillId: 'blindside',
      label: 'blindside (survivor)',
      title: 'Blindside',
      tone: 'pink',
      role: 'survivor',
      proposal:
        'Carried forward unchanged as living critic pressure: "if the response is detectable, ' +
        'paparazzi learn the cue and wait for the gap." Its job this generation is to keep ' +
        'stress-testing the children, not to win.',
      verdict: 'Kept as a falsifier, not a contender — its standing objection is the selection pressure.',
      metrics: { energy: 60, fitness: 85, novelty: 70 },
      scores: { grounding: 90, novelty: 78, feasibility: 84, falsification: 95, operationalFit: 86 },
      delta: { energy: -26, fitness: -6, novelty: -8 },
      atoms: {
        promptResponse: {
          systemPrompt: PARENT_SYSTEM,
          userPrompt: parentPrompt('blindside', 'Apply your standing failure-mode objection to this generation.'),
          rawResponse:
            '{"title":"Standing Objection","proposal":"...detectable responses train the adversary...",' +
            '"inheritedTrait":"the cue itself is the leak"}',
        },
        criticBreakdown: critic(
          { grounding: 90, novelty: 78, feasibility: 84, falsification: 95, operationalFit: 86 },
          {
            grounding: 'Objection is grounded in adversary learning behavior.',
            novelty: 'Same idea as gen 0 — novelty decays when carried unchanged.',
            feasibility: 'Not a plan; a critique.',
            falsification: 'Its entire value is falsification pressure — peak score.',
            operationalFit: 'Reminds the population to keep cues below the adversary detection threshold.',
          },
        ),
        inheritance: { ratio: null, logic: 'Survivor — carried unchanged, no breeding this gen.', parents: [] },
      },
    },
  ],
  events: [
    {
      type: 'fuse',
      from: ['g1-masking-mist', 'g1-dark-asset'],
      to: 'g2-champion',
      reason: 'Best denial mechanism fused with the disruption-free aiming rule.',
    },
    {
      type: 'cull',
      from: ['g1-blindside'],
      to: null,
      reason: 'Objection satisfied by g1-masking-mist (thermal covered) and zone-scoping — pressure retired.',
    },
  ],
};

// --- Generation 2: champion ---

const gen2 = {
  index: 2,
  label: 'Gen 2 — champion',
  summary: 'A single fused champion that denies data, aims only where footage has value, and stays silent.',
  energy: { budget: 260, spent: 120, remaining: 140 },
  individuals: [
    {
      id: 'g2-champion',
      skillId: 'layered-denial x targeted-dark-ship',
      label: 'fused champion',
      title: 'Silent Zone Denial',
      tone: 'child',
      role: 'child',
      proposal:
        'On detection, the system silently identifies the occupied, camera-valuable zone and, in ' +
        'that zone only, fires IR saturation plus a fine mist curtain while dimming deck lighting. ' +
        'No device is engaged, no RF is emitted, the rest of the vessel carries on, and the drone ' +
        'leaves with footage that has no commercial or social value. One crew control, rehearsable.',
      verdict:
        'Passes the held-out bar: denies useful footage before it exists, covers the IR/thermal and ' +
        'whole-ship-disruption failure modes, and stays legal, silent, and crew-simple.',
      metrics: { energy: 96, fitness: 96, novelty: 85 },
      scores: { grounding: 95, novelty: 88, feasibility: 90, falsification: 95, operationalFit: 96 },
      delta: { energy: 4, fitness: 2, novelty: 1 },
      atoms: {
        promptResponse: {
          systemPrompt: CHILD_SYSTEM,
          userPrompt: childPrompt('layered-denial', 'targeted-dark-ship', '57:43'),
          rawResponse:
            '{"title":"Silent Zone Denial","proposal":"...zone-scoped IR+mist+dimming on detection...",' +
            '"fusionLogic":"Layered denial supplies the mechanism; targeted dark ship supplies the ' +
            'aiming rule so only the valuable zone is treated.","inheritedTraits":["deny data not ' +
            'device","aim by footage value","one-control crew action","no whole-ship disruption"]}',
        },
        criticBreakdown: critic(
          { grounding: 95, novelty: 88, feasibility: 90, falsification: 95, operationalFit: 96 },
          {
            grounding: 'Every component traces to an established marine system.',
            novelty: 'Not a new frame, but the tightest expression of the denial-by-value idea.',
            feasibility: 'Two subsystems, but zone-scoping limits cost and maintenance.',
            falsification: 'Both inherited failure modes (IR-immune sensors, whole-ship disruption) are closed.',
            operationalFit: 'One control, rehearsable, silent, legal — best operational fit in the run.',
          },
        ),
        inheritance: {
          ratio: '57:43',
          logic:
            'Layered Denial (higher fitness) carries the mechanism; Targeted Dark Ship donates the ' +
            'aiming rule that keeps the rest of the vessel undisturbed.',
          parents: [
            { id: 'g1-masking-mist', share: 57, traitsTaken: ['two-stage IR + mist', 'one-control action'] },
            { id: 'g1-dark-asset', share: 43, traitsTaken: ['zone-scoping', 'protect the image'] },
          ],
        },
      },
    },
  ],
  events: [
    {
      type: 'survive',
      from: ['g2-champion'],
      to: null,
      reason: 'Promoted to the run artifact; collapses into a lesson + candidate agenome patch.',
    },
  ],
};

export const sampleTrace = {
  schemaVersion: 1,
  kind: 'lineage',
  id: 'lineage-jack-drone-sample',
  title: 'Lineage over time — Jack drone privacy',
  source: 'sample',
  generatedAt: '2026-06-18T21:30:00.000Z',
  case: {
    id: 'jack-superyacht-drone-privacy-withheld-solution',
    title: 'Jack Superyacht Drone Privacy',
    prompt: casePrompt,
  },
  models: { generation: 'google/gemini-3.1-flash-lite', critic: 'google/gemini-3.1-flash-lite' },
  scoreNames,
  generations: [gen0, gen1, gen2],
};

export const sampleTraceScoreNames = scoreNames;
