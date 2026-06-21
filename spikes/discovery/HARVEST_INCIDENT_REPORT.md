# Doppl Discovery Harvest — Incident Report & Recommendations

**Date:** 2026-06-21 (~17:10 UTC)
**Author:** automated harvest task (run via Cowork)
**Status:** Hourly schedule **cancelled / disabled**. No further runs will fire until re-enabled.

---

## TL;DR

The hourly harvest has been **silently failing in the scheduled (Linux) environment** because the project's `.venv` was built on the user's Mac (Homebrew, Python 3.14.5) and cannot run inside the scheduler's Linux sandbox. The activation line falls through to the system `/usr/bin/python` (3.10.12), which has none of the spike's dependencies, so `discovery_demo.py` dies at `import httpx` before doing any work.

No data was harvested or corrupted in the failing run — the crash happens at import, before any ledger write. The last **good** run was **15:11 UTC today**, and that data is intact.

The scheduled task is now disabled per request. This report documents the failure, what the pipeline *was* producing when healthy, and the two viable paths to make it run reliably.

---

## 1. What happened

The task ran the documented command:

```bash
cd .../doppl-test/spikes/discovery && \
  (source ../../.venv/bin/activate 2>/dev/null || source .venv/bin/activate); \
  export OPENROUTER_API_KEY=$(grep -E '^OPENROUTER_API_KEY=' ../../.env | cut -d= -f2-); \
  PY=$(command -v python || command -v python3); \
  "$PY" discovery_demo.py --limit-corpus 0 --limit-hn 6 --no-enrich --no-open
```

It crashed immediately:

```
Traceback (most recent call last):
  File ".../discovery_demo.py", line 28, in <module>
    import httpx
ModuleNotFoundError: No module named 'httpx'
```

Per the task's own stop condition — *"If the run errors on a missing key or venv, report that and stop."* — execution halted. The `OPENROUTER_API_KEY` resolved correctly; **only the venv is at fault.**

---

## 2. Root cause

The `.venv` is a **macOS/Homebrew virtual environment** that was committed/created on the user's machine and is being read by a **Linux** sandbox where the scheduled task actually executes. The two are incompatible.

Evidence from `doppl-test/.venv/pyvenv.cfg`:

```
home = /opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/bin
version = 3.14.5
command = /Users/michaelhabermas/repos/GAI/doppl-test/.venv/bin/python3 -m venv ...
```

And the interpreter symlink chain inside that venv:

```
.venv/bin/python  ->  python3.14
.venv/bin/python3.14  ->  /opt/homebrew/opt/python@3.14/bin/python3.14   ← does not exist on Linux
```

What this produces at runtime:

