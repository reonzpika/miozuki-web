"""Detector for the Sentry auto-fix loop (Trigger step).

Ported from the detector half of the LinkedIn grow safety check. Fetches recent
Sentry issues for miozuki-web, classifies each against the whitelist, and queues
the first auto-fixable one that is not already in the ledger.

SCAFFOLD STATUS: the live Sentry fetch is intentionally NOT wired yet. Run it in
fixture mode to exercise the full path without any network call:

    SENTRY_LOOP_FIXTURE=scripts/sentry-loop/fixtures/sample_issues.json \\
        python scripts/sentry-loop/sentry_detect.py

Going live later means implementing `_fetch_live_issues()` against the Sentry
REST API (needs a SENTRY_AUTH_TOKEN + org/project slugs) and removing the guard.

Exit codes:
  0 - nothing to queue (no fixable, fresh issue)
  2 - a fixable issue was queued (NEEDS_TRIAGE written)
  3 - a repair is already active; left it alone
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import repair_state  # noqa: E402
from failure_classes import Category, classify_issue  # noqa: E402


def _load_fixture(path: str) -> list[dict]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, dict):
        data = data.get("issues", [])
    return data if isinstance(data, list) else []


def _fetch_live_issues() -> list[dict]:
    """Live Sentry fetch. Deliberately unimplemented in the scaffold so the loop
    cannot touch production Sentry until this is built and reviewed.

    To implement: GET the Sentry issues endpoint for the project, filtered to
    unresolved + environment:production + level:error, and normalise each into
    {id, title, culprit, transaction, metadata{type,value}, frames[{filename}],
    permalink}. Keep this function deterministic (no LLM)."""
    raise NotImplementedError(
        "Live Sentry fetch is not wired in the scaffold. "
        "Set SENTRY_LOOP_FIXTURE to a fixtures JSON to dry-run the detector."
    )


def get_issues() -> list[dict]:
    fixture = os.environ.get("SENTRY_LOOP_FIXTURE")
    if fixture:
        return _load_fixture(fixture)
    return _fetch_live_issues()


def run_detect() -> int:
    if repair_state.is_active():
        print(f"[detect] repair already active (status={repair_state.read_state().get('status')}); skipping")
        return 3

    issues = get_issues()
    print(f"[detect] considering {len(issues)} issue(s)")

    queued = 0
    for issue in issues:
        issue_id = str(issue.get("id", "")).strip()
        if not issue_id:
            continue
        cls = classify_issue(issue)
        marker = {
            Category.FIXABLE_CANDIDATE: "FIXABLE",
            Category.EXCLUDED_SENSITIVE: "skip (sensitive)",
            Category.NOISE: "skip (noise; filter in Sentry)",
            Category.UNKNOWN: "skip (unknown)",
        }[cls.category]
        ledgered = repair_state.in_ledger(issue_id)
        suffix = " [already in ledger]" if ledgered else ""
        print(f"[detect]   {issue_id}: {marker}{suffix} - {issue.get('title', '')[:80]}")

        if not cls.auto_fixable or ledgered:
            continue

        written = repair_state.request_repair(
            issue_id=issue_id,
            title=str(issue.get("title", "")),
            culprit=str(issue.get("culprit", "")),
            error_excerpt=_error_excerpt(issue),
            permalink=str(issue.get("permalink", "")),
        )
        if written:
            print(f"[detect] queued repair for {issue_id}")
            queued = 1
            break  # one at a time

    if not queued:
        print("[detect] nothing queued")
        return 0
    return 2


def _error_excerpt(issue: dict) -> str:
    meta = issue.get("metadata") or {}
    frames = issue.get("frames") or []
    top = frames[0].get("filename", "") if frames else ""
    return (
        f"{meta.get('type', '')}: {meta.get('value', '')}\n"
        f"culprit: {issue.get('culprit', '')}\n"
        f"top frame: {top}\n"
        f"title: {issue.get('title', '')}"
    )


if __name__ == "__main__":
    sys.exit(run_detect())
