"""Triage for the Sentry auto-fix loop (worker: fix + park + launch approval).

Ported from cursor/LinkedIn/scripts/grow_repair_triage.py (Stage 2) and the
pattern guide ~/.claude/guides/remote-control-approval-loop.md. Acts on a
NEEDS_TRIAGE request: re-confirms the issue is fixable, branches, hands a boxed
`claude -p` the fix, RE-RUNS the verify gate itself, and on a verified fix PARKS
the proposal on the branch and launches a Remote Control approval session that
pings Ryo's phone. It does NOT push or open the PR; that irreversible step is
deferred to the deterministic helper sentry_repair_apply.py, gated by Ryo's
phone approval.

Safety (per the guide):
  - the boxed agent runs `--permission-mode bypassPermissions --disallowedTools
    <DENY>`; the deny-list OVERRIDES bypass and is command-prefix specific
    (verified 2026-06-25, Claude Code 2.1.191), so push/deploy/PR/the apply
    helper are hard-blocked inside the agent;
  - the loop re-runs the gate itself, never trusting the agent's self-report;
  - attempt cap of 1 (in repair_state); a watchdog expires a stale approval.

STATUS: the live path is GATED behind SENTRY_LOOP_LIVE=1 and not yet run against
a real issue. The RC approval launch is additionally behind SENTRY_LOOP_RC_ENABLED=1.

Exit codes:
  0 - nothing to do / dry run
  2 - a fix was proposed (AWAITING_APPROVAL), approval session launched
  3 - triage ran but could not produce a verified fix (FAILED)
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent.parent  # miozuki-web repo root
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def _load_dotenv() -> None:
    env_file = ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip()
        if key and key not in os.environ:
            os.environ[key] = val


_load_dotenv()

import repair_state  # noqa: E402
from failure_classes import classify_issue  # noqa: E402

# The verify gate. The loop re-runs this ITSELF after the agent.
VERIFY_COMMANDS = (
    ["npx", "tsc", "--noEmit"],
    ["npm", "run", "build"],
    ["npm", "run", "lint"],
)

# Worker deny-list: hard-blocks the dangerous prefixes inside the boxed agent.
# git push / deploy / PR / the apply helper are the agent's "never" actions; the
# push + PR happen only via the apply helper after Ryo approves on his phone.
_WORKER_DENY = [
    "Bash(git push:*)",
    "Bash(vercel:*)",
    "Bash(npm run deploy:*)",
    "Bash(pnpm run deploy:*)",
    "Bash(next deploy:*)",
    "Bash(gh pr:*)",
    "Bash(python scripts/sentry-loop/sentry_repair_apply.py:*)",
    "Bash(python3 scripts/sentry-loop/sentry_repair_apply.py:*)",
]

REPAIR_PROMPT = """You are an autonomous repair agent for the miozuki-web Next.js codebase. A \
production error was reported by Sentry. Fix the root cause. You are running headless: no human is \
watching, so do not ask questions, just act, then report.

Hard rules (violating any is a failure):
- MAKE THE SMALLEST POSSIBLE DIFF. Change only the lines the fix requires. Do NOT reformat, re-wrap, \
re-indent, reorder, or re-style any other line. Do NOT run any auto-formatter. Before you finish, run \
`git diff` and revert any incidental change so only the fix remains.
- NEVER touch checkout, cart, payments, auth, account, server API route handlers, environment files, \
or secrets. If the fix would require touching any of those, STOP and report fixed=false.
- You are already on an isolated git branch. Do NOT push, commit, switch branches, open a PR, or \
deploy. `git push`, deploy commands, `gh pr`, and the apply helper are BLOCKED by policy.

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

