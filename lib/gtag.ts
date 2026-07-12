'use client';

// Minimal GA4 command-queue plumbing, replacing @next/third-parties' GoogleAnalytics.
// The split exists for performance: the queue (this file) is seeded on first paint
// at ~zero cost, while the heavy gtag.js network script is only attached after the
// visitor interacts (see components/deferred-analytics.tsx). Events pushed before
// gtag.js arrives sit in window.dataLayer and are replayed by gtag.js on load, so
// nothing is lost — this is the mechanism that keeps add_to_cart reliable.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Create window.dataLayer + the gtag stub and queue the standard bootstrap
 * commands (js + config). Safe to call more than once; only the first call seeds.
 * GA4's enhanced measurement handles SPA route changes once gtag.js loads, same
 * as the previous @next/third-parties setup.
 */
export function seedGtag(gaId: string) {
  if (window.dataLayer) return;
  window.dataLayer = [];
  window.gtag = function gtag() {
    // GA requires the Arguments object itself on the queue, not an array copy.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId);
}

/** Queue a GA4 event. No-ops when GA is not active (stub never seeded). */
export function gaEvent(eventName: string, params: Record<string, unknown>) {
  window.gtag?.('event', eventName, params);
}
