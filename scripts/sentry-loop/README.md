# Sentry auto-fix loop (Stage 1 scaffold)

A self-running loop that takes a qualifying Sentry error in miozuki-web, proposes
a fix on a branch, verifies it compiles and builds, and opens a draft PR for Ryo
to merge. Ported from the LinkedIn grow self-healing loop. **This is the Stage 1
scaffold: it is dry-runnable and has no live side effects yet.**

Design doc: Obsidian vault `areas/founder-os/context/sentry-fix-loop-DESIGN.md`.

## The three layers (ported from grow)

| Layer | File | Job |
|---|---|---|
| Detector (Trigger) | `sentry_detect.py` | Fetch Sentry issues, classify, queue the first auto-fixable one |
| State / memory (Output+Memory) | `repair_state.py` | JSON state machine, attempt cap, dedupe ledger |
| Repairer (Execution+Verification) | `sentry_repair_triage.py` | Branch, run a boxed `claude -p`, re-run the gate, open a draft PR |

Supporting: `failure_classes.py` (the whitelist classifier, the key safety
control), `hooks/repair_deny.py` + `repair_settings.json` (hook-enforced safety),
`fixtures/` (real + synthetic issues), `tests/`.

## Run the scaffold (no network, no side effects)

```bash
cd scripts/sentry-loop

# Unit tests (no dependencies beyond Python 3.11+)
python tests/test_failure_classes.py
python tests/test_repair_state.py

# Detector dry-run against fixtures: classifies all issues, queues the fixable one
SENTRY_LOOP_FIXTURE=fixtures/sample_issues.json SENTRY_LOOP_STATE_FILE=state/dev.json \
  python sentry_detect.py

# Triage dry-run: prints the branch, gate, and repair prompt it WOULD use
SENTRY_LOOP_STATE_FILE=state/dev.json python sentry_repair_triage.py
```

## What the classifier does (and refuses)

Only `fixable_candidate` issues are ever attempted, and a human still approves the
PR. The classifier defaults to "do not touch".

- **Attempted:** a recognised runtime bug (null/undefined access, bad type/import)
  in our own code (`app/`, `components/`, `lib/`).
- **Never attempted (sensitive):** anything touching checkout, cart, payments,
  auth, account, server API route handlers, env, or secrets.
- **Never attempted (noise):** third-party / injected scripts (Meta in-app
  browser, extensions). These belong in Sentry's ignore rules.
- **Never attempted (transient):** `fetch failed`, connect timeouts, 5xx. These
  are upstream blips handled by retry, not code bugs, even when typed `TypeError`.

## Guardrails

1. **Hook-enforced safety.** The repair `claude -p` session loads
   `repair_settings.json`, which wires `hooks/repair_deny.py` as a PreToolUse
   hook that hard-blocks push, force-push, branch switching, deploy, recursive
   delete, and writes to `.env`/secrets, regardless of what the agent decides.
2. **The agent never pushes.** The orchestrator pushes the branch and opens the
   draft PR after the gate re-runs green, outside the agent session.
3. **The loop re-runs the gate itself** (`tsc --noEmit`, `npm run build`,
   `npm run lint`); it does not trust the agent's self-report.
4. **Attempt cap of 1** per issue; a second failure escalates to a human.
5. **Dedupe ledger** so an issue is never re-fixed.
6. **One repair at a time** so PRs do not pile up.
7. **Dirty-repo refusal** (live path) so uncommitted work is never clobbered.

## Not wired yet (the go-live checklist)

The scaffold deliberately stops short of any live effect. To go live later:

- [ ] Implement `sentry_detect._fetch_live_issues()` against the Sentry REST API
      (needs `SENTRY_AUTH_TOKEN` + org/project slugs), or wire the Sentry MCP.
- [ ] Build `sentry_repair_triage._run_live()`: dirty-check, branch off master,
      `claude -p --settings repair_settings.json` (verify the exact `--settings`
      flag against the installed Claude Code version), re-run the gate, commit on
      the branch, push, `gh pr create --draft`, set `AWAITING_APPROVAL`, notify.
- [ ] Add a notifier (email/Telegram) mirroring grow's `tools/alerts`.
- [ ] Install the Task Scheduler job (detector, then triage shortly after).
- [ ] Decide Stage 0 (detect + notify only) vs Stage 1 (propose PRs) for first run.

Nothing here runs against production Sentry, pushes, or calls Claude until those
boxes are ticked and reviewed.
