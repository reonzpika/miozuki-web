"""Tests for the whitelist classifier. Run: python tests/test_failure_classes.py

The load-bearing assertions: payments/auth/api and noise are NEVER auto-fixable,
transient network blips are not treated as code bugs, and only a genuine runtime
bug in our own code is eligible.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from failure_classes import Category, classify_issue, is_auto_fixable  # noqa: E402

FIXTURE = ROOT / "fixtures" / "sample_issues.json"

EXPECTED = {
    "miozuki-502": Category.UNKNOWN,
    "miozuki-fetch-failed": Category.UNKNOWN,
    "miozuki-webkit": Category.NOISE,
    "miozuki-grid-bug": Category.FIXABLE_CANDIDATE,
    "miozuki-cart-bug": Category.EXCLUDED_SENSITIVE,
}


def _issue(culprit: str, value: str, etype: str = "TypeError") -> dict:
    return {
        "id": "synthetic",
        "title": etype,
        "culprit": culprit,
        "metadata": {"type": etype, "value": value},
        "frames": [{"filename": culprit}],
    }


def run() -> list[str]:
    failures: list[str] = []
    issues = json.loads(FIXTURE.read_text(encoding="utf-8"))["issues"]

    for issue in issues:
        got = classify_issue(issue).category
        exp = EXPECTED[issue["id"]]
        if got != exp:
            failures.append(f"{issue['id']}: expected {exp.value}, got {got.value}")

    fixable = [i["id"] for i in issues if is_auto_fixable(i)]
    if fixable != ["miozuki-grid-bug"]:
        failures.append(f"only miozuki-grid-bug should be auto-fixable, got {fixable}")

    # Sensitive surfaces must never be auto-fixable, even with a fixable error type.
    null_read = "Cannot read properties of undefined (reading 'x')"
    for sensitive in (
        "app/checkout/page.tsx",
        "components/login-form.tsx",
        "app/api/orders/route.ts",
        "lib/auth/session.ts",
    ):
        if is_auto_fixable(_issue(sensitive, null_read)):
            failures.append(f"sensitive path must not be auto-fixable: {sensitive}")

    # Noise must never be auto-fixable.
    if is_auto_fixable(_issue("components/x.tsx", "evaluating 'window.webkit.messageHandlers'")):
        failures.append("webkit noise must not be auto-fixable")

    # Transient must never be auto-fixable, even as a TypeError in our code.
    for transient in ("fetch failed", "ECONNRESET", "502 Bad Gateway"):
        if is_auto_fixable(_issue("lib/data.ts", transient)):
            failures.append(f"transient must not be auto-fixable: {transient}")

    # A genuine own-code null bug IS fixable.
    if not is_auto_fixable(_issue("components/grid.tsx", null_read)):
        failures.append("a genuine own-code null bug should be auto-fixable")

    # Third-party node_modules code is not our own code; not fixable.
    if is_auto_fixable(_issue("node_modules/some-lib/index.js", null_read)):
        failures.append("node_modules code must not be auto-fixable")

    return failures


if __name__ == "__main__":
    fails = run()
    if fails:
        print("FAIL:")
        for f in fails:
            print("  -", f)
        sys.exit(1)
    print("OK: test_failure_classes")
