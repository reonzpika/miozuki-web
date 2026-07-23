import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

// Receives Shopify's orders/paid webhook. Phase 1 of the GA4/Ads attribution
// bridge (see .fable-plan.md and miozuki-brain/ads/google-ads-search.md,
// "Fable plan, Phase 0 verification", 22 Jul 2026): this endpoint is
// currently log-only, it verifies the identifiers captured by
// lib/attribution.ts actually arrive on the real order, before Phase 2 (the
// Google Ads Data Manager upload) is built against it. No durable storage
// here by design — the order itself is the record; Shopify's own delivery
// log covers replay/audit for this verification period.
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

  return NextResponse.json({ ok: true });
}
