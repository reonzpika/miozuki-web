// Client-side guard so the analytics trackers (GA4, Meta Pixel, Microsoft Clarity)
// fire ONLY for real customers on the production host. Without it they also ran on
// localhost during development and on Vercel preview URLs, which polluted GA4
// engagement figures, sent fake Meta Pixel PageViews, and recorded internal review
// sessions in Clarity. The check reads the live hostname, so it is client-only and
// returns false during server rendering (the trackers re-enable after hydration).
import { useSyncExternalStore } from 'react';

export const PRODUCTION_HOST = 'www.miozuki.co.nz';

export function isProductionHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === PRODUCTION_HOST;
}

// Render-time gate for client trackers. Returns false during server rendering and
// the first client paint (so server and client markup match), then the real value
// after hydration. Uses useSyncExternalStore to avoid a setState-in-effect.
const noopSubscribe = () => () => {};
export function useIsProductionHost(): boolean {
  return useSyncExternalStore(noopSubscribe, isProductionHost, () => false);
}
