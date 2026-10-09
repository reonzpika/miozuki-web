'use client';

import { useEffect, useState } from 'react';
import { useIsProductionTrackingContext } from '@/lib/analytics-host';
import { seedGtag } from '@/lib/gtag';
import { loadTrackingPrivacy, subscribeToPrivacy, trackingPermission, useTrackingPrivacySnapshot } from '@/lib/tracking-privacy';

const GTAG_SCRIPT_ID = '_ga-gtag';

/**
 * Loads the shared Google tag promptly once Shopify permits either purpose.
 * Unknown privacy stays denied; blocked scripts never interrupt shopping.
 */
export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const enabled = useIsProductionTrackingContext();
  const permission = useTrackingPrivacySnapshot();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    seedGtag(gaId);
    let disposed = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const initialise = () => void loadTrackingPrivacy().then(() => {
      if (!disposed && trackingPermission('analytics') === 'unknown' && attempt < 2)
        retry = setTimeout(() => setAttempt(value => value + 1), 2000 * (attempt + 1));
    });
    initialise();
    window.addEventListener('online', initialise);
    const update = () => seedGtag(gaId);
    const unsubscribe = subscribeToPrivacy(update);
    return () => { disposed = true; clearTimeout(retry); unsubscribe(); window.removeEventListener('online', initialise); };
  }, [enabled, gaId, attempt]);

  useEffect(() => {
    if (!enabled || (trackingPermission('analytics') !== 'allowed' && trackingPermission('marketing') !== 'allowed')) return;
    if (document.getElementById(GTAG_SCRIPT_ID)) return;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const script = document.createElement('script');
    script.id = GTAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.onload = () => window.dispatchEvent(new Event('miozuki:analytics-ready'));
    script.onerror = () => {
      script.remove();
      console.warn('Google tag did not load; shopping remains available.');
      if (attempt < 2) retry = setTimeout(() => setAttempt(value => value + 1), 2000 * (attempt + 1));
    };
    document.head.appendChild(script);
    return () => clearTimeout(retry);
  }, [enabled, permission, gaId, attempt]);

  return null;
}