# The Remote Control approval session. Launched once a verified fix is parked.
# Its FIRST action pings Ryo's phone; then it shows the proposal and waits for his
# approve/reject, and runs the deterministic apply helper. It never edits code,
# never pushes directly, never deploys.
APPROVAL_PROMPT = """A miozuki-web Sentry auto-fix is waiting for Ryo's decision. Here is the proposed fix:

PROPOSED FIX
- Sentry issue: $issue_id ($title)
- Root cause: $root_cause
- Files changed: $files_changed
- Diff: $diff_stat
- Notes: $notes
- On approval, branch "$branch" is pushed and a DRAFT pull request is opened against "$base_branch". \
The push and PR are the only outward actions; Ryo still merges the PR himself.

Your ONLY job is to get Ryo's decision and act on it. Do not diagnose or change any code yourself.

Steps, in order:
1. FIRST, call the PushNotification tool so Ryo's phone alerts him. Message: \
"Sentry fix ready: $root_cause ($diff_stat). Reply approve to push + open a draft PR, or reject to discard."
2. Then post the PROPOSED FIX summary above as a clear message in this session, so when Ryo opens it on \
his phone he sees exactly what he is approving. End by asking him to reply approve or reject.
3. Then STOP and wait. Take no action until Ryo replies in this session.
4. If Ryo replies approve (or yes / ok / ship it): run `python scripts/sentry-loop/sentry_repair_apply.py apply` \
with the Bash tool, then call PushNotification "Sentry fix pushed; draft PR open." and reply with the PR link. Done.
5. If Ryo replies reject (or no / discard): run `python scripts/sentry-loop/sentry_repair_apply.py reject` \
with the Bash tool, then call PushNotification "Sentry fix discarded." and reply confirming. Done.
6. NEVER edit code, never push or deploy yourself. Only the apply/reject helper above.

If Ryo asks about the fix, answer from the PROPOSED FIX summary. If his reply is ambiguous, ask him to \
reply exactly approve or reject. Do nothing else while waiting.
"""

# In the approval session the LLM may ONLY call the apply/reject helper; it must
# not push or deploy directly. (The apply helper does the push via its own
# subprocess, which is not the agent's Bash tool, so it is not denied.)
_APPROVAL_DENY = [
    "Bash(git push:*)",
    "Bash(vercel:*)",
    "Bash(npm run deploy:*)",
    "Bash(next deploy:*)",
]


def _git(*args: str, check: bool = True) -> str:
    res = subprocess.run(
        ["git", *args], cwd=str(REPO_ROOT), capture_output=True, text=True, encoding="utf-8"
    )
    if check and res.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {res.stderr.strip()[:300]}")
    return res.stdout.strip()


def _repo_dirty() -> bool:
    return bool(_git("status", "--porcelain", "--untracked-files=no"))


def _reconstruct_issue(state: dict) -> dict:
    return {
        "id": state.get("issue_id", ""),
        "title": state.get("title", ""),
        "culprit": state.get("culprit", ""),
        "metadata": {"value": state.get("error_excerpt", "")},
        "frames": [{"filename": state.get("culprit", "")}],
    }


def _invoke_claude(prompt: str) -> str:
    cli = os.environ.get("CLAUDE_CLI", "claude")
    # Strip ANTHROPIC_API_KEY so claude -p uses the subscription, not API billing.
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    res = subprocess.run(
        [cli, "-p", prompt,
         "--permission-mode", "bypassPermissions",
         "--disallowedTools", *_WORKER_DENY],
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

    text = text.strip()
    # The agent prints the JSON object as the last line; scan from the bottom so
    # stray braces earlier in the output cannot mis-parse.
    for line in reversed(text.splitlines()):
        line = line.strip()
        if line.startswith("{") and line.endswith("}"):
            try:
                return json.loads(line)
            except Exception:
                continue
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"no JSON in claude output: {text[:200]}")


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


def _launch_rc_approval(branch: str, base: str, issue: dict, proposal: dict) -> int | None:
    """Launch the Remote Control approval session in its own console (Remote
    Control needs a TTY). Opt-in behind SENTRY_LOOP_RC_ENABLED=1. Returns its PID."""
    if os.environ.get("SENTRY_LOOP_RC_ENABLED") != "1":
        print("[triage] RC approval disabled (set SENTRY_LOOP_RC_ENABLED=1 once validated)")
        return None
    cli = os.environ.get("CLAUDE_CLI", "claude")
    files = ", ".join(proposal.get("files_changed") or []) or "(none listed)"
    prompt = Template(APPROVAL_PROMPT).safe_substitute(
        branch=branch,
        base_branch=base,
        issue_id=issue.get("issue_id", ""),
        title=(issue.get("title", "") or "")[:80],
        root_cause=proposal.get("root_cause", "") or "(unknown)",
        files_changed=files,
        diff_stat=(proposal.get("diff_stat") or "").strip() or "(n/a)",
        notes=(proposal.get("notes") or "").strip() or "(none)",
    )
    name = f"sentry-fix-approval-{branch.split('/')[-1]}"
    env = {k: v for k, v in os.environ.items() if k != "ANTHROPIC_API_KEY"}
    creationflags = subprocess.CREATE_NEW_CONSOLE if sys.platform == "win32" else 0
    try:
        proc = subprocess.Popen(
            [cli, prompt, "--remote-control", name,
             "--permission-mode", "bypassPermissions",
             "--disallowedTools", *_APPROVAL_DENY],
            cwd=str(REPO_ROOT), env=env, creationflags=creationflags,
        )
        print(f"[triage] launched RC approval session '{name}' pid={proc.pid}")
        return proc.pid
    except Exception as e:
        print(f"[triage] could not launch RC approval session: {e}", file=sys.stderr)
        return None


