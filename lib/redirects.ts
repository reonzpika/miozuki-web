import type { NextConfig } from "next";
import { prunedBlogRedirects } from "./pruned-blogs";

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
  {
    source: '/collections/necklaces',
    destination: '/collections/moissanite-necklace-nz',
    permanent: true,
  },
  // Collection consolidation (2026-07-04): six near-duplicate ring collections,
  // three near-duplicate broad collections, and two near-duplicate earring
  // collections were all competing with each other in Google for the same
  // searches. Each group is now one Shopify collection (renamed from the
  // strongest of the duplicates); every other handle in the group redirects
  // here so Google backs one page per group instead of splitting the signal.
  {
    source: '/collections/moissanite-rings-nz',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/moissanite-engagement-ring-nz',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/moissanite-engagement-rings-nz',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/engagement-ring-moissanite',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/engravable-rings',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/promise-rings-nz',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  // Dead handles (never a live Shopify collection, or long gone) that still
  // pull real impressions in Search Console; redirect rather than 404 them.
  {
    source: '/collections/promise-ring-nz',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/moissanite-ring-engagement',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/all-moissanite-pearl-nz',
    destination: '/collections/moissanite-nz',
    permanent: true,
  },
  {
    source: '/collections/moissanite-new-zealand',
    destination: '/collections/moissanite-nz',
    permanent: true,
  },
  {
    source: '/collections/moissanite-diamond',
    destination: '/collections/moissanite-nz',
    permanent: true,
  },
  {
    source: '/collections/moissanite-ear-rings',
    destination: '/collections/moissanite-earrings',
    permanent: true,
  },
  {
    source: '/collections/bridal-earring',
    destination: '/collections/moissanite-earrings',
    permanent: true,
  },
  {
    source: '/collections/pearl-earrings-silver',
    destination: '/collections/pearl-earrings',
    permanent: true,
  },
  // Blog prune (2026-07-09): thin/near-duplicate posts 301 to the nearest
  // surviving collection or page. List and rationale in lib/pruned-blogs.ts;
  // the same list excludes these slugs from the sitemap.
  ...prunedBlogRedirects.map(({ slug, destination }) => ({
    source: `/blogs/news/${slug}`,
    destination,
    permanent: true,
  })),
];
