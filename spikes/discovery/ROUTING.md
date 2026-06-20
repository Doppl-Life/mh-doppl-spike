# Task Routing — design note (spec, not built)

> **Status: spec for the TS rebuild.** Captured now so the cost idea isn't lost.
> The Python spike does *not* implement this beyond the recipe-level dispatch tier.

## The two "how" questions (keep them separate)

Every piece of work has two independent questions:

1. **How do I *reach* a source?** → the **source recipe** (`recipes.py`, built). About
   *access*: `hackernews → free API`, `reddit → browser`, `youtube → dispatch:gemini-cli`.
2. **Which engine should do a given *kind of thinking*, and what does it cost?** → the
   **task-routing table** (this note, not built). About *cognition*: which model/agent runs
   a task-type, and whether it's metered tokens or a flat-rate subscription seat.

A single source can need both — YouTube needs a recipe (pull the videos) **and** a routing
decision (Gemini digests the transcript). Mashing them together gets confusing; two small
tables stay clean.

## Why this saves money

Today every item costs metered OpenRouter tokens. But you already pay flat monthly for
Claude (Claude Code), likely Codex/ChatGPT, and Gemini. Those subscriptions include compute
you've *already bought*. Route the heavy/scheduled work through them instead of metered calls.

Two wins:

- **Scheduled dispatch** — run the harvest on a cadence via a subscription agent (Claude Code
  scheduled tasks, Codex automations, Gemini CLI cron) instead of you running `./demo` on
  tokens. *(The hourly schedule is the immediate, free version of this — already set up.)*
- **Tool-routing by cost** — send each task-type to the cheapest *capable* seat.

## The table (proposed shape)

```
task-type            cost profile     route
-----------------    -------------    ------------------------------------------
classify_subtype     tiny             metered small model (pennies; fine as-is)
lens_score           tiny             metered small model
problem_recovery     medium           metered mid model OR subscription if batched
digest_transcript    expensive        dispatch:gemini-cli   (flat-rate; YT-native)
deep_research        expensive        dispatch:claude-code  (flat-rate subscription)
```

The principle: **cheap, high-volume cognition stays metered** (it's pennies and simplest);
**expensive or scheduled cognition rides a subscription** you've already paid for.

## How it connects to what exists

- doppl-prime's **ModelGateway** already has this seam (`role → route`). The discovery engine
  wants the same: a `route` per task-type, where some routes are "metered API" and some are
  "shell out to a subscription CLI."
- The **recipe's `method` field** can already name an agent (`dispatch:gemini-cli`) — so for
  simple cases the recipe alone covers both access *and* cognition, and the full routing table
  only earns its keep when you want finer control (e.g. cheap model for scoring, subscription
  for Problem Recovery on the *same* item).

## Why it's deferred

Shelling out to Claude Code / Codex / Gemini CLI from inside the engine is a real integration
(subprocess orchestration, output parsing, auth, error handling) — cleaner to build once in
the TS rebuild than to bolt onto the spike. The `fetch.py` dispatch tier (`fetch_via_gemini`)
is the seam that proves the shape; the full table is the next layer up.
