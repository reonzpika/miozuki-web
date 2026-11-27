'use client';

import { isProductionTrackingContext } from '@/lib/analytics-host';
import { loadTrackingPrivacy, trackingPermission } from '@/lib/tracking-privacy';
import type { ProductVariant } from '@/lib/shopify';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type AddToCartEvent = {
  productTitle: string;
  variant: ProductVariant;
  quantity: number;
};

/** Call only after Shopify confirms the addition. Tracking never delays shopping. */
export function trackMetaAddToCart({ productTitle, variant, quantity }: AddToCartEvent): void {
  try {
    if (!PIXEL_ID || !isProductionTrackingContext()) return;
    if (trackingPermission('marketing') === 'denied') return;

    const price = Number.parseFloat(variant.price.amount);
    const currency = variant.price.currencyCode;
    const value = price * quantity;
    if (!Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(value) || value < 0 ||
        !/^[A-Z]{3}$/.test(currency)) return;

    // Snapshot the actual selected price before privacy readiness resolves.
    // Catalogue IDs are intentionally omitted until their Meta mapping is verified;
    // these optional fields are not needed for an AddToCart website audience.
    const params = { content_name: productTitle, currency, value };
    void loadTrackingPrivacy().then(() => {
      try {
        if (!isProductionTrackingContext() || trackingPermission('marketing') !== 'allowed') return;
        // Reuse the installed pixel and its deferred SDK command queue. No second
        // pixel, customer identifiers, server upload or historical event replay.
        window.fbq?.('track', 'AddToCart', params);
      } catch { /* Blocked telemetry must not turn a successful addition into an error. */ }
    }).catch(() => { /* Privacy unavailable: leave the event unsent and shopping available. */ });
  } catch { /* Missing/blocked tracking must never interrupt the cart. */ }
}
