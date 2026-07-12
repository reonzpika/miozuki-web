'use client';

import { useEffect } from 'react';
import { useIsProductionTrackingContext } from '@/lib/analytics-host';
import { useDeferredThirdParty } from '@/hooks/use-deferred-third-party';
import { seedGtag } from '@/lib/gtag';

const GTAG_SCRIPT_ID = '_ga-gtag';

/**
 * Loads GA4 only for real customers on the production storefront, in two stages:
 * the dataLayer command queue is seeded immediately (so ecommerce events such as
 * add_to_cart are queued from the first paint and never missed), while the heavy
 * gtag.js script is attached only after first interaction or a 10s fallback, so
 * its ~650ms of main-thread work stays out of the Core Web Vitals window.
 */
export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const enabled = useIsProductionTrackingContext();
  const ready = useDeferredThirdParty();

  useEffect(() => {
    if (!enabled) return;
    seedGtag(gaId);
  }, [enabled, gaId]);

  useEffect(() => {
    if (!enabled || !ready) return;
    if (document.getElementById(GTAG_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = GTAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
  }, [enabled, ready, gaId]);

  return null;
}
