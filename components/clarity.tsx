'use client';

import Script from 'next/script';

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
  if (!CLARITY_ID) return null;

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