def _expire_stale_approval(state: dict) -> None:
    """An approval left AWAITING_APPROVAL from a previous day means Ryo never
    decided. Kill any lingering session and escalate; keep the branch for manual
    review so a new fix does not stack on a dead approval."""
    pid = state.get("approval_pid")
    if pid and sys.platform == "win32":
        subprocess.run(["taskkill", "/PID", str(pid), "/F", "/T"], capture_output=True, text=True)
    issue_id = state.get("issue_id", "")
    repair_state.give_up(issue_id)
    print(f"[triage] expired stale approval for {issue_id}; branch kept for manual review")


def run_triage() -> int:
    today = datetime.now(repair_state.NZ_TZ).strftime("%Y-%m-%d")
    state = repair_state.read_state()

    # Watchdog: expire an approval left hanging from a previous day, before anything else.
    if (
        state.get("status") == repair_state.AWAITING_APPROVAL
        and state.get("approval_date")
        and state.get("approval_date") != today
    ):
        _expire_stale_approval(state)
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

    if os.environ.get("SENTRY_LOOP_LIVE") != "1":
        branch = f"fix/sentry-auto-{state.get('issue_id', 'unknown')}"
        print("[triage] DRY RUN (set SENTRY_LOOP_LIVE=1 for the live path)")
        print(f"[triage]   would branch:  {branch} (off current base, in {REPO_ROOT})")
        print(f"[triage]   would verify:  {'  &&  '.join(' '.join(c) for c in VERIFY_COMMANDS)}")
        print(f"[triage]   would park the fix and launch an RC approval session (push/PR via apply helper on approve)")
        print(f"[triage]   classified as: {cls.category.value} ({cls.reason})")
        return 0

    return _run_live(state)


def _run_live(state: dict) -> int:
    """LIVE: branch, run the boxed agent, re-verify, PARK the fix, launch the RC
    approval session. Does NOT push or open the PR (that is the apply helper,
    gated by Ryo's phone approval). Untested against a real run yet."""
    issue_id = str(state.get("issue_id", ""))
    today = datetime.now(repair_state.NZ_TZ).strftime("%Y-%m-%d")
    stamp = datetime.now(repair_state.NZ_TZ).strftime("%H%M%S")
    print(f"[triage] LIVE run for issue {issue_id}")

    if _repo_dirty():
        repair_state.give_up(issue_id)
        print("[triage] repo has uncommitted changes; not safe to auto-branch", file=sys.stderr)
        return 3

    base = _git("rev-parse", "--abbrev-ref", "HEAD")
    branch = f"fix/sentry-auto-{issue_id}-{stamp}"
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
        print(f"[triage] triage run errored: {e}", file=sys.stderr)
        return 3

    _git("add", "-u", check=False)
    _git("commit", "-m", f"sentry auto-fix: {(result.get('root_cause') or 'fix')[:60]}", check=False)

    gate_ok, _failed = _run_verify()
    diff_stat = _git("diff", "--stat", f"{base}..{branch}", check=False)
    has_changes = bool(diff_stat.strip())
    fixed = bool(result.get("fixed")) and gate_ok and has_changes

    _git("checkout", base, check=False)

    if fixed:
        proposal = {
            "root_cause": result.get("root_cause", ""),
            "files_changed": result.get("files_changed", []),
            "diff_summary": result.get("diff_summary", ""),
            "diff_stat": diff_stat,
            "notes": result.get("notes", ""),
        }
        approval_pid = _launch_rc_approval(
            branch, base, {"issue_id": issue_id, "title": state.get("title", "")}, proposal
        )
        repair_state.set_status(
            repair_state.AWAITING_APPROVAL,
            branch=branch,
            base_branch=base,
            proposal=proposal,
            approval_pid=approval_pid,
            approval_date=today,
        )
        print(f"[triage] fix parked on {branch}; RC approval session pid={approval_pid}, awaiting Ryo")
        return 2

    _git("branch", "-D", branch, check=False)
    repair_state.give_up(issue_id)
    print(f"[triage] could not auto-fix: {result.get('root_cause', 'unknown')}", file=sys.stderr)
    return 3


if __name__ == "__main__":
    sys.exit(run_triage())
