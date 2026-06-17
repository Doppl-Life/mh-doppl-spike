# Fusion Demo

Panel → fusion judge → decision → critic → loop. Then opens the trace in your browser.

## First time only

```bash
cd doppl-test
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add OPENROUTER_API_KEY
chmod +x demo
```

## Run the demo (one command)

```bash
./demo
```

That's it. Runs 2 generations (panel, judge, decision, critic each), writes `fusion_trace.html`, opens it.

Custom prompt:

```bash
./demo --prompt "Your vague question here"
```

Terminal only, no browser:

```bash
./demo --no-open
```

## What happens

1. **Panel** — two models answer in parallel
2. **Fusion judge** — consensus, contradictions, clarifying questions
3. **Decision** — grounded answer
4. **Critic** — scores it, asks what it glossed over
5. If critic fails → **Gen 2** with feedback injected → repeat
6. **HTML opens** — full trace for the room / projector

Default prompt ("Room Vitals" for "a new room") is vague on purpose so Gen 1 usually fails and Gen 2 improves.

## Power-user flags

| Flag | Effect |
|------|--------|
| `--rounds 3` | More generations |
| `--no-html` | Skip HTML file |
| `--no-open` | Write HTML but don't open browser |
| `--mode official` | Also call OpenRouter's built-in Fusion API |

Reference: [OpenRouter Fusion](https://openrouter.ai/docs/guides/features/plugins/fusion)
