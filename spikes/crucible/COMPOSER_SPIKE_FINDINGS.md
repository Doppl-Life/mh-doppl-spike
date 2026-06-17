# Composer-as-Fusant/Judge spike — findings

**VERDICT: VALID.** The local `cursor-agent` CLI (Composer 2.5) wires in cleanly as
an opt-in, per-role backend for the crucible — works as the held-out judge and as a
debater (Fusant). It returns parseable JSON for structured roles and runs entirely
off the logged-in Cursor session. The only real cost is latency (~8–16s/call) and the
loss of the temperature/disagreeableness dial.

## Non-interactive invocation (the exact command)

```bash
cursor-agent -p --trust --output-format text --mode ask --model composer-2.5 "<PROMPT>"
```

- `-p / --print` → non-interactive, prints the completion to stdout. Required for scripting.
- `--trust` → bypasses the "Workspace Trust Required" gate; **without it the call exits 1**
  in headless mode (it refuses to run untrusted dirs non-interactively).
- `--output-format text` → stdout is just the assistant's final text (clean to capture).
  `json` / `stream-json` also exist if richer metadata is ever needed.
- `--mode ask` → read-only Q&A. Deliberately chosen so Composer can't run shell/write
  tools as a side effect of being "just a chat model" for us.
- `--model composer-2.5` → confirmed present in `cursor-agent --list-models`
  (`composer-2.5`, and a `composer-2.5-fast`).
- There is **no system-prompt flag and no `messages` array** — the CLI takes a single
  prompt string. The adapter flattens the crucible's `[{role, content}]` into one labelled
  prompt (`[SYSTEM]\n…\n\n[USER]\n…`).
- Auth: already logged in (`cursor-agent status` → `techdeca4@gmail.com`). No API key
  needed; it uses the Cursor session, **not** `OPENROUTER_API_KEY`.

## JSON reliability for structured roles

