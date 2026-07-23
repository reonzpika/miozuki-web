import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse, after } from 'next/server';
import { hashEmailForDataManager } from '@/lib/google-ads-hash';
import {
  buildIngestEventBody,
  uploadConversionEvent,
  getUploadStage,
  type OrderForUpload,
} from '@/lib/admin/google-ads-data-manager';

// Receives Shopify's orders/paid webhook. Phase 1 of the GA4/Ads attribution
// bridge (see .fable-plan.md and miozuki-brain/ads/google-ads-search.md,
// "Fable plan, Phase 0 verification", 22 Jul 2026) verified the identifiers
// captured by lib/attribution.ts arrive on the real order. Phase 2 (23 Jul
// 2026) uploads each paid order to Google Ads as a conversion via the Data
// Manager API — see lib/admin/google-ads-data-manager.ts for the staged
// rollout gate (GOOGLE_ADS_DM_UPLOAD_ENABLED: unset = build+log only,
// "true" = validateOnly upload, "live" = real upload). No durable storage
// here by design — the order itself is the record; Shopify's own delivery
// log covers replay/audit for this verification period.
//
// The upload call runs inside next/server's after() so it survives past the
// 200 ack sent to Shopify: this route is a serverless function, not a kept-
// alive browser tab, so an un-awaited promise here could be silently killed
// once the response flushes. Awaiting it inline instead would risk Shopify's
// own webhook timeout retrying (and double-firing) the whole request.
//
// The webhook *subscription* that causes Shopify to call this endpoint is
// registered separately (scripts/register-orders-paid-webhook.mts) and is
// NOT created as part of shipping this file — creating it is a live,
// persistent config change on the store and needs its own explicit go-ahead.

// Shopify signs webhook payloads with the app's client secret (confirmed
// against shopify.dev, 22 Jul 2026: "generated using the app's client secret
// and the raw request body"), not a separate per-webhook signing secret —
// there is no distinct SHOPIFY_WEBHOOK_SECRET to provision.
const SIGNING_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

const ATTRIBUTION_KEYS = [
  '_gclid',
  '_gbraid',
  '_wbraid',
  '_utm_source',
  '_utm_medium',
  '_utm_campaign',
  '_utm_term',
  '_utm_content',
  '_landing_path',
  '_ga_client_id',
  '_ga_session_id',
  '_attribution_fallback_id',
  '_attribution_captured_at',
] as const;

interface ShopifyOrderPayload {
  id: number;
  name: string;
  note_attributes?: { name: string; value: string }[];
  total_price?: string;
  currency?: string;
  email?: string;
  created_at?: string;
}

function verifyHmac(rawBody: string, header: string | null): boolean {
  if (!SIGNING_SECRET || !header) return false;
  const digest = createHmac('sha256', SIGNING_SECRET).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(digest);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!SIGNING_SECRET) {
    console.error('orders/paid webhook: SHOPIFY_ADMIN_CLIENT_SECRET is not configured.');
    return NextResponse.json({ error: 'Webhook receiver not configured.' }, { status: 503 });
  }

  // HMAC verification requires the untouched raw body — must read as text
  // before any JSON parsing (a body parser would break the signature match).
  const rawBody = await req.text();
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');

  if (!verifyHmac(rawBody, hmacHeader)) {
    console.warn('orders/paid webhook: HMAC verification failed, rejecting.');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let order: ShopifyOrderPayload;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const attributeMap = new Map(
    (order.note_attributes ?? []).map((a) => [a.name, a.value] as const)
  );
  const found = ATTRIBUTION_KEYS.filter((key) => attributeMap.has(key));
  const missing = ATTRIBUTION_KEYS.filter((key) => !attributeMap.has(key));

  // Phase 1 is verify-only: log what arrived so today's real orders can be
  // checked against what lib/attribution.ts captured, before anything reads
  // this data for real (Phase 2). See google-ads-search.md for how to read
  // these logs during the verification period.
  console.log(
    JSON.stringify({
      event: 'orders_paid_attribution_check',
      orderId: order.id,
      orderName: order.name,
      totalPrice: order.total_price,
      currency: order.currency,
      attributionFound: found,
      attributionMissing: missing,
      attributionValues: Object.fromEntries(found.map((k) => [k, attributeMap.get(k)])),
    })
  );

  // Phase 2: build (and, once enabled, upload) the Google Ads conversion
  // event. Building and logging the body always happens, regardless of
  // rollout stage, so a real order's payload shape is inspectable in Vercel
  // logs before any network call is ever made. Never log the raw email —
  // only its hash.
  if (order.total_price && order.currency && order.created_at) {
    const orderForUpload: OrderForUpload = {
      id: order.id,
      createdAt: order.created_at,
      totalPrice: order.total_price,
      currency: order.currency,
      hashedEmail: order.email ? hashEmailForDataManager(order.email) : undefined,
    };
    const attribution = {
      gclid: attributeMap.get('_gclid'),
      gbraid: attributeMap.get('_gbraid'),
      wbraid: attributeMap.get('_wbraid'),
    };
    const stage = getUploadStage();
    const eventBody = buildIngestEventBody(orderForUpload, attribution, {
      validateOnly: stage !== 'live',
    });

    console.log(
      JSON.stringify({
        event: 'orders_paid_dm_upload_attempt',
        orderId: order.id,
        orderName: order.name,
        stage,
        hasEmail: Boolean(orderForUpload.hashedEmail),
        eventBody,
      })
    );

    if (stage !== 'disabled') {
      after(async () => {
        const result = await uploadConversionEvent(orderForUpload, attribution);
        console.log(
          JSON.stringify({
            event: 'orders_paid_dm_upload_result',
            orderId: order.id,
            orderName: order.name,
            stage,
            ...result,
          })
        );
      });
    }
  }

  return NextResponse.json({ ok: true });
}
