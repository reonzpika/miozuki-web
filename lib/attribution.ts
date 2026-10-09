import type { CartAttribute } from './shopify/cart-backend';
import { googleConsent, trackingPermission } from './tracking-privacy';

// Captures ad-click and GA4 identifiers on landing so a purchase can later be
// tied back to the session that produced it. URL parameters are captured
// immediately; Google identifiers are refreshed through its supported get API
// once the deferred tag loads and before the cart hands over to checkout.
//
// Capture and export are independently gated by Shopify's processing permission.

const STORAGE_KEY = 'miozuki-attribution';
const CAMPAIGN_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const GA_ID_MAX_AGE_MS = 30 * 60 * 1000;
let pendingLanding: string | undefined;
let capturedUrl: string | undefined;

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
  gaIdsAt?: string;
  campaignLandingPath?: string;
  campaignCapturedAt?: string;
}

export const ATTRIBUTION_ATTRIBUTE_KEYS = [
  '_gclid', '_gbraid', '_wbraid', '_utm_source', '_utm_medium', '_utm_campaign',
  '_utm_term', '_utm_content', '_landing_path', '_ga_client_id', '_ga_session_id',
  '_attribution_fallback_id', '_attribution_captured_at', '_campaign_landing_path',
  '_campaign_captured_at', '_analytics_permission', '_marketing_permission', '_ad_user_data_permission',
] as const;

function readExisting(): StoredAttribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const data = parsed as StoredAttribution;
    const campaignTime = Date.parse(data.campaignCapturedAt ?? data.capturedAt ?? '');
    if (!Number.isFinite(campaignTime) || Date.now() - campaignTime > CAMPAIGN_MAX_AGE_MS) {
      for (const key of TRACKED_URL_PARAMS) delete data[key];
      delete data.campaignCapturedAt;
      delete data.campaignLandingPath;
    }
    const idsTime = Date.parse(data.gaIdsAt ?? '');
    if (!Number.isFinite(idsTime) || Date.now() - idsTime > GA_ID_MAX_AGE_MS) {
      delete data.gaSessionId;
      delete data.gaClientId;
    }
    if (typeof data.gaClientId !== 'string' || !/^\d+\.\d+$/.test(data.gaClientId)) delete data.gaClientId;
    if (typeof data.gaSessionId !== 'string' || !/^\d+$/.test(data.gaSessionId)) delete data.gaSessionId;
    return data;
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
  pendingLanding ??= window.location.href;

  const analytics = trackingPermission('analytics');
  const marketing = trackingPermission('marketing');
  if (analytics === 'unknown' && marketing === 'unknown') return;
  if (analytics !== 'allowed' && marketing !== 'allowed') {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable */ }
    return;
  }

  const url = new URL(pendingLanding);
  const params = new URLSearchParams(url.search);
  const hasNewTrackingParams = TRACKED_URL_PARAMS.some((p) => params.has(p));

  const existing = readExisting();
  // A single explicit campaign replaces all old campaign fields, never mixes clicks.
  const freshCampaign = hasNewTrackingParams && marketing === 'allowed' && capturedUrl !== url.href;
  if (existing && !freshCampaign) {
    // Preserve the landing source; refreshAttributionIdentifiers updates IDs
    // separately when Google's deferred tag is available.
    if (marketing !== 'allowed') for (const key of TRACKED_URL_PARAMS) delete existing[key];
    if (analytics !== 'allowed') { delete existing.gaClientId; delete existing.gaSessionId; }
    write(existing);
    if (marketing !== 'unknown') { capturedUrl = url.href; pendingLanding = window.location.href; }
    return;
  }

  const data: StoredAttribution = {
    ...Object.fromEntries(TRACKED_URL_PARAMS.map(key => [key, freshCampaign ? params.get(key) ?? undefined : undefined])),
    landingPath: existing?.landingPath ?? url.pathname,
    gaClientId: analytics === 'allowed' ? existing?.gaClientId : undefined,
    gaSessionId: analytics === 'allowed' ? existing?.gaSessionId : undefined,
    gaIdsAt: analytics === 'allowed' ? existing?.gaIdsAt : undefined,
    fallbackId: existing?.fallbackId ?? crypto.randomUUID(),
    capturedAt: existing?.capturedAt ?? new Date().toISOString(),
    campaignLandingPath: freshCampaign ? url.pathname : undefined,
    campaignCapturedAt: freshCampaign ? new Date().toISOString() : undefined,
  };

  write(data);
  if (marketing !== 'unknown') { capturedUrl = url.href; pendingLanding = window.location.href; }
}

