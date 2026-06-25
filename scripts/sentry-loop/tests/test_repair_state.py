"""Tests for the state machine. Run: python tests/test_repair_state.py

Covers the two safety-critical behaviours: the attempt cap (one triage per
issue, then escalate) and the dedupe ledger (a resolved or given-up issue is
never re-queued), plus one-repair-at-a-time.
"""

from __future__ import annotations

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

    import importlib
    import repair_state
    importlib.reload(repair_state)  # pick up the env override cleanly

    def check(cond: bool, msg: str) -> None:
        if not cond:
            failures.append(msg)

    # Fresh state is idle.
    check(repair_state.read_state().get("status") == repair_state.IDLE, "fresh state should be IDLE")
    check(not repair_state.is_active(), "fresh state should not be active")

    # Queue issue A.
    check(repair_state.request_repair(issue_id="A", title="t", culprit="c", error_excerpt="e"),
          "first request_repair should write")
    check(repair_state.is_active(), "should be active after queuing")

    # One at a time: B is refused while A is active.
    check(not repair_state.request_repair(issue_id="B", title="t", culprit="c", error_excerpt="e"),
          "second request while active should be refused")

    # Attempt cap: one attempt, then None.
    check(repair_state.begin_attempt() is not None, "first begin_attempt should proceed")
    check(repair_state.begin_attempt() is None, "second begin_attempt should hit the cap")

    # Give up on A: ledgered, back to IDLE.
    repair_state.give_up("A")
    check(repair_state.read_state().get("status") == repair_state.IDLE, "should be IDLE after give_up")
    check(repair_state.in_ledger("A"), "A should be in the ledger")

    # A is never re-queued.
    check(not repair_state.request_repair(issue_id="A", title="t", culprit="c", error_excerpt="e"),
          "ledgered issue A should never be re-queued")

    # A fresh issue C can be queued, then accepted.
    check(repair_state.request_repair(issue_id="C", title="t", culprit="c", error_excerpt="e"),
          "fresh issue C should queue")
    repair_state.accept("C")
    check(repair_state.in_ledger("C"), "C should be ledgered after accept")
    check(repair_state.read_state().get("ledger", {}).get("C") == "DONE", "C ledger entry should be DONE")
    check(repair_state.read_state().get("ledger", {}).get("A") == "FAILED", "A ledger entry should be FAILED")

    del os.environ["SENTRY_LOOP_STATE_FILE"]
    return failures


if __name__ == "__main__":
    fails = run()
    if fails:
        print("FAIL:")
        for f in fails:
            print("  -", f)
        sys.exit(1)
    print("OK: test_repair_state")
