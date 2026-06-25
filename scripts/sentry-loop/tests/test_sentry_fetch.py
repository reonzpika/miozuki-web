"""Tests for the Sentry response normalisers (no network). Run:
    python tests/test_sentry_fetch.py

Verifies that a raw Sentry issue object maps to the classifier's shape, and that
a raw event body's stack frames are extracted. The exact live-response shape
should still be spot-checked against a real API call at go-live (Layer 3).
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sentry_detect import _extract_stacktrace, normalise_issue  # noqa: E402

# Shape per docs.sentry.io list-a-projects-issues (2026-06-25).
RAW_ISSUE = {
    "id": "123456",
    "title": "TypeError /collections/[handle]",
    "culprit": "components/products-grid.tsx in ProductsGrid",
    "metadata": {"type": "TypeError", "value": "Cannot read properties of undefined (reading 'map')"},
    "level": "error",
    "permalink": "https://sentry.io/issues/123456/",
    "shortId": "MIOZUKI-WEB-7",
}

# Shape per docs.sentry.io event entries (exception -> values -> stacktrace -> frames).
RAW_EVENT = {
    "entries": [
        {
            "type": "exception",
            "data": {
                "values": [
                    {
                        "type": "TypeError",
                        "stacktrace": {
                            "frames": [
                                {"filename": "app/collections/[handle]/page.tsx", "function": "CollectionPage", "lineNo": 61},
                                {"filename": "components/products-grid.tsx", "function": "ProductsGrid", "lineNo": 24},
                            ]
                        },
                    }
                ]
            },
        }
    ]
}


def run() -> list[str]:
    failures: list[str] = []

    n = normalise_issue(RAW_ISSUE)
    if n["id"] != "123456":
        failures.append(f"id not mapped: {n['id']}")
    if n["metadata"]["type"] != "TypeError":
        failures.append("metadata.type not mapped")
    if not n["frames"] or n["frames"][0]["filename"] != RAW_ISSUE["culprit"]:
        failures.append(f"frames not seeded from culprit: {n['frames']}")
    if n["permalink"] != RAW_ISSUE["permalink"]:
        failures.append("permalink not mapped")

    st = _extract_stacktrace(RAW_EVENT)
    if "products-grid.tsx" not in st or "ProductsGrid" not in st:
        failures.append(f"stacktrace not extracted: {st!r}")
    if "page.tsx" not in st:
        failures.append("outer frame missing from stacktrace")

    # Empty / malformed events must not raise.
    if _extract_stacktrace({}) != "":
        failures.append("empty event should yield empty stacktrace")
    if _extract_stacktrace({"entries": [{"type": "message"}]}) != "":
        failures.append("non-exception entry should yield empty stacktrace")

    return failures


if __name__ == "__main__":
    fails = run()
    if fails:
        print("FAIL:")
        for f in fails:
            print("  -", f)
        sys.exit(1)
    print("OK: test_sentry_fetch")
