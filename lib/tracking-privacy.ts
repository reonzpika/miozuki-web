'use client';

import { useSyncExternalStore } from 'react';

export type ProcessingPermission = 'allowed' | 'denied' | 'unknown';
type PrivacyApi = {
  analyticsProcessingAllowed: () => boolean;
  marketingAllowed: () => boolean;
  saleOfDataAllowed: () => boolean;
};
declare global {
  interface ShopifyGlobal { shop?: string; customerPrivacy?: PrivacyApi }
  interface Window {
    Shopify?: ShopifyGlobal;
    privacyBanner?: { loadBanner: (options: Record<string, string>) => Promise<void> };
  }
}
const CHANGE_EVENT = 'miozuki:privacy-ready';
let loading: Promise<void> | undefined;

export function trackingPermission(purpose: 'analytics' | 'marketing'): ProcessingPermission {
  if (typeof window === 'undefined') return 'unknown';
  const api = window.Shopify?.customerPrivacy;
  if (!api) return 'unknown';
  try {
    return (purpose === 'analytics' ? api.analyticsProcessingAllowed() : api.marketingAllowed()) ? 'allowed' : 'denied';
  } catch { return 'unknown'; }
}

export function googleConsent() {
  const analytics = trackingPermission('analytics') === 'allowed';
  const marketing = trackingPermission('marketing') === 'allowed';
  let sharing = false;
  try { sharing = window.Shopify?.customerPrivacy?.saleOfDataAllowed() === true; } catch { /* unknown stays denied */ }
  return {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing && sharing ? 'granted' : 'denied',
    ad_personalization: marketing && sharing ? 'granted' : 'denied',
  };
}

export function subscribeToPrivacy(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  document.addEventListener('visitorConsentCollected', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    document.removeEventListener('visitorConsentCollected', callback);
  };
}
export function useAnalyticsPermission() {
  return useSyncExternalStore(subscribeToPrivacy, () => trackingPermission('analytics'), () => 'unknown');
}
export function useTrackingPrivacySnapshot() {
  return useSyncExternalStore(subscribeToPrivacy,
    () => `${trackingPermission('analytics')}:${trackingPermission('marketing')}:${googleConsent().ad_user_data}`,
    () => 'unknown:unknown:denied');
}

/** Shopify determines regional eligibility; never record consent on a visitor's behalf. */
export function loadTrackingPrivacy(): Promise<void> {
  if (loading) return loading;
  loading = new Promise<void>((resolve) => {
    const deadline = setTimeout(() => {
      if (!window.privacyBanner) document.getElementById('miozuki-shopify-privacy')?.remove();
      loading = undefined; resolve();
    }, 8000);
    const initialise = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
        if (!token || !window.privacyBanner) throw new Error('Privacy configuration unavailable');
        await window.privacyBanner.loadBanner({
          storefrontAccessToken: token,
          checkoutRootDomain: 'checkout.miozuki.co.nz',
          storefrontRootDomain: 'miozuki.co.nz',
          locale: 'en',
        });
        window.dispatchEvent(new Event(CHANGE_EVENT));
      } catch {
        console.warn('Tracking privacy unavailable; shopping remains available.');
        loading = undefined;
      } finally { clearTimeout(deadline); resolve(); }
    };
    if (window.privacyBanner) { void initialise(); return; }
    const existing = document.getElementById('miozuki-shopify-privacy');
    if (existing) {
      existing.addEventListener('load', () => { void initialise(); }, { once: true });
      existing.addEventListener('error', () => { existing.remove(); loading = undefined; clearTimeout(deadline); resolve(); }, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'miozuki-shopify-privacy';
    script.async = true;
    script.src = 'https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js';
    script.onload = () => { void initialise(); };
    script.onerror = () => { script.remove(); loading = undefined; clearTimeout(deadline); resolve(); };
    document.head.appendChild(script);
  });
  return loading;
}
