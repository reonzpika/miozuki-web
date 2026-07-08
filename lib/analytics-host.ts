import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

// Client-side guard so the analytics trackers (GA4, Meta Pixel, Microsoft Clarity)
// fire ONLY for real customers on the production storefront. Without it they also
// ran on localhost, Vercel previews, and live admin screens, which polluted GA4
// engagement figures, sent fake Meta Pixel PageViews, and recorded internal review
// sessions in Clarity. The check reads the live hostname, so it is client-only and
// returns false during server rendering.

export const PRODUCTION_HOST = 'www.miozuki.co.nz';

export function isProductionHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === PRODUCTION_HOST;
}

export function isCustomerTrackingPath(pathname: string): boolean {
  return pathname !== '/admin' && !pathname.startsWith('/admin/');
}

export function isProductionTrackingContext(pathname?: string): boolean {
  if (!isProductionHost()) return false;
  const currentPath =
    pathname ?? (typeof window === 'undefined' ? '' : window.location.pathname);
  return isCustomerTrackingPath(currentPath);
}

// Render-time gate for client trackers. Returns false during server rendering and
// the first client paint (so server and client markup match), then the real value
// after hydration. Uses useSyncExternalStore to avoid a setState-in-effect.
const noopSubscribe = () => () => {};
export function useIsProductionHost(): boolean {
  return useSyncExternalStore(noopSubscribe, isProductionHost, () => false);
}

export function useIsProductionTrackingContext(): boolean {
  const pathname = usePathname();
  return useIsProductionHost() && isCustomerTrackingPath(pathname);
}
