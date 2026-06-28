# Sentry auto-fix loop (Stage 1 + phone approval)

A self-running loop that takes a qualifying Sentry error in miozuki-web, fixes it
on a branch, verifies it builds, then asks Ryo for a one-tap **approve/reject on
his phone** (via Claude Code Remote Control) before pushing the branch and opening
a draft PR. Ported from the LinkedIn grow self-healing loop and the pattern guide
`~/.claude/guides/remote-control-approval-loop.md`.

Design doc: Obsidian vault `areas/founder-os/context/sentry-fix-loop-DESIGN.md`.

## Architecture (ported from the grow Stage-2 pattern)

| Component | File | Job |
|---|---|---|
| Detector (Trigger) | `sentry_detect.py` | Fetch Sentry issues, classify, queue the first auto-fixable one |
| State / memory | `repair_state.py` | JSON state machine, attempt cap, dedupe ledger |
| Worker | `sentry_repair_triage.py` | Branch, boxed `claude -p`, re-verify, **park** the fix, launch the approval session (does NOT push) |
| Approval session | (launched by the worker) | A Remote Control `claude` session: pings Ryo's phone, shows the fix, waits for approve/reject |
| Apply / reject helper | `sentry_repair_apply.py` | Deterministic: on approve, push branch + open draft PR; on reject, discard. The LLM only *calls* this |

Safety control: `failure_classes.py` (the whitelist classifier, defaults to "do
not touch"). Secondary layer kept for reference: `hooks/repair_deny.py` +
`repair_settings.json` implement the tighter allow-list alternative; the worker
currently uses the guide's verified `--disallowedTools` deny-list instead.

## The chain

```
[scheduler] -> detector queues a fixable issue (NEEDS_TRIAGE)
[scheduler] -> worker: branch, boxed claude -p (bypassPermissions + deny-list),
               re-run tsc/build/lint OURSELVES, park the fix (AWAITING_APPROVAL),
               launch the RC approval session, exit
[RC session] -> PushNotification to Ryo's phone, show the fix, wait
[Ryo, phone] -> reply "approve" or "reject"
[apply helper] -> approve: push branch + gh pr create --draft  |  reject: discard
                  (Ryo still merges the PR himself)
```

Watchdog: an approval left undecided from a previous day is expired at the worker's
start (lingering session killed, issue ledgered, branch kept for manual review).

## Run the scaffold (no network, no side effects)

```bash
cd scripts/sentry-loop

# Unit tests (Python 3.11+, no extra deps)
for t in tests/test_*.py; do python "$t"; done

# Detector dry-run against fixtures: queues the one genuine code bug
SENTRY_LOOP_FIXTURE=fixtures/sample_issues.json SENTRY_LOOP_STATE_FILE=state/dev.json \
  python sentry_detect.py

# Triage dry-run: prints the plan; SENTRY_LOOP_LIVE unset => no branch/claude/push/RC
SENTRY_LOOP_STATE_FILE=state/dev.json python sentry_repair_triage.py
```

## Guardrails

1. **The whitelist classifier** only attempts genuine runtime bugs in our own
   code; it permanently excludes payments/auth/api/secrets, third-party noise,
   and transient infra errors. A human still approves the PR.
2. **The irreversible step is deterministic, gated by approval.** The push + PR
   live in `sentry_repair_apply.py`; the LLM only calls it after Ryo approves.
3. **The boxed agent runs `bypassPermissions` + `--disallowedTools`** (verified to
   override bypass): push, deploy, `gh pr`, and the apply helper are hard-blocked
   inside the worker agent.
4. **The loop re-runs the gate itself** (`tsc/build/lint`), never trusting the
   agent's self-report.
5. **Attempt cap of 1**; **dedupe ledger**; **one repair at a time**;
   **dirty-repo refusal**; **watchdog** for stale approvals.

## Enable flags (both off by default)

- `SENTRY_LOOP_LIVE=1` — enable the live triage path (branch + `claude -p` + park).
- `SENTRY_LOOP_RC_ENABLED=1` — enable launching the RC approval session.
- Live detection also needs `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.

## Go-live checklist

Built and verified (deterministic, no network):
- [x] Detector + classifier + state machine + live Sentry fetch.
- [x] Worker `_run_live`: branch, boxed agent, re-verify, park, launch RC approval.
- [x] `sentry_repair_apply.py`: deterministic push + draft PR / discard, self-reaper.
- [x] Watchdog for stale approvals.

Still to do before it can run for real:
- [ ] **One-time folder trust:** launch an interactive `claude` once in
      `miozuki-web` and approve the "trust this folder" dialog (Remote Control
      needs it before unattended launches).
- [ ] **Supervised end-to-end validation** (the important one): simulate a queued
      issue with `SENTRY_LOOP_LIVE=1 SENTRY_LOOP_RC_ENABLED=1`, confirm the phone
      ping arrives, approve from the phone, confirm the branch pushed + draft PR
      opened, and that master was never touched. Catch real setup bugs here.
- [ ] Confirm `gh` is authed locally for `gh pr create`.
- [ ] Install the Task Scheduler job (detector, then worker shortly after) with
      "run only when user is logged on" (Remote Control needs a console).
- [ ] First live `SENTRY_AUTH_TOKEN` detection run (Layer-3 spot check).

Nothing runs against production Sentry, pushes, calls Claude, or pings the phone
until those flags + tokens are set and the supervised run passes.
