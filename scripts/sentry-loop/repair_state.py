"""State machine for the Sentry auto-fix loop.

Ported from the LinkedIn grow self-healing loop (cursor/LinkedIn/tools/repair_state.py).
No long-running process: state lives in a JSON file on disk and short-lived
scheduled runs read it and take the next step. This module owns that file:
atomic reads/writes, a best-effort lock, an attempt cap, and the ledger that
stops the loop ever re-touching an issue it already resolved or gave up on.

Status values:
    IDLE              nothing pending.
    NEEDS_TRIAGE      a fixable issue was queued; triage has not run yet.
    AWAITING_APPROVAL triage produced a verified fix on a branch and opened a PR;
                      waiting for Ryo to merge (Stage 1 is manual).
    FAILED            triage could not produce a verified fix; needs a human.

Only ONE repair is active at a time (NEEDS_TRIAGE or AWAITING_APPROVAL) so the
loop never opens a pile of PRs at once. Resolved and given-up issue ids go to the
`ledger`, which is the dedupe key: a ledgered issue is never re-queued.

The state file location can be overridden with SENTRY_LOOP_STATE_FILE so tests
do not touch the real file.
"""

from __future__ import annotations

import json
import os
import time
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterator

ROOT = Path(__file__).resolve().parent
NZ_TZ = timezone(timedelta(hours=12))

# Statuses
IDLE = "IDLE"
NEEDS_TRIAGE = "NEEDS_TRIAGE"
AWAITING_APPROVAL = "AWAITING_APPROVAL"
FAILED = "FAILED"

ACTIVE_STATUSES = (NEEDS_TRIAGE, AWAITING_APPROVAL)

# One automated triage attempt per issue. A second failure escalates to a human
# rather than looping (the direct antidote to runaway fix loops).
MAX_ATTEMPTS = 1

_LOCK_STALE_SECONDS = 3600


def _state_file() -> Path:
    override = os.environ.get("SENTRY_LOOP_STATE_FILE")
    if override:
        return Path(override)
    return ROOT / "state" / "repair_state.json"


def _now_iso() -> str:
    return datetime.now(NZ_TZ).isoformat(timespec="seconds")


def read_state() -> dict[str, Any]:
    """Return the current state dict, or an IDLE skeleton if the file is absent
    or unreadable. Never raises."""
    path = _state_file()
    if not path.exists():
        return {"status": IDLE, "ledger": {}}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and data.get("status"):
            data.setdefault("ledger", {})
            return data
    except Exception:
        pass
    return {"status": IDLE, "ledger": {}}


def write_state(state: dict[str, Any]) -> None:
    """Atomically write the state dict (temp file + os.replace)."""
    path = _state_file()
    path.parent.mkdir(parents=True, exist_ok=True)
    state = dict(state)
    state["updated_ts"] = _now_iso()
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(state, indent=2), encoding="utf-8")
    os.replace(tmp, path)


@contextmanager
def lock() -> Iterator[None]:
    """Best-effort exclusive lock so two launched runs cannot race on the state
    file. Breaks a stale lock older than an hour. Yields even if it cannot
    acquire after retries (the cadence makes real contention rare)."""
    lock_path = _state_file().with_suffix(".lock")
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    acquired = False
    for _ in range(25):  # ~5s of retries
        try:
            fd = os.open(str(lock_path), os.O_CREAT | os.O_EXCL | os.O_RDWR)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            acquired = True
            break
        except FileExistsError:
            try:
                age = time.time() - lock_path.stat().st_mtime
                if age > _LOCK_STALE_SECONDS:
                    lock_path.unlink(missing_ok=True)
                    continue
            except FileNotFoundError:
                continue
            time.sleep(0.2)
    try:
        yield
    finally:
        if acquired:
            lock_path.unlink(missing_ok=True)


def is_active(state: dict[str, Any] | None = None) -> bool:
    """True if a repair is already in flight (so we do not stack a second one)."""
    s = state if state is not None else read_state()
    return s.get("status") in ACTIVE_STATUSES


def in_ledger(issue_id: str, state: dict[str, Any] | None = None) -> bool:
    """True if this issue was already resolved or given up on."""
    s = state if state is not None else read_state()
    return issue_id in (s.get("ledger") or {})


def request_repair(
    *,
    issue_id: str,
    title: str,
    culprit: str,
    error_excerpt: str,
    permalink: str = "",
) -> bool:
    """Write a NEEDS_TRIAGE request, unless a repair is already active or this
    issue is already ledgered. Returns True if a new request was written.

    Caller must have confirmed the issue is auto-fixable (failure_classes)."""
    with lock():
        state = read_state()
        if is_active(state):
            return False
        if in_ledger(issue_id, state):
            return False
        ledger = state.get("ledger") or {}
        write_state(
            {
                "status": NEEDS_TRIAGE,
                "issue_id": issue_id,
                "title": title,
                "culprit": culprit,
                "error_excerpt": error_excerpt[:2000],
                "permalink": permalink,
                "attempt_count": 0,
                "branch": None,
                "proposal": None,
                "created_ts": _now_iso(),
                "ledger": ledger,
            }
        )
        return True


def begin_attempt() -> dict[str, Any] | None:
    """Mark a triage attempt as started. Returns the state if the attempt may
    proceed, or None if there is nothing to do or the attempt cap is reached."""
    with lock():
        state = read_state()
        if state.get("status") != NEEDS_TRIAGE:
            return None
        if int(state.get("attempt_count", 0)) >= MAX_ATTEMPTS:
            return None
        state["attempt_count"] = int(state.get("attempt_count", 0)) + 1
        write_state(state)
        return state


def set_status(status: str, **fields: Any) -> dict[str, Any]:
    """Update status (and any extra fields) on the current state, atomically."""
    with lock():
        state = read_state()
        state["status"] = status
        for k, v in fields.items():
            state[k] = v
        write_state(state)
        return state


def _ledger_and_idle(issue_id: str, outcome: str) -> dict[str, Any]:
    """Record a terminal outcome for an issue and return to IDLE so the loop can
    move on to a different issue. The ledger entry prevents this issue ever being
    re-queued."""
    with lock():
        state = read_state()
        ledger = state.get("ledger") or {}
        if issue_id:
            ledger[issue_id] = outcome
        write_state({"status": IDLE, "ledger": ledger, "last_outcome": outcome,
                     "last_issue_id": issue_id})
        return read_state()


def accept(issue_id: str) -> dict[str, Any]:
    """Mark a proposed fix as accepted (merged). Stage 2 will call this on PR
    merge; in Stage 1 it is run by hand after merging."""
    return _ledger_and_idle(issue_id, "DONE")


def give_up(issue_id: str) -> dict[str, Any]:
    """Mark an issue as failed: ledger it (so it is not retried) and go IDLE."""
    return _ledger_and_idle(issue_id, "FAILED")


def clear() -> None:
    """Reset status to IDLE, preserving the ledger. Used to abandon an in-flight
    repair without ledgering the issue (so it could be re-picked later)."""
    with lock():
        state = read_state()
        write_state({"status": IDLE, "ledger": state.get("ledger") or {},
                     "cleared_ts": _now_iso()})
