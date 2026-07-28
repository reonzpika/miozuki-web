import type { CartAttribute } from './shopify/cart-backend';

// Captures ad-click and GA4 identifiers on landing so a purchase can later be
// tied back to the session that produced it. Pure JS, first-party only — does
// not depend on gtag.js having loaded (see components/deferred-analytics.tsx,
// which defers that load), so this works even for a visitor who converts
// before the deferred script attaches.
//
// GCLID (Google Ads' click id) capture requires no consent gate: this store
// currently ships no cookie-consent banner for its NZ/AU market (confirmed
// live in Shopify Admin, 22 Jul 2026) and this module only reads/writes
// first-party storage, no third-party script involved.

const STORAGE_KEY = 'miozuki-attribution';

const TRACKED_URL_PARAMS = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

interface StoredAttribution {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landingPath?: string;
  gaClientId?: string;
  gaSessionId?: string;
  fallbackId?: string;
  capturedAt?: string;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// GA4's session cookie is named _ga_<measurement id, minus the "G-" prefix>.
function gaSessionCookieName(): string | null {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
  if (!gaId) return null;
  const suffix = gaId.replace(/^G-/, '');
  return `_ga_${suffix}`;
}

// GA4's session cookie value looks like GS1.1.<session_id>.<...>; the session
// id is the third dot-delimited field.
function parseGaSessionId(rawCookieValue: string): string | undefined {
  const parts = rawCookieValue.split('.');
  return parts.length >= 3 ? parts[2] : undefined;
}

function readExisting(): StoredAttribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAttribution) : null;
  } catch {
    return null;
  }
}

function write(data: StoredAttribution) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* best-effort only, e.g. Safari private mode */
  }
}

/**
 * Call once on app mount. Captures tracking params from the current URL and
 * refreshes GA4 client/session ids whenever new tracking params are present
 * (a fresh ad click), otherwise leaves previously-captured data alone so a
 * later direct/organic page view doesn't overwrite a genuine ad-driven landing.
 */
export function captureAttributionOnLanding() {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const hasNewTrackingParams = TRACKED_URL_PARAMS.some((p) => params.has(p));

  const existing = readExisting();
  if (existing && !hasNewTrackingParams) {
    // No new ad-click/campaign params on this page view — still worth
    // refreshing the GA4 ids if they weren't captured yet (e.g. gtag.js
    // hadn't set its cookies on the very first landing).
    if (!existing.gaClientId || !existing.gaSessionId) {
      const clientId = readCookie('_ga')?.split('.').slice(-2).join('.');
      const sessionCookieName = gaSessionCookieName();
      const sessionRaw = sessionCookieName ? readCookie(sessionCookieName) : null;
      const sessionId = sessionRaw ? parseGaSessionId(sessionRaw) : undefined;
      if (clientId || sessionId) {
        write({ ...existing, gaClientId: clientId ?? existing.gaClientId, gaSessionId: sessionId ?? existing.gaSessionId });
      }
    }
    return;
  }

  const clientId = readCookie('_ga')?.split('.').slice(-2).join('.');
  const sessionCookieName = gaSessionCookieName();
  const sessionRaw = sessionCookieName ? readCookie(sessionCookieName) : null;
  const sessionId = sessionRaw ? parseGaSessionId(sessionRaw) : undefined;

  const data: StoredAttribution = {
    gclid: params.get('gclid') ?? existing?.gclid,
    gbraid: params.get('gbraid') ?? existing?.gbraid,
    wbraid: params.get('wbraid') ?? existing?.wbraid,
    utm_source: params.get('utm_source') ?? existing?.utm_source,
    utm_medium: params.get('utm_medium') ?? existing?.utm_medium,
    utm_campaign: params.get('utm_campaign') ?? existing?.utm_campaign,
    utm_term: params.get('utm_term') ?? existing?.utm_term,
    utm_content: params.get('utm_content') ?? existing?.utm_content,
    landingPath: existing?.landingPath ?? url.pathname,
    gaClientId: clientId ?? existing?.gaClientId,
    gaSessionId: sessionId ?? existing?.gaSessionId,
    fallbackId: existing?.fallbackId ?? crypto.randomUUID(),
    capturedAt: existing?.capturedAt ?? new Date().toISOString(),
  };

  write(data);
}

/**
 * Cart-attribute view of whatever's been captured, underscore-prefixed so
 * Shopify hides them from the customer at checkout. Only non-empty fields are
 * included. Falls back to a generated id when GA4 never set its cookies (e.g.
 * a fully-blocked session) so the order still carries *something* to key on.
 */
export function getStoredAttributionAttributes(): CartAttribute[] {
  if (typeof window === 'undefined') return [];
  const data = readExisting();
  if (!data) return [];

  const entries: [string, string | undefined][] = [
    ['_gclid', data.gclid],
    ['_gbraid', data.gbraid],
    ['_wbraid', data.wbraid],
    ['_utm_source', data.utm_source],
    ['_utm_medium', data.utm_medium],
    ['_utm_campaign', data.utm_campaign],
    ['_utm_term', data.utm_term],
    ['_utm_content', data.utm_content],
    ['_landing_path', data.landingPath],
    ['_ga_client_id', data.gaClientId],
    ['_ga_session_id', data.gaSessionId],
    ['_attribution_fallback_id', data.gaClientId ? undefined : data.fallbackId],
    ['_attribution_captured_at', data.capturedAt],
  ];

  return entries
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0)
    .map(([key, value]) => ({ key, value }));
}
