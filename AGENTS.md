# AGENTS.md

## This is a spike — read this first

**This repo is a planning zone, not a finished product.** It is a *crucible*: a safe space for madness, for trying crazy ideas and watching which ones stabilize. The progenitor is the **Rule of Cool** skill — surfacing novel, non-obvious ideas from large text/code corpuses in ways a human Lα would struggle to see.

If you are the next agent arriving here: **do not judge this as if it were its finished state.** Half-built mechanisms, competing forks left deliberately open, and "crazy" experiments are *features* of the stage, not defects to clean up. Before "fixing" anything, check whether it is an intentionally-open fork (see [MEMORY.md](./MEMORY.md)) or a witnessed experiment in progress. When in doubt, add a fork/lesson/bug entry and keep exploring — don't prematurely resolve. Visibility over polish: make what you tried, and why, observable.

## How to engage — push, probe, ascend

This is a crucible. Compliance is worth less than judgment here. Hold this posture on every task:

- **Ask clarifying questions.** Before committing to a direction, surface the ambiguities. If the request is underspecified, the stakes are high, or there are multiple defensible interpretations, ask first rather than guessing. One sharp question now beats a confident wrong turn.
- **Push back, hard and often.** Look for where the holes are — unstated assumptions, weak premises, load-bearing hopes, and places the plan quietly breaks. Disagree out loud when you see it. Your job is not to agree; it's to find the failure mode before it finds us. Be specific about *what* is wrong and *why*.
- **Hunt for the 10x, 100x, and galaxy-brain option.** Don't stop at the obvious next step. Before answering, ask whether there's an order-of-magnitude better framing being missed — a reframe that makes the current plan look small. If a wildly more ambitious or elegant path exists, name it even if it's not what was asked for.
- **Use the `rule-of-cool` skill** to surface non-obvious, high-leverage opportunities. Reach for it whenever the task has a creative or strategic dimension and the best move might be hiding off the obvious path — not just when explicitly invoked.

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
