"""Triage for the Sentry auto-fix loop (Execution + Verification steps).

Ported from cursor/LinkedIn/scripts/grow_repair_triage.py. Acts on a NEEDS_TRIAGE
request: re-confirms the issue is fixable (defence in depth), then (when live)
branches, hands a tightly-boxed `claude -p` the fix, RE-RUNS the verification
gate itself, and on a green, non-empty fix opens a draft PR for Ryo to merge.

STATUS: the live path IS now built (branch, boxed `claude -p`, re-verify, push
branch, draft PR), but is GATED behind SENTRY_LOOP_LIVE=1 and has NOT yet been
run against a real issue (the first live run is a deliberate, separate step). By
default this runs a DRY RUN that prints what it would do and makes no change. The
notifier (`_notify_proposal`) is a stub pending Ryo's choice of channel.

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

import json
import os
import subprocess
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


# The repair agent may only use these tools (dontAsk denies anything else); the
# deny-hook in repair_settings.json is the second layer. Verified safer than
# --dangerously-skip-permissions (Claude Code docs, 2026-06-25).
ALLOWED_TOOLS = (
    "Read,Edit,Grep,Glob,"
    "Bash(npx tsc --noEmit),Bash(npm run build),Bash(npm run lint),"
    "Bash(git diff),Bash(git diff *),Bash(git status),Bash(git status *)"
)


def _git(*args: str, check: bool = True) -> str:
    res = subprocess.run(
        ["git", *args], cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8"
    )
    if check and res.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {res.stderr.strip()[:300]}")
    return res.stdout.strip()


def _repo_dirty() -> bool:
    # Only tracked-file modifications matter; untracked runtime files are fine.
    return bool(_git("status", "--porcelain", "--untracked-files=no"))


def _invoke_claude(prompt: str) -> str:
    cli = os.environ.get("CLAUDE_CLI", "claude")
    # Strip ANTHROPIC_API_KEY so claude -p uses the subscription, not API billing.
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    res = subprocess.run(
        [
            cli, "-p", prompt,
            "--max-turns", os.environ.get("SENTRY_REPAIR_MAX_TURNS", "30"),
            "--permission-mode", "dontAsk",
            "--allowedTools", ALLOWED_TOOLS,
            "--settings", str(ROOT / "repair_settings.json"),
        ],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        env=env,
        timeout=int(os.environ.get("SENTRY_REPAIR_TIMEOUT", "1800")),
    )
    if res.returncode != 0:
        raise RuntimeError(f"claude -p exited {res.returncode}: {res.stderr[:300]}")
    return res.stdout


def _extract_json(text: str) -> dict:
    import re

    match = re.search(r"\{[\s\S]*\}", text.strip())
    if not match:
        raise ValueError(f"no JSON in claude output: {text[:200]}")
    return json.loads(match.group(0))


def _run_verify() -> tuple[bool, str]:
    """Re-run the gate OURSELVES; never trust the agent's self-report. shell=True
    is safe here because the commands are fixed constants, not input."""
    for cmd in VERIFY_COMMANDS:
        joined = " ".join(cmd)
        res = subprocess.run(
            joined, cwd=str(REPO_ROOT), capture_output=True, text=True,
            encoding="utf-8", shell=True, timeout=900,
        )
        if res.returncode != 0:
            tail = (res.stdout[-400:] + res.stderr[-400:]).strip()
            print(f"[triage] gate FAILED: {joined}\n{tail}", file=sys.stderr)
            return False, joined
    return True, ""


def _open_draft_pr(branch: str, base: str, result: dict, state: dict) -> str:
    title = f"Sentry auto-fix: {str(state.get('title', ''))[:60]}"
    body = (
        f"Automated proposed fix for Sentry issue `{state.get('issue_id')}`.\n\n"
        f"**Root cause:** {result.get('root_cause', '')}\n\n"
        f"**Change:** {result.get('diff_summary', '')}\n\n"
        f"Sentry: {state.get('permalink', '')}\n\n"
        f"Notes: {result.get('notes', '')}\n\n"
        "Generated by the sentry-loop (Stage 1, propose-only). Review before merging."
    )
    res = subprocess.run(
        ["gh", "pr", "create", "--draft", "--base", base, "--head", branch,
         "--title", title, "--body", body],
        cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8",
    )
    if res.returncode != 0:
        print(f"[triage] gh pr create failed: {res.stderr[:300]}", file=sys.stderr)
        return ""
    return res.stdout.strip()


def _notify_proposal(state: dict, proposal: dict, pr_url: str) -> None:
    """NOTIFIER STUB - pending Ryo's decision on the notification channel
    (remote-control push vs draft-PR-only vs other). For now: print + rely on the
    draft PR. The single place to plug the chosen notifier."""
    print(f"[triage] PROPOSED FIX for {state.get('issue_id')}: {pr_url or '(no PR url)'}")
    print(f"[triage]   root cause: {proposal.get('root_cause', '')}")


def _notify_failed(reason: str) -> None:
    """NOTIFIER STUB (failure path)."""
    print(f"[triage] COULD NOT AUTO-FIX: {reason}", file=sys.stderr)


def _run_live(state: dict) -> int:
    """LIVE: branches, runs the boxed agent, re-verifies, pushes the branch, and
    opens a draft PR. Untested against a real run yet; the first live run is a
    gated Layer-3 step. Pushes a NON-master branch only; never touches master."""
    issue_id = str(state.get("issue_id", ""))
    print(f"[triage] LIVE run for issue {issue_id} (this makes real git/PR changes)")

    if _repo_dirty():
        repair_state.give_up(issue_id)
        _notify_failed("repo has uncommitted changes; not safe to auto-branch")
        return 3

    base = _git("rev-parse", "--abbrev-ref", "HEAD")
    branch = f"fix/sentry-auto-{issue_id}"
    _git("checkout", "-b", branch)

    prompt = Template(REPAIR_PROMPT).safe_substitute(
        title=state.get("title", ""),
        culprit=state.get("culprit", ""),
        error_excerpt=state.get("error_excerpt", ""),
        permalink=state.get("permalink", ""),
    )

    try:
        out = _invoke_claude(prompt)
        result = _extract_json(out)
    except Exception as e:
        _git("checkout", "--force", base, check=False)
        _git("branch", "-D", branch, check=False)
        repair_state.give_up(issue_id)
        _notify_failed(f"triage run errored: {e}")
        return 3

    # Commit the agent's edits on the branch so they are preserved and cannot
    # ride along to base at checkout. Stage only tracked-file modifications.
    _git("add", "-u", check=False)
    _git("commit", "-m", f"sentry auto-fix: {(result.get('root_cause') or 'fix')[:60]}", check=False)

    gate_ok, _failed = _run_verify()
    diff_stat = _git("diff", "--stat", f"{base}..{branch}", check=False)
    has_changes = bool(diff_stat.strip())
    fixed = bool(result.get("fixed")) and gate_ok and has_changes

    _git("checkout", base, check=False)

    if fixed:
        _git("push", "-u", "origin", branch)  # the orchestrator's one allowed remote action
        pr_url = _open_draft_pr(branch, base, result, state)
        proposal = {
            "root_cause": result.get("root_cause", ""),
            "files_changed": result.get("files_changed", []),
            "diff_summary": result.get("diff_summary", ""),
            "diff_stat": diff_stat,
            "notes": result.get("notes", ""),
        }
        repair_state.set_status(
            repair_state.AWAITING_APPROVAL, branch=branch, proposal=proposal, pr_url=pr_url
        )
        _notify_proposal(state, proposal, pr_url)
        return 2

    _git("branch", "-D", branch, check=False)
    repair_state.give_up(issue_id)
    _notify_failed(result.get("root_cause", "no verified fix produced"))
    return 3


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
