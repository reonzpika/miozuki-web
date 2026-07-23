'use client';

import { useEffect, useRef } from 'react';

const REVIEW_TOGGLE_CLASSNAME =
  'flex w-full min-h-11 cursor-pointer list-none items-center justify-center border border-charcoal/10 bg-cream px-4 py-3 text-center text-xs font-medium uppercase tracking-widest text-charcoal transition-colors hover:border-charcoal/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream [&::-webkit-details-marker]:hidden sm:w-auto sm:flex-none';

const PRELOADER_SRC = 'https://cdnwidget.judge.me/widget_preloader.js';
const JUDGE_ME_SHOP_DOMAIN = 'nassuu-px.myshopify.com';

declare global {
  interface Window {
    jdgm?: {
      SHOP_DOMAIN?: string;
      PLATFORM?: string;
      CACHE_SERVER_HOST?: string;
      HTTPS_HOST?: string;
      CDN_HOST?: string;
      API_HOST?: string;
    };
    jdgmCacheServer?: {
      reloadAll?: () => void;
    };
    Shopify?: { shop?: string };
  }
}

function ensureJudgeMeConfig() {
  window.jdgm = window.jdgm || {};
  window.jdgm.SHOP_DOMAIN = JUDGE_ME_SHOP_DOMAIN;
  window.jdgm.PLATFORM = 'shopify';
}

function ensureJudgeMePreloader() {
  if (document.querySelector('script[data-miozuki-judgeme-preloader]')) {
    return;
  }
  ensureJudgeMeConfig();
  const script = document.createElement('script');
  script.src = PRELOADER_SRC;
  script.async = true;
  script.dataset.cfasync = 'false';
  script.dataset.miozukiJudgemePreloader = 'true';
  document.body.appendChild(script);
}

function refreshJudgeMeWidgets() {
  window.jdgmCacheServer?.reloadAll?.();
}

export function ProductReviewWriteDisclosure({
  productNumericId,
  productTitle,
  reviewPageFallbackHref,
}: {
  productNumericId: string;
  productTitle: string;
  reviewPageFallbackHref: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;

    const onToggle = () => {
      if (!el.open) return;
      ensureJudgeMeConfig();
      ensureJudgeMePreloader();
      window.requestAnimationFrame(() => {
        window.setTimeout(() => refreshJudgeMeWidgets(), 400);
      });
    };

    el.addEventListener('toggle', onToggle);
    return () => el.removeEventListener('toggle', onToggle);
  }, []);

  return (
    <div className="flex w-full flex-col sm:w-auto sm:min-w-[11rem]">
      <details ref={detailsRef} className="group w-full sm:w-auto">
        <summary className={REVIEW_TOGGLE_CLASSNAME}>
          Write a review
        </summary>
        <div
          id="pdp-judgeme-write-panel"
          className="mt-3 w-full max-w-xl rounded-sm border border-charcoal/10 bg-cream p-4 sm:min-w-[min(100%,24rem)]"
        >
          <p className="mb-4 text-sm leading-relaxed text-charcoal/65">
            If you purchased this piece, use the secure Judge.me form below. It loads in this
            section; you do not need a separate tab or site.
          </p>
          <div
            id="judgeme_product_reviews"
            className="jdgm-widget jdgm-review-widget"
            data-id={productNumericId}
            data-product-title={productTitle}
          />
          <p className="mt-6 text-xs leading-relaxed text-charcoal/65">
            Form not loading?{' '}
            <a
              href={reviewPageFallbackHref}
              className="font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Open the product review section
            </a>{' '}
            (same tab).
          </p>
        </div>
      </details>
    </div>
  );
}
