'use client';

import Script from 'next/script';
import { useIsProductionHost } from '@/lib/analytics-host';

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

/**
 * Microsoft Clarity (heatmaps + session recordings).
 *
 * Loads the standard Clarity tag on the storefront. Clarity tracks
 * client-side navigations on its own, so unlike the Meta Pixel we do not
 * re-fire on pathname changes. No-ops when the env var is unset.
 * Covers the Next.js storefront only; Shopify's hosted checkout is a
 * separate domain and is not recorded here.
 */
export default function Clarity() {
  // Enable only for real customers on the production host, so localhost dev and
  // Vercel preview review sessions are never recorded.
  const enabled = useIsProductionHost();

  if (!CLARITY_ID || !enabled) return null;

  return (
    <Script id="ms-clarity" strategy="lazyOnload">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${CLARITY_ID}");`}
    </Script>
  );
}
