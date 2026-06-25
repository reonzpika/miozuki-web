"""Triage for the Sentry auto-fix loop (Execution + Verification steps).

Ported from cursor/LinkedIn/scripts/grow_repair_triage.py. Acts on a NEEDS_TRIAGE
request: re-confirms the issue is fixable (defence in depth), then (when live)
branches, hands a tightly-boxed `claude -p` the fix, RE-RUNS the verification
gate itself, and on a green, non-empty fix opens a draft PR for Ryo to merge.

SCAFFOLD STATUS: the live path (`claude -p`, branch, push, draft PR) is NOT
enabled. By default this runs a DRY RUN that prints exactly what it would do and
makes no change. The live path raises NotImplementedError until it is built and
reviewed, so the scaffold has no side effects.

Guardrails the live path will enforce (see README):
  - refuse to run if the repo has uncommitted tracked changes;
  - the `claude -p` session is wired with a PreToolUse deny-hook (repair_deny.py
    via repair_settings.json) that hard-blocks push, force-push, deploy, and
    secret writes, regardless of what the agent decides;
  - the agent never pushes or opens the PR: the orchestrator does that AFTER the
    gate re-runs green, outside the agent session;
  - attempt cap of 1 (in repair_state); a second failure escalates to a human.

Exit codes:
  0 - nothing to do / dry run completed
  2 - a fix was proposed (AWAITING_APPROVAL)   [live only]
  3 - triage ran but could not produce a verified fix (FAILED)  [live only]
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent  # miozuki-web repo root
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import repair_state  # noqa: E402
from failure_classes import classify_issue  # noqa: E402

# The verification gate. The loop re-runs this ITSELF after the agent, rather
# than trusting the agent's self-report. A fix counts only if all three pass.
VERIFY_COMMANDS = (
    ["npx", "tsc", "--noEmit"],
    ["npm", "run", "build"],
    ["npm", "run", "lint"],
)

REPAIR_PROMPT = """You are an autonomous repair agent for the miozuki-web Next.js codebase. A \
production error was reported by Sentry. Fix the root cause. You are running headless: no human is \
watching, so do not ask questions, just act, then report.

Hard rules (violating any is a failure):
- MAKE THE SMALLEST POSSIBLE DIFF. Change only the lines the fix requires. Do NOT reformat, re-wrap, \
re-indent, reorder, or re-style any other line. Do NOT run any auto-formatter (prettier, eslint --fix \
on unrelated files). Before you finish, run `git diff` and revert any incidental change so only the \
fix remains.
- NEVER touch checkout, cart, payments, auth, account, server API route handlers, environment files, \
or secrets. If the fix would require touching any of those, STOP and report fixed=false.
- You are already on an isolated git branch. Do NOT push, do NOT commit, do NOT switch branches, do \
NOT deploy.

The Sentry issue:
  title:    $title
  culprit:  $culprit
  details:  $error_excerpt
  link:     $permalink

Steps:
1. Locate the cause in our own code (app/, components/, lib/). Read the failing file.
2. Make the smallest fix that prevents the error (e.g. a null/undefined guard, correct a type, fix a \
bad import). Prefer a defensive guard over a speculative rewrite.
3. Run the verification gate and make it pass:
   npx tsc --noEmit   &&   npm run build   &&   npm run lint

When done, print EXACTLY one JSON object on the last line and nothing after it:
{"fixed": true|false, "root_cause": "one sentence", "files_changed": ["..."], \
"gates_passed": true|false, "diff_summary": "what changed", "notes": "anything Ryo should know"}
"""


def _reconstruct_issue(state: dict) -> dict:
    """Rebuild a minimal issue dict from the queued state so we can re-classify
    (defence in depth: never repair something that should not be touched)."""
    return {
        "id": state.get("issue_id", ""),
        "title": state.get("title", ""),
        "culprit": state.get("culprit", ""),
        "metadata": {"value": state.get("error_excerpt", "")},
        "frames": [{"filename": state.get("culprit", "")}],
    }


def _run_live(state: dict) -> int:
    raise NotImplementedError(
        "Live triage is not enabled in the scaffold. The live path will: refuse on a dirty repo, "
        "branch off master, invoke `claude -p --settings repair_settings.json` with the deny-hook, "
        "re-run VERIFY_COMMANDS, and open a draft PR on success. Build and review before enabling."
    )


def run_triage() -> int:
    state = repair_state.read_state()
    if state.get("status") != repair_state.NEEDS_TRIAGE:
        print(f"[triage] no pending triage (status={state.get('status')})")
        return 0

    # Defence in depth: re-confirm the issue is still classified auto-fixable.
    cls = classify_issue(_reconstruct_issue(state))
    if not cls.auto_fixable:
        repair_state.give_up(state.get("issue_id", ""))
        print(f"[triage] re-classified as not auto-fixable ({cls.category.value}); escalated")
        return 3

    dry_run = os.environ.get("SENTRY_LOOP_LIVE") != "1"
    if dry_run:
        branch = f"fix/sentry-auto-{state.get('issue_id', 'unknown')}"
        prompt = Template(REPAIR_PROMPT).safe_substitute(
            title=state.get("title", ""),
            culprit=state.get("culprit", ""),
            error_excerpt=state.get("error_excerpt", ""),
            permalink=state.get("permalink", ""),
        )
        print("[triage] DRY RUN (set SENTRY_LOOP_LIVE=1 to enable the live path, once built)")
        print(f"[triage]   would branch:  {branch}  (off master, in {REPO_ROOT})")
        print(f"[triage]   would verify:  {'  &&  '.join(' '.join(c) for c in VERIFY_COMMANDS)}")
        print(f"[triage]   classified as: {cls.category.value} ({cls.reason})")
        print("[triage]   repair prompt that would be sent to claude -p:")
        print("\n".join("    " + line for line in prompt.splitlines()))
        return 0

    return _run_live(state)


if __name__ == "__main__":
    sys.exit(run_triage())
