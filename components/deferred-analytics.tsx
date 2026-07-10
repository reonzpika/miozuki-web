'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useIsProductionTrackingContext } from '@/lib/analytics-host';

/**
 * Loads GA4 only for real customers on the production storefront. GA4 needs to be
 * available before ecommerce actions so add-to-cart events are not missed.
 */
export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const enabled = useIsProductionTrackingContext();

  return enabled ? <GoogleAnalytics gaId={gaId} /> : null;
}