Reliable in every observed run. Composer returns valid JSON for the judge contract and
the finals/revision-ledger contract. It **wraps output in a ` ```json ` fence**, but the
crucible's existing `parse_json_response()` already strips fences before `json.loads`, so
no parse errors occurred (no `parse_error` / `raw_output` fallbacks fired).

- Judge run (real debate input): clean JSON matching the full `JUDGE_SYSTEM` schema —
  `surviving_idea`, `consensus_quality`, `best_revision`, `performative_flips`,
  `unresolved_tension[]`, `score`, `verdict`. Quality was notably high: it correctly
  flagged Feasibility Hawk's pivot as a *performative flip* and named real unresolved
  tensions (CO2 vs. acoustic, unevidenced user motivation).
- Fusant finals: valid `final_position` + `revision_ledger`, no parse errors.

### Latency observed (wall clock per `cursor-agent` call)

| Call | Latency |
|---|---|
| Trivial JSON echo | ~21s (first/cold) |
| Judge over a short debate | 8.5s – 15.7s |
| Fusant opening / turn / finals | 11.3s / 12.2s / 10.0s |

End-to-end `--turns 1 --no-spawner --debaters 2 --composer-judge` run: **~24s total**.
The composer subprocess calls still run inside the existing `ThreadPoolExecutor`, so
multiple Composer debaters parallelize across threads — but each individual call is slow
and there's no streaming benefit in `text` mode.

## Minimal approach (file + functions)

All changes in **`spikes/crucible/crucible.py`** (HTTP path untouched for every other model):

1. **`composer_chat(*, model, messages, temperature)`** — new adapter. Flattens messages
   to one prompt, shells out via `subprocess.run([...], capture_output=True, timeout=300)`,
   prints a visible trace (route line, latency, char count, raw output panel), returns stdout.
   Strips the `cursor/` prefix to get the CLI model id; resolves the binary via
   `shutil.which("cursor-agent")` with a `~/.local/bin/cursor-agent` fallback.
2. **`chat()`** — one guard at the top: `if model.startswith(COMPOSER_PREFIX): return
   composer_chat(...)`. This sits *before* `_BACKEND.model_override`, so Composer routing is
   per-role and is **not** collapsed by `--local` (the known `--local` diversity bug).
3. **Model tag**: `COMPOSER_PREFIX = "cursor/"`, `DEFAULT_COMPOSER_MODEL = "composer-2.5"`.
   Any role whose model id is `cursor/<model>` routes through the CLI.
4. **Flags** (default behavior unchanged):
   - `--composer-judge` → sets `JUDGE_MODEL = "cursor/composer-2.5"`.
   - `--composer-fusant` → injects ONE Composer debater (`run_crucible` rewrites
     `debaters[0].model`); the rest of the roster is untouched.
   - `--composer-model <id>` → override which Composer model id is used.

Observability: every Composer call prints `→ Composer routing via cursor-agent CLI …`,
the elapsed seconds, and a `composer raw` panel of the exact stdout — the trace is witnessable.

## Risks / gotchas

- **No temperature control.** The CLI has no temp knob, so the crucible's
  disagreeableness→temperature dial is silently ignored for Composer roles (we log this).
  Composer's divergence comes only from the persona/dissent text in the prompt.
- **Workspace trust + sandbox.** Needs `--trust` headlessly. Under a restrictive sandbox it
  fails with `EPERM: mkdir '…/.cursor/projects/…'` — it must be allowed to write to
  `~/.cursor`. Fine in a normal shell; relevant if the crucible itself is sandboxed.
- **Auth / cost / rate.** Calls consume the Cursor account's quota (subscription/usage),
  not OpenRouter credits. Rate limits and cost are governed by the Cursor plan, and a
  logged-out session breaks the backend silently (exit 1). No per-call cost visibility.
- **Recursion.** Calling `cursor-agent` from inside an agent worked (separate process,
  `--mode ask` prevents nested tool/shell/write actions). Avoid non-`ask` modes here or a
  Composer "debater" could start editing files.
- **Latency & no timeout-awareness in roster sizing.** A premium-style room with several
  Composer debaters over multiple turns would be minutes long; the 300s per-call timeout is
  a blunt guard.
- **Determinism / parsing.** Relies on fenced-JSON stripping; a future Composer that emits
  prose-then-JSON or tool-call chatter would need a more robust extractor than
  `parse_json_response()`.

## Recommendation: best role = **held-out JUDGE**

Use Composer as the **judge** first. Reasons:
- The judge is a **single call per run**, so the 8–16s latency is paid once, not N×turns×debaters.
- The judge is exactly the role that demands strict JSON and careful whole-transcript
  reasoning — Composer was strongest here (caught the performative flip, surfaced genuine
  unresolved tensions, scored conservatively per the rubric).
- It's a true **cross-lab held-out judge**: a different lab/model from the OpenRouter
  debaters, which is the property the crucible wants from its judge.

Use `--composer-fusant` opportunistically for cross-lab *variety in the room* (it works and
returns valid finals JSON), but it multiplies the latency cost by every opening/turn/finals
call, so it's better suited to deliberate, low-debater foundational runs than everyday spikes.

### What a clean (non-prototype) implementation would add
- A small `Backend`-like abstraction so a role maps to {http | composer} explicitly, instead
  of a string-prefix sniff in `chat()`.
- Health check at startup (`cursor-agent status`) when any `--composer-*` flag is set, with a
  clear error if logged out.
- Map disagreeableness to a prompt-level instruction (since temp is unavailable), and consider
  `--output-format json` for structured roles to get model/usage metadata into the trace.
- Cache/timeout/retry policy and surfaced cost, since calls hit a metered Cursor account.

## Repro

```bash
# Judge (validated end-to-end; needs OPENROUTER_API_KEY for the 2 cheap debaters):
cd spikes/crucible
python crucible.py --turns 1 --no-spawner --debaters 2 --composer-judge

# Fusant (one Composer debater, rest on OpenRouter):
python crucible.py --turns 1 --no-spawner --debaters 2 --composer-fusant
```
