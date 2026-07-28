// Uploads paid-order conversions to Google Ads via the Data Manager API
// (datamanager.googleapis.com), the current (2026) replacement for the
// classic Ads-API offline-conversion-upload path, which is closed to new
// adopters as of 15 Jun 2026. No Google Ads developer token is used or
// needed for this API.
//
// Auth shape mirrors lib/admin/gsc.ts / lib/admin/analytics.ts: a Google
// Cloud service account, credentials loaded from env, graceful null when
// unset. This is a SEPARATE, NEW service account from GA_SA_* — that one is
// a read-only GA4/GSC Viewer account with no Ads access, wrong tool for this.
//
// Env:
//   GOOGLE_ADS_DM_SA_CLIENT_EMAIL   new service-account email (Ads "Users and access")
//   GOOGLE_ADS_DM_SA_PRIVATE_KEY    its private key (literal \n is fine)
//   GOOGLE_ADS_DM_OPERATING_ACCOUNT_ID   Google Ads customer id, e.g. 9619471172
//   GOOGLE_ADS_DM_CONVERSION_ACTION_ID   the dedicated upload-type conversion action id
//   GOOGLE_ADS_DM_UPLOAD_ENABLED    unset/false = build+log only (Stage 0);
//                                    "true" = real POST, forces validateOnly (Stage 1);
//                                    "live" = real POST, validateOnly=false (Stage 2)

import { GoogleAuth } from 'google-auth-library';

const INGEST_URL = 'https://datamanager.googleapis.com/v1/events:ingest';
const SCOPE = 'https://www.googleapis.com/auth/datamanager';

let cachedAuth: GoogleAuth | null = null;

function getAuth(): GoogleAuth | null {
  const clientEmail = process.env.GOOGLE_ADS_DM_SA_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_ADS_DM_SA_PRIVATE_KEY;
  if (!clientEmail || !rawKey) return null;
  if (cachedAuth) return cachedAuth;
  const privateKey = rawKey.replace(/\\n/g, '\n');
  cachedAuth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [SCOPE],
  });
  return cachedAuth;
}

export interface AttributionAttributes {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
}

export interface OrderForUpload {
  id: number;
  createdAt: string; // ISO 8601, order's created_at
  totalPrice: string;
  currency: string;
  hashedEmail?: string;
}

export type UploadStage = 'disabled' | 'validate' | 'live';

export function getUploadStage(): UploadStage {
  const flag = process.env.GOOGLE_ADS_DM_UPLOAD_ENABLED;
  if (flag === 'live') return 'live';
  if (flag === 'true') return 'validate';
  return 'disabled';
}

/** Pure — no network call. Always callable so the shape can be logged before uploads are enabled. */
export function buildIngestEventBody(
  order: OrderForUpload,
  attribution: AttributionAttributes,
  opts: { validateOnly: boolean }
): Record<string, unknown> | null {
  const accountId = process.env.GOOGLE_ADS_DM_OPERATING_ACCOUNT_ID;
  const conversionActionId = process.env.GOOGLE_ADS_DM_CONVERSION_ACTION_ID;
  if (!accountId || !conversionActionId) return null;

  const adIdentifiers: Record<string, string> = {};
  if (attribution.gclid) adIdentifiers.gclid = attribution.gclid;
  if (attribution.gbraid) adIdentifiers.gbraid = attribution.gbraid;
  if (attribution.wbraid) adIdentifiers.wbraid = attribution.wbraid;

  const event: Record<string, unknown> = {
    eventTimestamp: order.createdAt,
    // Required by the API for an upload like this (confirmed live 25 Jul
    // 2026: omitting it fails with events.events[0].event_source /
    // REQUIRED_FIELD_MISSING). WEB is correct even though this is a
    // server-side upload, because the underlying purchase happened on the
    // web storefront, not in-app/in-store/phone.
    eventSource: 'WEB',
    transactionId: String(order.id),
    currency: order.currency,
    conversionValue: Number(order.totalPrice),
  };
  if (Object.keys(adIdentifiers).length) event.adIdentifiers = adIdentifiers;
  if (order.hashedEmail) {
    event.userData = { userIdentifiers: [{ emailAddress: order.hashedEmail }] };
  }

  return {
    destinations: [
      {
        operatingAccount: { accountType: 'GOOGLE_ADS', accountId },
        productDestinationId: conversionActionId,
      },
    ],
    encoding: 'HEX',
    events: [event],
    validateOnly: opts.validateOnly,
  };
}

export interface UploadResult {
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
}

/** Never throws. Stage-gated by GOOGLE_ADS_DM_UPLOAD_ENABLED — callers should still build+log the body at Stage 0. */
export async function uploadConversionEvent(
  order: OrderForUpload,
  attribution: AttributionAttributes
): Promise<UploadResult | null> {
  const stage = getUploadStage();
  if (stage === 'disabled') return null;

  const auth = getAuth();
  if (!auth) return { ok: false, error: 'Google Ads Data Manager service account not configured.' };

  const body = buildIngestEventBody(order, attribution, { validateOnly: stage === 'validate' });
  if (!body) return { ok: false, error: 'Missing GOOGLE_ADS_DM_OPERATING_ACCOUNT_ID or GOOGLE_ADS_DM_CONVERSION_ACTION_ID.' };

  try {
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;
    if (!token) return { ok: false, error: 'Could not mint an access token.' };

    const res = await fetch(INGEST_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });

    let responseBody: unknown;
    try {
      responseBody = await res.json();
    } catch {
      responseBody = await res.text().catch(() => undefined);
    }

    return { ok: res.ok, status: res.status, body: responseBody };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown upload error.' };
  }
}
