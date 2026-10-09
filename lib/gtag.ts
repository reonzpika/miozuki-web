'use client';

import { googleConsent, trackingPermission } from './tracking-privacy';

// Minimal GA4 command-queue plumbing, replacing @next/third-parties' GoogleAnalytics.
// The queue is seeded on first paint and reused. Permitted events can queue
// before the script loads; blocked scripts/short visits can still lose events.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    miozukiGoogleDestinations?: Set<string>;
    miozukiGoogleBootstrap?: boolean;
  }
}

// Google Ads destination verified in Miozuki account 961-947-1172.
const GOOGLE_ADS_ID = 'AW-18302159906';

/**
 * Create window.dataLayer + the gtag stub and queue the standard bootstrap
 * commands (js + config). Safe to call more than once; only the first call seeds.
 * GA4's enhanced measurement handles SPA route changes once gtag.js loads, same
 * as the previous @next/third-parties setup.
 */
export function seedGtag(gaId: string) {
  window.dataLayer ??= [];
  window.gtag ??= function gtag() {
    // GA requires the Arguments object itself on the queue, not an array copy.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  if (!window.miozukiGoogleBootstrap) {
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.miozukiGoogleBootstrap = true;
  }
  window.gtag('consent', 'update', googleConsent());
  window.miozukiGoogleDestinations ??= new Set();
  // Reuse the existing Google tag for Ads measurement on the custom storefront.
  // This is base-tag setup only, not a completed-purchase conversion event.
  const destinations = [
    ...(trackingPermission('analytics') === 'allowed' ? [gaId] : []),
    ...(trackingPermission('marketing') === 'allowed' ? [GOOGLE_ADS_ID] : []),
  ];
  for (const id of destinations) {
    if (!window.miozukiGoogleDestinations.has(id)) {
      window.gtag('config', id);
      window.miozukiGoogleDestinations.add(id);
    }
  }
}

/** Queue a GA4 event. No-ops when GA is not active (stub never seeded). */
export function gaEvent(eventName: string, params: Record<string, unknown>) {
  try {
  if (trackingPermission('analytics') !== 'allowed') return;
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
  if (!gaId) return;
  seedGtag(gaId);
  window.gtag?.('event', eventName, { ...params, send_to: gaId });
  } catch { /* A measurement failure must never interrupt shopping. */ }
}