| Check | Result |
|---|---|
| `/opt/homebrew/.../python3.14` exists in sandbox? | **No** (that's a Mac path) |
| `python3.14` on sandbox PATH? | **No** |
| `source ../../.venv/bin/activate` → `VIRTUAL_ENV` | **empty** (activation no-ops; interpreter is missing) |
| `command -v python` falls through to | `/usr/bin/python` = **Python 3.10.12** |
| Does that interpreter have `httpx`? | **No** — nothing from `requirements.txt` is installed |

So the `|| source .venv/bin/activate` fallback can't save it either (there is no local `.venv` in the spike dir), and `PY` silently becomes the bare system Python. The script needs `httpx`, `python-dotenv`, and `rich` (`spikes/discovery/requirements.txt`) and finds none of them.

**This is an environment-portability bug, not a code bug.** The spike runs fine on the Mac where the venv was built; it has likely been failing every hour in the scheduler since the schedule was created in this environment.

---

## 3. Impact

- **This run:** zero rows written. The failure is at import, before `gather_items()` / any `write_*` ledger call, so nothing was appended and nothing was partially written.
- **Ledger integrity:** intact. `ledgers/candidate_feed.jsonl` last modified **15:11 UTC** (624 rows), matching the last healthy run; `source_recipes.json` / `source_registry.json` last written 15:10–15:11.
- **Accumulation goal not met:** the whole point of the hourly cadence (no `--reset`, let the source registry and promotion stats build) is not happening in this environment — every scheduled hour has been a no-op crash, so the registry only reflects manual/Mac runs.

---

## 4. What the pipeline produces when it *is* healthy

From the **last good run's** ledgers (15:10–15:11 UTC), so the reader can see what's being lost each failed hour:

**Top candidates by `lens_score` (lens = capstone-demo-fit):**

| Score | Subtype | Source | Title |
|---:|---|---|---|
| +4 | zeitgeist_synthesis | corpus:case-studies | Shift in AI Constraints from Chips to Firm Power |
| +4 | zeitgeist_synthesis | corpus:case-studies | Adapting Publishing Strategies in the Age of AI Search |
| +4 | cross_domain_transfer | yc-rfs | AI-Native SaaS Challengers for Legacy Systems |

**`is_trap` flags (actively-bad items the lens correctly down-scored), most recent:**

- `-2` github-trending — *"AI Agent Mimicking Lethargic Senior Developer Mindset"* → trap: *"Encourages laziness in coding…lower overall code quality."* (recurring trap across runs)
- `-2` hackernews — *"Windows 11 Media Player RAM Usage and Codec Pricing Issues"* → trap: *"…distract from broader software-efficiency and UX improvements."*
- `-2` lobsters — *"Lack of Instances in atproto Framework"* → trap: *"underlying issues may be more complex and systemic."*

**Source health (`source_registry.json`) — productive sources:**
yc-rfs (hit-rate 1.00), arxiv (1.00), producthunt (1.00), github-trending (0.83), hackernews (0.71), sec-edgar (0.54), lobsters (0.45). Trap-rate 0.0 across all of them.

This is a working classify-and-rank brain. The harvest wrapper around it is what's broken in this environment.

---

## 5. Source-recipe problems (independent of the venv issue)

Even on healthy runs, several sources are flagged `status: "broken"` / `"unreachable"` in `source_recipes.json` + `source_registry.json`. These are pre-existing and will need attention regardless of how the env is fixed:

| Source | Status | Reason | Suggested fix |
|---|---|---|---|
| **reddit** | broken / unreachable | `403 Blocked` on `*.json` — TLS/JA3 **and** IP-level block from datacenter IPs | `curl_cffi` (chrome impersonate) **plus a residential proxy**, or a Reddit OAuth app / MCP. Plain `curl_cffi` alone still 403s from a datacenter IP. |
| **google-trends** | broken / unreachable | `404` on `dailytrends` endpoint — unofficial API path changed | Update the recipe to the current trends endpoint (or `pytrends`); rate-limit carefully. |
| **youtube** | broken / unreachable | No `YOUTUBE_API_KEY` | Add a YouTube Data API key, or wire the `gemini-cli` dispatch rung. |
| **hackernews** | working but **regressed** | flagged `regressed: true`, `needs_rederivation: true`, broke earlier at 12:38 then recovered (intermittent `ConnectTimeout` on the SSL handshake) | Watch it; the Algolia endpoint is flaky, not dead. Consider a retry/backoff in the recipe. |
| **x (Twitter)** | untested | dispatch:grok-cli rung never exercised | Highest-value zeitgeist source per the notes — worth turning on first (`grok-cli`, subscription-priced firehose). |
| **papers-with-code** | untested | never exercised | Low urgency. |

Three sources (`reddit`, `google-trends`, `youtube`) are the ones that genuinely **need a connector or a recipe fix** today. The recipe ledger's `mcp_candidate` field already names the likely fixes (github MCP, producthunt MCP/OAuth, curl_cffi, grok-cli, gemini-cli).

---

## 6. Recommendations

### A. Decision already taken
The hourly schedule is **disabled**. Nothing else will run until it's deliberately re-enabled.

### B. To make the harvest runnable in the scheduled (Linux) environment — pick one

**Option 1 — Build a Linux venv from `requirements.txt` (recommended, cheapest).**
Stop shipping/relying on the Mac `.venv`. Create the env inside the environment that actually runs the task:

```bash
cd .../doppl-test
python3 -m venv .venv-linux
.venv-linux/bin/pip install -r spikes/discovery/requirements.txt
# optional rungs: .venv-linux/bin/pip install curl_cffi
```

Then point the task's command at `.venv-linux`. Add `.venv*` to `.gitignore` so host-specific venvs never travel between machines again. The deps are tiny (`httpx`, `python-dotenv`, `rich`), so this builds in seconds.

**Option 2 — Run the schedule on the Mac where the existing `.venv` works.**
If the harvest is meant to run against the user's actual machine/IP (relevant for the Reddit IP-block problem — a residential IP helps), schedule it there instead of in the Linux sandbox. The current `.venv` (3.14.5) already has the deps.

> Recommendation: **Option 1** for reliability and reproducibility; keep Option 2 in mind only if residential-IP egress turns out to matter for the blocked sources.

### C. Harvest script robustness (so this fails *loudly* next time)
Right now a missing/incompatible venv degrades silently to the system Python and only surfaces as a deep `ImportError`. Suggest a guard at the top of the run command or `discovery_demo.py`:

- After activation, assert `VIRTUAL_ENV` is non-empty **and** `python -c "import httpx, dotenv, rich"` succeeds; exit with a clear message if not.
- Or pin the command to an explicit interpreter path rather than `command -v python`, so a missing venv errors instead of falling through.

### D. Source fixes (independent track)
Address the three broken sources when convenient: Reddit (curl_cffi + residential proxy / OAuth), google-trends (endpoint update), youtube (API key or gemini-cli). Consider exercising the untested high-value `x`/grok-cli rung.

---

## 7. Re-enabling later

When the environment fix (B) is in place and verified with a manual run, the schedule can be turned back on. Until then it stays disabled. Suggested gate before re-enabling: one clean manual run that appends new rows to `candidate_feed.jsonl` and leaves the ledgers consistent.

---

*No files were committed. No ledgers were modified by the failing run. Only the scheduled task's enabled-state was changed (set to disabled).*
