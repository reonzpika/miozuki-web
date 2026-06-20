import type { NextConfig } from "next";

// Redirect list: old URLs -> their current home on this site.
//
// Each entry sends a visitor (and Google) from an old path to a new one, so
// links that were shared or indexed before a page was renamed or removed keep
// working instead of hitting a 404.
//
// SAFE TO APPEND TO. When a page or route is renamed or removed, add an entry
// here pointing the old path at the new one. This file is isolated from
// `next.config.ts` on purpose, so adding a redirect can never touch the image
// host allowlist that the config protects.

type RedirectList = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>;

export const redirects: RedirectList = [
  // Shopify default policy slug -> the content page on Next
  {
    source: '/policies/refund-policy',
    destination: '/pages/returns-refunds-policy',
    permanent: true,
  },
  // Old custom shipping page -> the canonical shipping policy (same content)
  {
    source: '/pages/shipping-delivery',
    destination: '/policies/shipping-policy',
    permanent: true,
  },
  // Empty legacy blog landing stub -> the journal index
  {
    source: '/pages/blogs',
    destination: '/blogs/news',
    permanent: true,
  },
  // Legacy secondary blog index -> the matching journal article
  {
    source: '/blogs/moissanite-vs-diamond-for-nz-engagement-rings',
    destination:
      '/blogs/news/moissanite-vs-diamond-for-nz-engagement-rings-9-crucial-differences-nobody-explains-clearly',
    permanent: true,
  },
  // Renamed Shopify pages (old slugs were indexed; new build renamed them).
  {
    source: '/pages/appointment',
    destination: '/pages/appointment-online',
    permanent: true,
  },
  {
    source: '/pages/custom-made',
    destination: '/pages/bespoke-order',
    permanent: true,
  },
  // Renamed collections (Shopify drifted the handles; old handles were indexed).
  {
    source: '/collections/moissanite-rings',
    destination: '/collections/moissanite-rings-nz',
    permanent: true,
  },
  {
    source: '/collections/necklaces',
    destination: '/collections/moissanite-necklace-nz',
    permanent: true,
  },
];