/** A blocked or unloaded tag must never hold up shopping indefinitely. */
export async function refreshAttributionIdentifiers(timeoutMs = 450): Promise<void> {
  if (typeof window === 'undefined') return;
  captureAttributionOnLanding();
  if (trackingPermission('analytics') !== 'allowed') return;
  const measurementId = process.env.NEXT_PUBLIC_GA4_ID;
  if (!measurementId || !window.gtag) return;
  await new Promise<void>((resolve) => {
    let remaining = 2;
    const timer = setTimeout(resolve, timeoutMs);
    const receive = (key: 'gaClientId' | 'gaSessionId', value: unknown) => {
      const text = typeof value === 'number' || typeof value === 'string' ? String(value) : '';
      const valid = key === 'gaClientId' ? /^\d+\.\d+$/.test(text) : /^\d+$/.test(text);
      const current = readExisting();
      if (current && valid && trackingPermission('analytics') === 'allowed') write({ ...current, [key]: text, gaIdsAt: new Date().toISOString() });
      if (--remaining === 0) {
        clearTimeout(timer);
        resolve();
      }
    };
    try {
      window.gtag!('get', measurementId, 'client_id', (value: unknown) => receive('gaClientId', value));
      window.gtag!('get', measurementId, 'session_id', (value: unknown) => receive('gaSessionId', value));
    } catch {
      clearTimeout(timer);
      resolve();
    }
  });
}

/**
 * Cart-attribute view of whatever's been captured, underscore-prefixed so
 * Shopify hides them from the customer at checkout. Blank values clear fields
 * from an existing cart. The fallback is never used as a Google identifier.
 */
export function getStoredAttributionAttributes(): CartAttribute[] {
  if (typeof window === 'undefined') return [];
  captureAttributionOnLanding();
  const data = readExisting();
  const analyticsAllowed = trackingPermission('analytics') === 'allowed';
  const marketingAllowed = trackingPermission('marketing') === 'allowed';

  const entries: [string, string | undefined][] = [
    ['_gclid', data?.gclid], ['_gbraid', data?.gbraid], ['_wbraid', data?.wbraid],
    ['_utm_source', data?.utm_source], ['_utm_medium', data?.utm_medium],
    ['_utm_campaign', data?.utm_campaign], ['_utm_term', data?.utm_term], ['_utm_content', data?.utm_content],
    ['_landing_path', data?.landingPath], ['_ga_client_id', data?.gaClientId], ['_ga_session_id', data?.gaSessionId],
    ['_attribution_fallback_id', data?.gaClientId ? undefined : data?.fallbackId],
    ['_attribution_captured_at', data?.capturedAt],
    ['_campaign_landing_path', data?.campaignLandingPath], ['_campaign_captured_at', data?.campaignCapturedAt],
    ['_analytics_permission', trackingPermission('analytics')], ['_marketing_permission', trackingPermission('marketing')],
    ['_ad_user_data_permission', googleConsent().ad_user_data === 'granted' ? 'allowed' : 'denied'],
  ];

  return entries
    .map(([key, value]) => {
      const permission = key.endsWith('_permission');
      const campaign = key.startsWith('_utm_') || ['_gclid', '_gbraid', '_wbraid', '_campaign_landing_path', '_campaign_captured_at'].includes(key);
      const permitted = permission || (campaign ? marketingAllowed : analyticsAllowed);
      return { key, value: permitted && typeof value === 'string' ? value : '' };
    });
}
