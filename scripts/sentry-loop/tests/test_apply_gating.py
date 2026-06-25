"""Tests for the deterministic apply/reject helper's GATING. Run:
    python tests/test_apply_gating.py

We cannot test the real push/PR without a remote, so this covers the safety
gates: apply refuses unless AWAITING_APPROVAL, and reject ledgers the issue
REJECTED and returns to IDLE. Uses a temp state file (no real state touched).
"""

from __future__ import annotations

import importlib
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def run() -> list[str]:
    failures: list[str] = []
    tmp = Path(tempfile.mkdtemp()) / "repair_state.json"
    os.environ["SENTRY_LOOP_STATE_FILE"] = str(tmp)

    import repair_state
    importlib.reload(repair_state)
    import sentry_repair_apply
    importlib.reload(sentry_repair_apply)

    def check(cond: bool, msg: str) -> None:
        if not cond:
            failures.append(msg)

    # apply refuses when nothing is awaiting approval (fresh IDLE state).
    check(sentry_repair_apply.apply_fix() == 1, "apply must refuse when not AWAITING_APPROVAL")

    # Park a bogus AWAITING_APPROVAL, then reject: branch is bogus (delete is a
    # no-op), issue must be ledgered REJECTED and state returned to IDLE.
    repair_state.write_state({
        "status": repair_state.AWAITING_APPROVAL,
        "issue_id": "ISSUE-Z",
        "branch": "fix/sentry-auto-nonexistent-test-000000",
        "base_branch": "master",
        "approval_pid": None,
        "ledger": {},
    })
    rc = sentry_repair_apply.reject_fix()
    check(rc == 0, "reject should return 0")
    st = repair_state.read_state()
    check(repair_state.in_ledger("ISSUE-Z"), "rejected issue should be ledgered")
    check(st.get("ledger", {}).get("ISSUE-Z") == "REJECTED", "ledger entry should be REJECTED")
    check(st.get("status") == repair_state.IDLE, "state should be IDLE after reject")

    # apply still refuses now that we are back to IDLE.
    check(sentry_repair_apply.apply_fix() == 1, "apply must refuse again at IDLE")

    del os.environ["SENTRY_LOOP_STATE_FILE"]
    return failures


if __name__ == "__main__":
    fails = run()
    if fails:
        print("FAIL:")
        for f in fails:
            print("  -", f)
        sys.exit(1)
    print("OK: test_apply_gating")
