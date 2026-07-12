'use client';

import { useEffect, useState } from 'react';

// First real user gesture, or this fallback, releases the third-party trackers.
// The fallback exists so long, read-only sessions (no scroll, no tap) still get
// counted; 10s is far enough out that the scripts never compete with hydration
// or the LCP render on a mid-range phone.
const FALLBACK_DELAY_MS = 10_000;

const ACTIVATION_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'] as const;

/**
 * True once the visitor has interacted with the page (or after a 10s fallback).
 * Gate heavy third-party scripts (GA4, Meta Pixel, Clarity) on this so their
 * download/parse/execute cost never lands inside the initial-load window that
 * Core Web Vitals measure. Pair with an eagerly-seeded command queue when
 * events fired before activation must not be lost (see deferred-analytics.tsx).
 * SSR and first paint: false.
 */
export function useDeferredThirdParty(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    let cleanedUp = false;
    const timer = window.setTimeout(activate, FALLBACK_DELAY_MS);

    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      for (const event of ACTIVATION_EVENTS) window.removeEventListener(event, activate);
      window.clearTimeout(timer);
    }

    function activate() {
      cleanup();
      setReady(true);
    }

    for (const event of ACTIVATION_EVENTS) {
      window.addEventListener(event, activate, { passive: true });
    }
    return cleanup;
  }, [ready]);

  return ready;
}
