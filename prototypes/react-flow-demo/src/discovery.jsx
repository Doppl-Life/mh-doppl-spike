import React, { useMemo, useState } from 'react';
import { Background, Controls, Handle, Position, ReactFlow } from '@xyflow/react';
import { discoveryData } from './discoveryData.js';

const scoreColor = (s) => (s >= 4 ? '#1b5e20' : s >= 1 ? '#8a6d00' : s === 0 ? '#30363d' : '#7d1a1a');
const scoreText = (s) => (s > 0 ? `+${s}` : `${s}`);
const subShort = { zeitgeist_synthesis: 'zeitgeist', cross_domain_transfer: 'transfer', neither: '—' };

/* ---------- pipeline nodes (xyflow) ---------- */
function PNode({ data }) {
  return (
    <div className={`disc-node ${data.cls || ''}`}>
      {data.src && <Handle type="target" position={Position.Left} />}
      <div className="disc-kicker">{data.kicker}</div>
      <div className="disc-title">{data.title}</div>
      {data.desc && <div className="disc-desc">{data.desc}</div>}
      {(data.tags || []).map((t, i) => (
        <span className="disc-tag" key={i}>{t}</span>
      ))}
      {data.tgt && <Handle type="source" position={Position.Right} />}
    </div>
  );
}
const nodeTypes = { p: PNode };
const N = (id, x, y, cls, kicker, title, desc, tags, src = true, tgt = true) => ({
  id, type: 'p', position: { x, y }, data: { cls, kicker, title, desc, tags, src, tgt },
});
const E = (s, t, anim = false) => ({ id: s + t, source: s, target: t, className: anim ? 'disc-anim' : '' });

const NODES = [
  N('src', -10, 150, 'io', '1 · inputs', 'Sources', '11 wells: YC RFS, HN, Lobsters, GitHub, arXiv, SEC EDGAR, Product Hunt, Trends, YouTube, Reddit, X', ['forward: live', 'back: corpus'], false, true),
  N('harvest', 250, 60, 'io', '2 · harvest', 'Normalize', 'Every source → one record {source, url, text, time}', ['one shape']),
  N('ladder', 250, 235, 'loop', 'access ladder', 'Fetch tiers', 'free → curl_cffi → Firecrawl → browser · dispatch→ Gemini (YT), Grok (X)', ['cheapest that works']),
  N('recover', 510, 40, 'brain', '3 · brain', 'Problem Recovery', 'Symptom → hidden variable → the actual problem', ['reframe']),
  N('classify', 510, 175, 'brain', '3 · brain', 'Subtype classify', '±5-year test → zeitgeist | transfer | neither', ['100% on corpus']),
  N('lens', 510, 310, 'brain', '3 · brain', 'Lens score', 'Swappable lens (default: capstone-demo-fit)', ['pluggable']),
  N('signed', 775, 110, 'io', '4 · score', 'Signed −5…+5', 'Quality vs harm. +good · 0 meh · −trap', ['traps flagged']),
  N('decay', 775, 270, 'loop', 'metabolism', 'Why-now decay', 'Zeitgeist fades fast; transfer is timeless. Refresh can lift it back', ['self-freshening']),
  N('feed', 1040, 20, 'out', '5 · output', 'Ranked feed', 'Open → Doppl · Resolved → benchmark', ['the deliverable']),
  N('registry', 1040, 150, 'ledger', 'ledger', 'Source registry', 'Scores the wells per lens; flags worth_unlocking', ['where to look']),
  N('traps', 1040, 270, 'ledger', 'ledger', 'Trap register', 'Actively-bad ideas + why (amemetics)', ['what to avoid']),
  N('recipes', 1040, 385, 'ledger', 'ledger', 'Recipes', 'How to reach each source; self-heals on break', ['how to access']),
  N('human', 1325, 75, 'loop', '6 · interaction', 'Promote / reject', 'Your real decisions = realized value', ['append-only']),
  N('calib', 1325, 215, 'loop', 'loop', 'Calibration', 'Predicted (lens) vs realized (promotion) gap', ['self-tuning']),
  N('reality', 1325, 345, 'loop', '7 · reality', 'Backtest', 'Was it right? +4/+5 came true 1.0 on resolved corpus', ['bedrock']),
];
const EDGES = [
  E('src', 'harvest', true), E('src', 'ladder'),
  E('harvest', 'recover', true), E('ladder', 'recover'),
  E('recover', 'classify'), E('classify', 'lens'),
  E('lens', 'signed', true), E('lens', 'decay'),
  E('signed', 'feed', true), E('signed', 'traps'), E('decay', 'feed'),
  E('feed', 'registry'), E('feed', 'recipes'), E('feed', 'human', true),
  E('human', 'calib'), E('calib', 'lens'), E('human', 'reality'), E('reality', 'feed'),
  E('registry', 'ladder'),
];

