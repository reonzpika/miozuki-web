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
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import repair_state  # noqa: E402
from failure_classes import Category, classify_issue  # noqa: E402

# Sentry REST API. Endpoints verified against docs.sentry.io 2026-06-25:
#   list issues:  GET /api/0/projects/{org}/{project}/issues/
#   issue events: GET /api/0/organizations/{org}/issues/{id}/events/?full=true
# Auth is a Bearer token with event:read scope.
SENTRY_API_BASE = os.environ.get("SENTRY_API_BASE", "https://sentry.io/api/0")


def _load_fixture(path: str) -> list[dict]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, dict):
        data = data.get("issues", [])
    return data if isinstance(data, list) else []


def _sentry_get(path: str, params: dict | None = None) -> object:
    token = os.environ.get("SENTRY_AUTH_TOKEN", "").strip()
    if not token:
        raise RuntimeError("SENTRY_AUTH_TOKEN not set; cannot do a live Sentry fetch")
    url = f"{SENTRY_API_BASE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310 (trusted host)
        return json.loads(resp.read().decode("utf-8"))


def normalise_issue(raw: dict) -> dict:
    """Map a raw Sentry issue object to the shape the classifier expects. The
    issue-list endpoint does not return stack frames, so we seed `frames` from
    the culprit (which carries the file/function); the repair step enriches the
    error excerpt with the full stack trace for the one issue we queue."""
    meta = raw.get("metadata") or {}
    culprit = str(raw.get("culprit") or "")
    return {
        "id": str(raw.get("id", "")),
        "title": str(raw.get("title", "")),
        "culprit": culprit,
        "transaction": culprit,
        "level": str(raw.get("level", "")),
        "metadata": {"type": str(meta.get("type", "")), "value": str(meta.get("value", ""))},
        "frames": [{"filename": culprit}] if culprit else [],
        "permalink": str(raw.get("permalink", "")),
        "shortId": str(raw.get("shortId", "")),
    }


def _extract_stacktrace(event: dict) -> str:
    """Pull a compact stack-trace string from a Sentry event body. Defensive: the
    exact entry shape should be spot-checked against a real response at go-live."""
    lines: list[str] = []
    for entry in event.get("entries", []) or []:
        if entry.get("type") not in ("exception", "stacktrace"):
            continue
        data = entry.get("data") or {}
        values = data.get("values") or ([data] if data.get("stacktrace") else [])
        for val in values:
            st = val.get("stacktrace") or {}
            for frame in st.get("frames", []) or []:
                fn = frame.get("filename") or frame.get("absPath") or ""
                func = frame.get("function") or ""
                line = frame.get("lineNo") or frame.get("lineno") or ""
                lines.append(f"  at {func} ({fn}:{line})")
    return "\n".join(lines[-20:])  # innermost frames


def _fetch_issue_stacktrace(issue_id: str) -> str:
    org = os.environ.get("SENTRY_ORG", "").strip()
    try:
        events = _sentry_get(f"/organizations/{org}/issues/{issue_id}/events/",
                             {"full": "true", "per_page": "1"})
        if isinstance(events, list) and events:
            return _extract_stacktrace(events[0])
    except Exception as e:  # enrichment is best-effort, never fatal
        print(f"[detect] stacktrace fetch failed for {issue_id}: {e}", file=sys.stderr)
    return ""


def _fetch_live_issues() -> list[dict]:
    """Live Sentry fetch: unresolved production errors for the project, newest
    high-frequency first. Deterministic (no LLM). Requires SENTRY_AUTH_TOKEN,
    SENTRY_ORG, SENTRY_PROJECT in the environment."""
    org = os.environ.get("SENTRY_ORG", "").strip()
    project = os.environ.get("SENTRY_PROJECT", "").strip()
    if not org or not project:
        raise RuntimeError("SENTRY_ORG and SENTRY_PROJECT must be set for a live fetch")
    params = {
        "query": "is:unresolved level:error",
        "statsPeriod": "14d",
        "sort": "freq",
        "limit": "25",
    }
    env = os.environ.get("SENTRY_ENVIRONMENT", "production").strip()
    if env:
        params["environment"] = env
    raw = _sentry_get(f"/projects/{org}/{project}/issues/", params)
    if not isinstance(raw, list):
        return []
    return [normalise_issue(r) for r in raw]


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
