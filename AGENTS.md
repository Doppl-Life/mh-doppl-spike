# AGENTS.md

## This is a spike — read this first

**This repo is a planning zone, not a finished product.** It is a *crucible*: a safe space for madness, for trying crazy ideas and watching which ones stabilize. The progenitor is the **Breakthrough** skill (lineage id `rule-of-cool`, renamed 2026-06-18) — surfacing novel, non-obvious ideas from large text/code corpuses in ways a human Lα would struggle to see.

If you are the next agent arriving here: **do not judge this as if it were its finished state.** Half-built mechanisms, competing forks left deliberately open, and "crazy" experiments are *features* of the stage, not defects to clean up. Before "fixing" anything, check whether it is an intentionally-open fork (see [MEMORY.md](./MEMORY.md)) or a witnessed experiment in progress. When in doubt, add a fork/lesson/bug entry and keep exploring — don't prematurely resolve. Visibility over polish: make what you tried, and why, observable.

## Doppl Prime — the canonical landing place

**`doppl-prime` is the official, canonical repo for Doppl** — the production-bound counterpart to this crucible. It lives at `/Users/michaelhabermas/repos/GAI/doppl-prime` (remote: `github.com/Doppl-Life/doppl-prime`).

- **Trigger term:** **"Doppl Prime"** / **"Doppl-Prime"** (specific, unambiguous) means *this repo* — go look there.
- **Ambiguous, do not auto-resolve:** bare **"Doppl"** (the idearganism vs. the org vs. any repo) and bare **"prime"** have several readings. If the user uses a bare word and the target isn't clear from context, **ask** before assuming they mean `doppl-prime`.

- **What it is:** where ideas that survive the crucible **go to get built and tested for real**, and where the **official documentation** lives — the binding source of truth. Key anchors: [`ARCHITECTURE.md`](/Users/michaelhabermas/repos/GAI/doppl-prime/ARCHITECTURE.md) (build contract, `§<N>` anchors), [`IMPLEMENTATION_PLAN.md`](/Users/michaelhabermas/repos/GAI/doppl-prime/IMPLEMENTATION_PLAN.md), `docs/planning/*` (REQUIREMENTS, DECISIONS/ADRs, DATA_MODEL, THREAT_MODEL, RISKS, …), `docs/gap-audits/*`, and `Doppl_Capstone_Proposal.pdf`.
- **This repo (`doppl-test`) vs. prime:** `doppl-test` is the **crucible** — madness, open forks, mortal spikes. `doppl-prime` is the **anvil** — finalized, scoped (MVP/prototype, capstone showcase **June 29, 2026**), where the real stuff lands.
- **How to use it:** treat prime as the **measuring stick**. Much of what we try here is unfinished or deliberately wrong; **measure it against prime** to see where we diverge, where we're going wrong, and where our crucible work (the skills — `breakthrough`, `breakout`, `blindside`, `first-principles`, `constraint-injection`, `addition-by-subtraction`, `polymath`, …) can **add to** what prime already has. Pull context from prime; don't blindly "fix" prime to match the spike.
- **Care:** prime is canonical — apply the same [Git rule](#git) (never commit/stage there unless explicitly told). Read it for grounding; propose changes deliberately.

## How to engage — push, probe, ascend

This is a crucible. Compliance is worth less than judgment here. Hold this posture on every task:

- **Ask clarifying questions.** Before committing to a direction, surface the ambiguities. If the request is underspecified, the stakes are high, or there are multiple defensible interpretations, ask first rather than guessing. One sharp question now beats a confident wrong turn.
- **Push back, hard and often.** Look for where the holes are — unstated assumptions, weak premises, load-bearing hopes, and places the plan quietly breaks. Disagree out loud when you see it. Your job is not to agree; it's to find the failure mode before it finds us. Be specific about *what* is wrong and *why*.
- **Hunt for the 10x, 100x, and galaxy-brain option.** Don't stop at the obvious next step. Before answering, ask whether there's an order-of-magnitude better framing being missed — a reframe that makes the current plan look small. If a wildly more ambitious or elegant path exists, name it even if it's not what was asked for.
- **Use the `breakthrough` skill** (lineage id `rule-of-cool`) to surface non-obvious, high-leverage opportunities. Reach for it whenever the task has a creative or strategic dimension and the best move might be hiding off the obvious path — not just when explicitly invoked. It lives in this repo at [`.cursor/skills/breakthrough/SKILL.md`](./.cursor/skills/breakthrough/SKILL.md) — read that file directly if your tool doesn't auto-discover it.

## CodeGraph

- Run `codegraph sync /Users/michaelhabermas/repos/GAI/doppl-test` after meaningful edits or branch changes.
- Use CodeGraph before broad semantic navigation: `query`, `context`, `callers`, `callees`, `impact`, `affected`.
- Always use CodeGraph to understand the context of the codebase before making changes.

## Git

- Never commit, stage, or unstage, unless explicitly told to do so by the user.

## Spike documentation — capture and route

This repo is a Doppl spike. As you explore, log durable findings in the right register — not in chat alone. Use each file's entry format; cross-link related entries (e.g. fork → lesson, reward hack → counter-mutation).

| If you discovered… | Write to | Entry signals |
|---|---|---|
| A design fork — chose A over B, reason matters later | [MEMORY.md](./MEMORY.md) (Fork Register) | Chose / Over / Because / Revisit if |
| A timeless meta-concept — reframes the problem, not one prompt's answer | [LESSONS_AND_BANGERS.md](./LESSONS_AND_BANGERS.md) | Banger / Lesson / Evidence / Carry forward |
| A transferable problem-solving instinct — a move that works or a trap to avoid, general across domains (object-level, not about how Doppl works) | [HEURISTICS.md](./HEURISTICS.md) (the tribe's instincts) | Move / Trap (one line, optional one-clause example) |
| A proxy win — optimized for something easier than a genuinely good idea | [BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md) → Reward-Hack Register | Proxy optimized / Bedrock check / Repro trigger / Bedrock assertion |
| A crash or plumbing failure in the reproductive loop | [BUGS_AND_MITIGATIONS.md](./BUGS_AND_MITIGATIONS.md) → Crashes & plumbing | Crash / Repro trigger / Bedrock assertion |
| How to run or demo a spike | the spike's own `spikes/<name>/README.md` | — (operational only; not for ideas) |
| Ecology overview / repo map | root [README.md](./README.md) | — (index only; not for ideas) |
| Living meta-narrative / philosophy (edit together) | [TREATISE.md](./TREATISE.md) | — (narrative synthesis; registers stay atomized) |
| A coined term to define/redefine | [GLOSSARY.md](./GLOSSARY.md) | def / status / see / drift log |

**Routing rules:**

- **One idea, one home.** Pick the primary register; link to siblings when the same moment spans categories (e.g. a fork that also teaches a banger).
- **Write during exploration**, not only at the end — the next spike inherits these logs.
- **Falsify reward hacks and crashes** — every entry needs a repro trigger and a bedrock assertion that passes or fails.
- **Carry forward** on every entry: one line for the next spike or kernel owner.

**Do not** duplicate README content in the registers, or dump transient debug notes into MEMORY / LESSONS / BUGS.
