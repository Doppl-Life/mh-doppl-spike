# ts-modules — the promotion shelf

This folder is the **graduation target** of the crucible. Everything else in this
repo is a spike: half-built, deliberately mad, allowed to die. A piece earns its
way *here* only once it has stopped being an experiment and become a **part** —
self-contained, portable, and rewritten in **TypeScript** so it can be lifted
straight into another project (or the final product) with a copy, not a rescue.

> The rest of the repo optimizes for **visibility over polish**. This folder is
> the one place that inverts that: **polish over visibility.** If it lives here,
> it is supposed to *just work* somewhere else.

The crucible is mostly Python (`agora/`, `bedrock/`, `spikes/`). That's fine —
Python is the language of fast, throwaway exploration here. But the moment we say
*"okay, that one's real, bring it over,"* it gets ported to TypeScript and lands
here. **TS is the language of the keep.**

## What counts as "ready" (the promotion gate)

A folder is allowed in `ts-modules/` only if **all** of these hold. If any fail,
it stays a spike.

1. **Zero crucible imports.** No `import`/reference back into `spikes/`, `agora/`,
   `bedrock/`, etc. It depends only on its own code and declared third-party deps.
   The test: you could `cp -r` this folder into a blank repo and it still makes sense.
2. **Typed public API.** A clear, exported surface (`index.ts`). Consumers should
   never need to read the internals to use it.
3. **Its own README.** What it is, the interface, how to use it, and a lexicon stub
   if it carries domain terms (so it isn't "semantically naked" elsewhere — see how
   [`agora/README.md`](../agora/README.md) ships its own glossary).
4. **No hard runtime dependency.** No assumed running server, DB, or API key baked
   in. Pure logic, or I/O that is *injected* (pass in the store / fetcher / clock).
5. **Tests encouraged.** Not a hard gate yet, but a promoted part with no tests is
   on thin ice.

> These five are the **recommended defaults** chosen for this spike. They're cheap
> to relax later (loosen #4, add a workspace, etc.) — they're written down so the
> next agent inherits a clear bar instead of guessing.

## Layout & conventions

Each promoted thing is **its own folder** — a package, even if we haven't wired up
workspace tooling yet (the folder is empty today; tooling gets added on the first
real promotion, not speculatively).

```
ts-modules/
  README.md                 ← you are here (the shelf's contract)
  <module-name>/
    README.md               ← what it is + interface + lexicon stub
    src/
      index.ts              ← the public API (the only thing consumers import)
      ...
    package.json            ← name, version, exports  (added on promotion)
    tsconfig.json           ← extends a shared base    (added on promotion)
    test/ or *.test.ts
```

Conventions:

- **Folder name = module name**, kebab-case (`verdict-bus`, `run-trace`).
- **`src/index.ts` is the boundary.** Everything public is re-exported there.
- **Internal-portable, not yet npm-published.** Design clean exports, but don't
  pay the semver/scope/publish tax until we actually publish. (Easy to add later.)
- **Pure where possible; inject I/O where not.** A clock, a store, a `fetch` — take
  them as arguments so the module stays testable and runtime-free.

## Porting from Python (the keep ritual)

When a Python module graduates:

- **TypeScript becomes canonical.** The new TS module here is the source of truth
  going forward.
- **The Python original stays frozen** in the crucible as a reference spike — we
  don't delete the lineage, we just stop evolving it. (If we ever *do* retire one,
  note it in [`MEMORY.md`](../MEMORY.md) as a fork.)
- **Keep the contract, not the plumbing.** Port the *schema and the logic* (the
  valuable, portable core). Don't slavishly transliterate Python stdlib HTTP
  servers or file-watching loops — re-express those idiomatically in TS, or leave
  them behind as runtime concerns.
- **Record the move** in the port map below so the py↔ts relationship is legible.

### Port map

| TS module (here) | Ported from | Status |
| --- | --- | --- |
| _(none yet)_ | — | shelf is empty; first promotion pending |

## Promotion checklist (copy when graduating a piece)

```
- [ ] Identified the portable CORE (contract/logic), separated from runtime plumbing
- [ ] New folder ts-modules/<name>/ with src/index.ts as the public API
- [ ] Rewritten in TypeScript, typed surface, no crucible imports
- [ ] I/O injected (no baked-in server/DB/key)
- [ ] Own README.md (+ lexicon stub if it carries domain terms)
- [ ] Tests (or an explicit note on why not yet)
- [ ] Port map row added above; Python original marked "frozen reference"
```

## Candidates (NOT yet promoted — this is the exploration backlog)

Things in the crucible that *look* modularizable, pending a closer look. Listed so
the "what can we bring over?" exploration has a home. Inclusion here is a hypothesis,
not a promise.

| Candidate | Where it lives now | Why it might graduate | The catch |
| --- | --- | --- | --- |
| **Verdict / run-trace schema** | `prototypes/react-flow-demo/src/trace/schema.md` | Already spec'd in TS; pure data contract; viewer-agnostic | Mostly types already — promotion is formalizing, not porting |
| **Agora verdict bus (schema + agreement)** | `agora/schema.py`, `agora/agreement.py` | Self-contained, stdlib-only by design; the *contract* is the valuable part | `server.py`/`watcher.py` are runtime plumbing — leave behind or re-express |
| **Append-only ledger** | `agora/ledger.py` | Tiny, generic JSONL append + upsert-by-id; no domain coupling | I/O must be injected (path/store) to satisfy the gate |
| **Bedrock signal checks** | `bedrock/signal/` | An "immovable anchor" of checks — naturally reusable | Confirm it's logic, not a harness, before lifting |

> Add a row when you spot another candidate. Move it into the port map (above) only
> once it actually clears the gate.
