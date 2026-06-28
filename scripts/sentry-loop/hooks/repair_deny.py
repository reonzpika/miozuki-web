"""PreToolUse deny-hook for the Sentry repair agent session.

This is the hook-enforced safety layer (the review's top finding: safety must
live in hooks, not prompt instructions, because you cannot reliably prompt an
agent out of a dangerous command).

Wired ONLY into the headless repair `claude -p` session via repair_settings.json,
so it never interferes with Ryo's normal interactive Claude Code use.

Reads the Claude Code hook payload on stdin: {"tool_name": ..., "tool_input": {...}}.
Exit 0 allows the tool call; exit 2 blocks it and feeds the stderr reason back to
the agent. The repair agent must NEVER push, force-push, deploy, mutate git
history, or write secrets; the orchestrator does the (branch-only) push itself,
outside this session.
"""

from __future__ import annotations

import json
import re
import sys

# Bash commands that are always blocked inside a repair session.
_BLOCKED_BASH = (
    (re.compile(r"\bgit\s+push\b", re.IGNORECASE), "git push is forbidden in the repair session; the orchestrator pushes the branch"),
    (re.compile(r"\bgit\s+push\b.*(--force|-f)\b", re.IGNORECASE), "force push is forbidden"),
    (re.compile(r"\bgit\s+reset\s+--hard\b", re.IGNORECASE), "git reset --hard is forbidden"),
    (re.compile(r"\bgit\s+commit\b.*--amend\b", re.IGNORECASE), "git commit --amend is forbidden"),
    (re.compile(r"\bgit\s+checkout\b", re.IGNORECASE), "switching branches is forbidden in the repair session"),
    (re.compile(r"\bvercel\b", re.IGNORECASE), "deploying is forbidden"),
    (re.compile(r"\b(npm|pnpm|yarn)\s+run\s+deploy\b", re.IGNORECASE), "deploying is forbidden"),
    (re.compile(r"\bnext\s+deploy\b", re.IGNORECASE), "deploying is forbidden"),
    (re.compile(r">\s*\.env", re.IGNORECASE), "writing to .env is forbidden"),
    (re.compile(r"\brm\s+-rf?\b", re.IGNORECASE), "recursive delete is forbidden"),
)

# File paths the agent may never write (Write/Edit tools).
_BLOCKED_PATHS = (
    re.compile(r"\.env(\.|$)", re.IGNORECASE),
    re.compile(r"secret|credential", re.IGNORECASE),
)


def _block(reason: str) -> None:
    sys.stderr.write(f"BLOCKED by repair_deny hook: {reason}\n")
    sys.exit(2)


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        # If we cannot parse the payload, fail safe: allow nothing dangerous by
        # blocking. An unparseable payload should not silently permit a tool call.
        _block("could not parse hook payload")
        return

    tool = payload.get("tool_name", "")
    tin = payload.get("tool_input", {}) or {}

    if tool == "Bash":
        command = str(tin.get("command", ""))
        for pattern, reason in _BLOCKED_BASH:
            if pattern.search(command):
                _block(reason)

    if tool in ("Write", "Edit", "MultiEdit"):
        path = str(tin.get("file_path", ""))
        for pattern in _BLOCKED_PATHS:
            if pattern.search(path):
                _block(f"writing to {path} is forbidden")

    sys.exit(0)


if __name__ == "__main__":
    main()