function PipelineView() {
  return (
    <div className="disc-flow">
      <ReactFlow
        nodes={NODES} edges={EDGES} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: 0.12 }} minZoom={0.3} maxZoom={1.5}
        nodesDraggable nodesConnectable={false} proOptions={{ hideAttribution: true }}
      >
        <Background color="#1c2530" gap={22} />
        <Controls showInteractive={false} />
      </ReactFlow>
      <div className="disc-legend">
        <b>Reading the map</b>
        <div className="row"><span className="sw" style={{ background: '#16202c', border: '1px solid #2b3b4d' }} />input / output</div>
        <div className="row"><span className="sw" style={{ background: '#1e1830', border: '1px solid #bc8cff' }} />the brain (LLM)</div>
        <div className="row"><span className="sw" style={{ background: '#15251a', border: '1px solid #2f6b3a' }} />ledger (memory)</div>
        <div className="row"><span className="sw" style={{ background: '#0f2429', border: '1px solid #56d4dd' }} />feedback loop</div>
      </div>
    </div>
  );
}

/* ---------- ideas view (interaction) ---------- */
function IdeasView() {
  const [statuses, setStatuses] = useState(() => ({ ...discoveryData.statuses }));
  const [filter, setFilter] = useState('all');
  const set = (id, st) => setStatuses((s) => ({ ...s, [id]: s[id] === st ? undefined : st }));
  const ideas = discoveryData.ideas;
  const counts = useMemo(() => {
    let p = 0, r = 0;
    Object.values(statuses).forEach((v) => { if (v === 'promoted') p++; if (v === 'rejected') r++; });
    return { p, r, total: ideas.length };
  }, [statuses, ideas]);
  const shown = ideas.filter((it) =>
    filter === 'all' ? true
    : filter === 'zeitgeist' ? it.subtype === 'zeitgeist_synthesis'
    : filter === 'transfer' ? it.subtype === 'cross_domain_transfer'
    : filter === 'promoted' ? statuses[it.id] === 'promoted' : true);

  return (
    <div className="disc-ideas">
      <div className="disc-stats">
        <div className="disc-stat"><div className="v">{counts.total}</div><div className="l">candidates</div></div>
        <div className="disc-stat"><div className="v" style={{ color: '#3fb950' }}>{counts.p}</div><div className="l">promoted → Doppl</div></div>
        <div className="disc-stat"><div className="v" style={{ color: '#f85149' }}>{counts.r}</div><div className="l">rejected</div></div>
        <div className="disc-stat"><div className="v" style={{ color: '#58a6ff' }}>demo-fit</div><div className="l">active lens</div></div>
      </div>
      <div className="disc-chips">
        {['all', 'zeitgeist', 'transfer', 'promoted'].map((f) => (
          <button key={f} className={`disc-chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All ideas' : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="disc-grid">
        {shown.map((it) => {
          const st = statuses[it.id];
          return (
            <div className={`disc-card ${st || ''}`} key={it.id}>
              <div className="disc-chead">
                <div className="disc-score" style={{ background: scoreColor(it.lens_score) }}>{scoreText(it.lens_score)}</div>
                <div>
                  <div className="disc-ctitle">{it.title}</div>
                  <div className="disc-pills">
                    <span className={`disc-pill ${it.subtype === 'zeitgeist_synthesis' ? 'z' : 't'}`}>{subShort[it.subtype]}</span>
                    <span className="disc-pill src">{it.source.replace('corpus:case-studies', 'corpus')}</span>
                    <span className="disc-pill">{it.disposition === 'open' ? '→ Doppl' : '→ keep'}</span>
                    {st && <span className="disc-pill" style={{ color: st === 'rejected' ? '#f85149' : '#3fb950' }}>{st}</span>}
                  </div>
                </div>
              </div>
              <div className="disc-why">{it.why_it_might_matter}</div>
              <div className="disc-pr">
                <div><b>hidden variable</b>{it.hidden_variable}</div>
                <div><b>actual problem</b>{it.actual_problem}</div>
              </div>
              <div className="disc-acts">
                <button className={`disc-btn promote ${st === 'promoted' ? 'active' : ''}`} onClick={() => set(it.id, 'promoted')}>▲ Promote</button>
                <button className={`disc-btn reject ${st === 'rejected' ? 'active' : ''}`} onClick={() => set(it.id, 'rejected')}>▼ Reject</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- sources view ---------- */
const LADDER = [
  ['1', 'Free (API / RSS / GET)', 'HN, Lobsters, arXiv, GitHub, YC, EDGAR — the cheap baseline', 'free', 'free'],
  ['2', 'curl_cffi — stealth GET', 'mimics Chrome TLS/JA3 to pass fingerprint walls, no browser', 'cheap', 'cheap'],
  ['3', 'Firecrawl', 'clean markdown per page (key) — the thin-headline fix', 'cheap', '~1cr/pg'],
  ['4', 'Browser (browser-use / Browserbase)', 'JS / auth / anti-bot — costly last resort', 'dear', '$$$'],
  ['→', 'Dispatch — hand to a native agent', 'Gemini for YouTube, Grok for X — flat-rate on a sub you already pay', 'free', 'sub'],
];
function SourcesView() {
  const { registry, recipes } = discoveryData;
  const maxAvg = Math.max(...registry.map((r) => r.avg || 0), 4);
  return (
    <div className="disc-two">
      <div>
        <h4 className="disc-sec">Source registry — score the wells, per lens</h4>
        <table className="disc-table">
          <thead><tr>{['Source', 'Lens', 'Vol', 'Avg score', 'Status'].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {registry.map((r, i) => (
              <tr key={i}>
                <td>{r.source}</td>
                <td style={{ color: '#6e7681' }}>{r.lens}</td>
                <td>{r.vol}</td>
                <td>{r.avg == null ? '—' : <div>{r.avg}<div className="disc-bar"><span style={{ width: `${100 * r.avg / maxAvg}%` }} /></div></div>}</td>
                <td className={`disc-s-${r.status}`}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="disc-note"><b>The registry learns where to look.</b> Each well is scored by the hit-rate of what it yields — and once you promote ideas, a <b>worth_unlocking</b> flag fires for a walled source that proves it pays (e.g. “X earned 1.0 promotion-rate → spend on Grok”). The budgeted-bandit, made real.</div>
      </div>
      <div>
        <h4 className="disc-sec">Access ladder — cheapest tool that works</h4>
        <div className="disc-ladder">
          {LADDER.map((r, i) => (
            <div className="disc-rung" key={i}>
              <div className="n">{r[0]}</div>
              <div><div className="lab">{r[1]}</div><div className="sub">{r[2]}</div></div>
              <div className={`disc-cost ${r[3]}`}>{r[4]}</div>
            </div>
          ))}
        </div>
        <h4 className="disc-sec" style={{ marginTop: 22 }}>Per-source recipe + connector backlog</h4>
        <table className="disc-table">
          <thead><tr>{['Source', 'Tier', 'Status', 'Connector?'].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {recipes.map((r, i) => (
              <tr key={i}>
                <td>{r.source}</td>
                <td style={{ color: '#56d4dd' }}>{r.tier}</td>
                <td className={`disc-s-${r.status}`}>{r.status}</td>
                <td style={{ color: '#8b949e', fontSize: '11.5px' }}>{r.mcp ? r.mcp.split(' —')[0].split(' (')[0] : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DiscoveryRadar() {
  const [view, setView] = useState('pipeline');
  const views = [['pipeline', 'How it works'], ['ideas', 'The ideas'], ['sources', 'Sources & access']];
  return (
    <section className="prototype disc-root">
      <div className="prototype-heading">
        <div>
          <p className="eyebrow">prototype · discovery radar (intake source)</p>
          <h2>The Pointing Finger</h2>
          <p>
            A scheduled radar that harvests live signal, recovers the real problem behind each item,
            and ranks candidates through a swappable lens. It <strong>points</strong> (“that might be
            an opportunity”); Doppl <strong>checks</strong> (“is it or isn’t it”); the expressions
            <strong> validate</strong>. Lives upstream of the suite — it feeds Case intake.
          </p>
        </div>
        <div className="case-card">
          <span>discovery spike · spikes/discovery</span>
          <strong>18 candidates · 11 sources · classifier 100% on corpus</strong>
          <p>Signed −5…+5 scoring · why-now decay · calibration + backtest loops. Data is real, from the spike ledgers.</p>
        </div>
      </div>

      <div className="disc-subtabs">
        {views.map(([k, label]) => (
          <button key={k} className={`disc-subtab ${view === k ? 'active' : ''}`} onClick={() => setView(k)}>{label}</button>
        ))}
      </div>

      {view === 'pipeline' && <PipelineView />}
      {view === 'ideas' && <IdeasView />}
      {view === 'sources' && <SourcesView />}
    </section>
  );
}
