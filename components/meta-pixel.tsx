'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useIsProductionTrackingContext } from '@/lib/analytics-host';
import { useDeferredThirdParty } from '@/hooks/use-deferred-third-party';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const BOOTSTRAP_SCRIPT_ID = 'meta-pixel-bootstrap';
const FBEVENTS_SCRIPT_ID = 'meta-pixel-fbevents';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Meta (Facebook) Pixel, loaded in two stages for performance.
 *
 * Stage 1 (immediately): the fbq command-queue stub is created and the initial
 * init + PageView are queued. This costs nothing measurable and means no event
 * is ever lost.
 * Stage 2 (first interaction, or a 10s fallback): the heavy fbevents.js script
 * is attached and drains the queue, so its ~400ms of main-thread work stays out
 * of the Core Web Vitals window.
 *
 * Because this is an App Router single-page app, subsequent client-side
 * navigations do not reload the page, so we fire an extra PageView on each
 * pathname change (after the first, which stage 1 already covered). No-ops when
 * the env var is unset.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  // Enable only for real customers on the production storefront, so localhost,
  // Vercel preview, and admin sessions never fire the pixel.
  const enabled = useIsProductionTrackingContext();
  const ready = useDeferredThirdParty();

  useEffect(() => {
    if (!enabled || !PIXEL_ID || window.fbq) return;
    if (document.getElementById(BOOTSTRAP_SCRIPT_ID)) return;
    // The standard Meta bootstrap snippet, verbatim minus its script-insertion
    // lines (that part is stage 2). Injected as an inline script so the queue
    // semantics stay exactly what fbevents.js expects when it drains it.
    const bootstrap = document.createElement('script');
    bootstrap.id = BOOTSTRAP_SCRIPT_ID;
    bootstrap.textContent = `!function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[]}(window);
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`;
    document.head.appendChild(bootstrap);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !PIXEL_ID || !ready) return;
    if (document.getElementById(FBEVENTS_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = FBEVENTS_SCRIPT_ID;
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }, [enabled, ready]);

  useEffect(() => {
    if (!enabled || !PIXEL_ID) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.fbq?.('track', 'PageView');
  }, [pathname, enabled]);

  if (!enabled || !PIXEL_ID) return null;

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
