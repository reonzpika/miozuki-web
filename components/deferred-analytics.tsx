'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { isProductionHost } from '@/lib/analytics-host';

/**
 * Loads GA4 only after the page has settled or the user first interacts, so the
 * analytics bundle stops competing with the initial render (it was a top
 * "reduce unused JavaScript" item on mobile). Tracking still fires, just after
 * the page is usable: GA4's first PageView runs as soon as the script mounts here.
 */
export default function DeferredAnalytics({ gaId }: { gaId: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only load GA4 for real customers on the production host. This keeps
    // localhost dev and Vercel preview review sessions out of the data.
    if (!isProductionHost()) return;
    let fired = false;
    const trigger = () => {
      if (fired) return;
      fired = true;
      setReady(true);
    };

    const timer = window.setTimeout(trigger, 3500);
    window.addEventListener('scroll', trigger, { once: true, passive: true });
    window.addEventListener('pointerdown', trigger, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', trigger);
      window.removeEventListener('pointerdown', trigger);
    };
  }, []);

  return ready ? <GoogleAnalytics gaId={gaId} /> : null;
}
