"""Whitelist classifier for the Sentry auto-fix loop.

This is the single most important safety control. It decides whether a Sentry
issue is even ELIGIBLE for an automated fix attempt. It is the inverse of the
LinkedIn grow loop's "is this a selector break" gate: here we ask "is this safe
to even attempt", and the default answer is NO.

Categories:
    fixable_candidate   Our own code, a recognisable runtime bug, nothing
                        sensitive. May be attempted (a human still approves the PR).
    excluded_sensitive  Touches checkout / cart / payments / auth / account /
                        server API routes / env / secrets. NEVER auto-attempted.
    noise               Third-party / injected script (Meta in-app browser,
                        browser extensions, ResizeObserver spam). Should be
                        FILTERED in Sentry, not "fixed".
    unknown             Did not match a fixable pattern. Not auto-attempted;
                        notify only.

Conservative by construction: only `fixable_candidate` is ever auto-attempted,
and a match against a sensitive or noise pattern wins over a fixable one.
Pattern fixtures live in tests/test_failure_classes.py.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum


class Category(str, Enum):
    FIXABLE_CANDIDATE = "fixable_candidate"
    EXCLUDED_SENSITIVE = "excluded_sensitive"
    NOISE = "noise"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class Classification:
    category: Category
    auto_fixable: bool
    reason: str


# Sensitive surfaces. If the issue's culprit or any stack-frame file touches one
# of these, it is permanently off-limits to automated fixing. Money, identity,
# data mutation, and secrets are never worth the risk of an autonomous change.
_SENSITIVE_PATTERNS = (
    re.compile(r"checkout", re.IGNORECASE),
    re.compile(r"\bcart\b", re.IGNORECASE),
    re.compile(r"payment|stripe|billing|invoice", re.IGNORECASE),
    re.compile(r"\bauth\b|login|sign[\s-]?in|signup|account|password|session", re.IGNORECASE),
    re.compile(r"token|secret|api[\s-]?key|credential", re.IGNORECASE),
    re.compile(r"/api/", re.IGNORECASE),          # server route handlers (mutating)
    re.compile(r"\.env", re.IGNORECASE),
    re.compile(r"route\.ts", re.IGNORECASE),       # Next.js server route handlers
)

# Third-party noise. Not our code; fixing is impossible and "fixing" is wrong.
# These belong in Sentry's ignore rules instead.
_NOISE_PATTERNS = (
    re.compile(r"webkit\.messageHandlers", re.IGNORECASE),
    re.compile(r"sendDataToNative", re.IGNORECASE),
    re.compile(r"fbclid", re.IGNORECASE),
    re.compile(r"chrome-extension://|moz-extension://|safari-extension://", re.IGNORECASE),
    re.compile(r"ResizeObserver loop", re.IGNORECASE),
    re.compile(r"Non-Error promise rejection", re.IGNORECASE),
    re.compile(r"Facebook|Instagram|FBAN|FBAV", re.IGNORECASE),
)

# Transient infrastructure failures. These surface as JS TypeErrors ("fetch
# failed") or 5xx text but are NOT code bugs: they are upstream/network blips,
# handled by retry/resilience, not by an autonomous code change. Excluded even
# when the error type looks fixable.
_TRANSIENT_PATTERNS = (
    re.compile(r"fetch failed", re.IGNORECASE),
    re.compile(r"ConnectTimeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND", re.IGNORECASE),
    re.compile(r"NetworkError|Load failed|network request failed", re.IGNORECASE),
    re.compile(r"\b50[234]\b|Bad Gateway|Gateway Timeout|Service Unavailable", re.IGNORECASE),
    re.compile(r"socket hang up|aborted", re.IGNORECASE),
)

# Our own source roots. A fixable bug must originate in code we control.
_OWN_CODE_PATTERNS = (
    re.compile(r"(^|[/\\])app[/\\]", re.IGNORECASE),
    re.compile(r"(^|[/\\])components[/\\]", re.IGNORECASE),
    re.compile(r"(^|[/\\])lib[/\\]", re.IGNORECASE),
)

# Recognisable, narrowly-scoped runtime bugs we are willing to attempt.
_FIXABLE_ERROR_PATTERNS = (
    re.compile(r"undefined is not an object", re.IGNORECASE),
    re.compile(r"null is not an object", re.IGNORECASE),
    re.compile(r"Cannot read propert(y|ies) of (undefined|null)", re.IGNORECASE),
    re.compile(r"is not a function", re.IGNORECASE),
    re.compile(r"is not defined", re.IGNORECASE),
    re.compile(r"\bTypeError\b", re.IGNORECASE),
    re.compile(r"\bReferenceError\b", re.IGNORECASE),
)


def _searchable_text(issue: dict) -> str:
    """Flatten the parts of a Sentry issue we classify against: title, culprit,
    the error type/value, and every stack-frame filename."""
    parts: list[str] = [
        str(issue.get("title", "")),
        str(issue.get("culprit", "")),
        str(issue.get("transaction", "")),
    ]
    meta = issue.get("metadata") or {}
    parts.append(str(meta.get("type", "")))
    parts.append(str(meta.get("value", "")))
    for frame in issue.get("frames", []) or []:
        parts.append(str(frame.get("filename", "")))
        parts.append(str(frame.get("abs_path", "")))
    parts.append(str(issue.get("url", "")))
    return "\n".join(parts)


def _frame_files(issue: dict) -> list[str]:
    files: list[str] = []
    if issue.get("culprit"):
        files.append(str(issue["culprit"]))
    for frame in issue.get("frames", []) or []:
        for key in ("filename", "abs_path"):
            if frame.get(key):
                files.append(str(frame[key]))
    return files


def classify_issue(issue: dict) -> Classification:
    """Classify a Sentry issue. Order is deliberate: noise and sensitive matches
    win over a fixable match, and anything unrecognised stays UNKNOWN."""
    text = _searchable_text(issue)
    files = _frame_files(issue)

    if any(p.search(text) for p in _NOISE_PATTERNS):
        return Classification(
            Category.NOISE,
            auto_fixable=False,
            reason="third-party/injected script; filter in Sentry, do not fix",
        )

    if any(p.search(text) for p in _SENSITIVE_PATTERNS):
        return Classification(
            Category.EXCLUDED_SENSITIVE,
            auto_fixable=False,
            reason="touches a sensitive surface (payments/auth/api/secrets); never auto-fix",
        )

    if any(p.search(text) for p in _TRANSIENT_PATTERNS):
        return Classification(
            Category.UNKNOWN,
            auto_fixable=False,
            reason="transient infrastructure/network failure; handled by retry, not a code fix",
        )

    own_code = any(p.search(f) for f in files for p in _OWN_CODE_PATTERNS)
    known_bug = any(p.search(text) for p in _FIXABLE_ERROR_PATTERNS)
    if own_code and known_bug:
        return Classification(
            Category.FIXABLE_CANDIDATE,
            auto_fixable=True,
            reason="recognised runtime bug in our own code; eligible for a proposed fix",
        )

    return Classification(
        Category.UNKNOWN,
        auto_fixable=False,
        reason="no fixable pattern matched; notify only",
    )


def is_auto_fixable(issue: dict) -> bool:
    return classify_issue(issue).auto_fixable
