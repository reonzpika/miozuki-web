import type { NextConfig } from "next";
import { prunedBlogRedirects, migratedBlogRedirects } from "./pruned-blogs";

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
  // Legacy secondary blog index -> straight to the guide that absorbed the
  // article (was a hop via /blogs/news/...; pointed direct when the article
  // itself was migrated in wave 2, to avoid a redirect chain).
  {
    source: '/blogs/moissanite-vs-diamond-for-nz-engagement-rings',
    destination: '/moissanite-guide/moissanite-vs-diamond-nz',
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
  // Migrated blogs -> their now-live replacement guides (ranking transfer).
  ...migratedBlogRedirects.map(({ slug, destination }) => ({
    source: `/blogs/news/${slug}`,
    destination,
    permanent: true,
  })),
  // Moissanite FAQ page folded into the moissanite pillar (2026-07-10): its
  // content was already covered by the guide, so the standalone page is
  // retired and its traffic sent to the pillar.
  {
    source: '/pages/moissanite-faq',
    destination: '/moissanite-guide',
    permanent: true,
  },
  // Old Shopify collection-scoped product URLs (SEO audit, 2026-07-17). This
  // app never had the nested route for any handle, so every such URL 404s,
  // current collections included; the product page at /products/<handle> is
  // the canonical home. One rule covers all collections, past and future.
  {
    source: '/collections/:collection/products/:product',
    destination: '/products/:product',
    permanent: true,
  },
  // Shopify auto-published .atom feeds for these collections, indexed by
  // Google, with no equivalent route in this app (SEO audit, 2026-07-17).
  // Each points straight at the canonical collection so consolidated handles
  // don't chain through the HTML redirect above.
  {
    source: '/collections/moissanite-engagement-ring-nz.atom',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/engagement-ring-moissanite.atom',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/engravable-rings.atom',
    destination: '/collections/moissanite-rings',
    permanent: true,
  },
  {
    source: '/collections/moissanite-diamond.atom',
    destination: '/collections/moissanite-nz',
    permanent: true,
  },
  {
    source: '/collections/moissanite-ear-rings.atom',
    destination: '/collections/moissanite-earrings',
    permanent: true,
  },
  {
    source: '/collections/pearl-earrings-silver.atom',
    destination: '/collections/pearl-earrings',
    permanent: true,
  },
  {
    source: '/collections/pearl-earrings.atom',
    destination: '/collections/pearl-earrings',
    permanent: true,
  },
  {
    source: '/collections/bridal-jewellery.atom',
    destination: '/collections/bridal-jewellery',
    permanent: true,
  },
  {
    source: '/collections/moissanite-necklace-nz.atom',
    destination: '/collections/moissanite-necklace-nz',
    permanent: true,
  },
  // Legacy Shopify /pages/* URLs unpublished at the June 2026 headless
  // cutover with no redirect added at the time (SEO audit, 2026-07-17).
  {
    source: '/pages/warranty',
    destination: '/pages/warranty-cover',
    permanent: true,
  },
  {
    source: '/pages/returns-refunds',
    destination: '/pages/returns-refunds-policy',
    permanent: true,
  },
  {
    source: '/pages/pearl-earrings-nz',
    destination: '/collections/pearl-earrings',
    permanent: true,
  },
  {
    source: '/pages/moissanite-new-zealand',
    destination: '/moissanite-guide',
    permanent: true,
  },
  {
    source: '/pages/moissanite-guide-nz',
    destination: '/moissanite-guide',
    permanent: true,
  },
  {
    source: '/pages/why-choose-moissanite-over-diamonds-nz',
    destination: '/moissanite-guide/moissanite-vs-diamond-nz',
    permanent: true,
  },
  // No exact-match target: the old page was deleted outright from Shopify
  // (not just unpublished), confirmed via the Admin API pages list, with no
  // Wayback snapshot. The moissanite pillar is the closest living topic.
  {
    source: '/pages/materials',
    destination: '/moissanite-guide',
    permanent: true,
  },
  // Schemeless link bug (SEO audit, 2026-07-17): a Shopify article's FAQ
  // table linked bare "www.miozuki.co.nz" with no protocol, which browsers
  // and Googlebot resolve relative to the current page, producing this exact
  // URL. Fixed at the source in Shopify admin; this is belt-and-braces while
  // Google recrawls the old broken link.
  {
    source: '/blogs/news/www.miozuki.co.nz',
    destination: '/',
    permanent: true,
  },
];
