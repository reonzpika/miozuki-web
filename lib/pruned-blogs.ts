// Blog prune list (SEO cleanup, 2026-07-09): thin, listicle, or near-duplicate
// posts with an explicit disposition in miozuki-brain/guides/content-plan.md and
// the July 2026 audit (site-audit-202607.md section 4). Each slug 301s to the
// nearest surviving collection or page, and is excluded from the sitemap.
//
// NOT here on purpose: the ~13 MIGRATE posts (they 301 into their guide only
// when that guide launches, never before), the 3 grades/why duplicates and the
// promise-ring post (also guide-keyed), the white-gold care post (conditional
// on a care-page plating check), and the 7 KEEP-BLOG posts.

export const prunedBlogRedirects: Array<{ slug: string; destination: string }> = [
  // Ring overviews and listicles -> the canonical rings collection
  { slug: 'moissanite-new-zealand-overview', destination: '/collections/moissanite-rings' },
  { slug: 'moissanite-ring-nz-guide', destination: '/collections/moissanite-rings' },
  { slug: 'your-how-to-guide-on-moissanite-ring-engagement', destination: '/collections/moissanite-rings' },
  { slug: 'moissanite-diamond-styles-complete-guide', destination: '/collections/moissanite-rings' },
  { slug: '10-things-to-know-before-buying-a-moissanite-ring-in-nz', destination: '/collections/moissanite-rings' },
  { slug: '10-affordable-moissanite-solitaire-rings-for-young-couples', destination: '/collections/moissanite-rings' },
  { slug: 'affordable-moissanite-solitaire-rings-nz', destination: '/collections/moissanite-rings' },
  { slug: 'affordable-custom-moissanite-rings', destination: '/collections/moissanite-rings' },
  { slug: 'guide-on-affordable-engagement-rings', destination: '/collections/moissanite-rings' },
  { slug: '2-carat-moissanite-diamond-ring-nz', destination: '/collections/moissanite-rings' },
  { slug: 'three-stone-moissanite-rings', destination: '/collections/moissanite-rings' },
  { slug: 'halo-moissanite-rings-nz', destination: '/collections/moissanite-rings' },
  { slug: 'marquise-moissanite-engagement-rings-nz-guide', destination: '/collections/moissanite-rings' },
  { slug: 'elongated-cushion-moissanite-best-styles-guide', destination: '/collections/moissanite-rings' },
  { slug: 'the-hidden-halo-secret-sparkle-guide', destination: '/collections/moissanite-rings' },
  // Stud and earring duplicates -> the canonical earrings collection
  { slug: 'overview-on-best-moissanite-studs', destination: '/collections/moissanite-earrings' },
  { slug: 'guide-on-best-moissanite-stud-earrings-for-brides', destination: '/collections/moissanite-earrings' },
  { slug: 'moissanite-studs-nz-fine-jewellery-for-every-occasion', destination: '/collections/moissanite-earrings' },
  { slug: 'best-moissanite-earrings-for-strapless-wedding-dress-gowns', destination: '/collections/moissanite-earrings' },
  { slug: 'best-halo-earrings-with-moissanite', destination: '/collections/moissanite-earrings' },
  { slug: 'moissanite-drop-huggie-earrings-styling-guide', destination: '/collections/moissanite-earrings' },
  // Pearl thin -> the pearl earrings collection
  { slug: 'styling-guide-on-pearl-earrings-nz-for-wedding', destination: '/collections/pearl-earrings' },
  { slug: 'guide-to-our-best-baroque-pearl-earrings', destination: '/collections/pearl-earrings' },
  // Bridal thin -> the bridal collection
  { slug: 'bes-pearl-jewelry-for-brides', destination: '/collections/bridal-jewellery' },
  { slug: 'pearl-accents-for-classic-bridal-looks-nz', destination: '/collections/bridal-jewellery' },
  { slug: 'best-bridal-jewellery-guide', destination: '/collections/bridal-jewellery' },
  { slug: 'bridal-jewellery-nz-how-to-style-the-perfect-look', destination: '/collections/bridal-jewellery' },
  // Care and sizing thin -> the canonical care page / sizing reference
  { slug: 'jewellery-care-guide-for-pearls-for-brides', destination: '/pages/jewellery-care-guide' },
  { slug: 'fine-jewellery-storage-tips-nz', destination: '/pages/jewellery-care-guide' },
  { slug: 'guide-on-ring-size-and-bespoke-ordering', destination: '/pages/the-master-moissanite-conversion-chart-mm-dew-nz-ring-sizes-explained' },
];

// MIGRATED blogs (2026-07-10, first launch wave): posts whose replacement
// guide is now LIVE, so their 301 fires and transfers the old post's ranking
// into the guide. A migrate entry is added here only once its target guide
// has launched (zero VERIFY-FACT markers, in the sitemap), never before.
export const migratedBlogRedirects: Array<{ slug: string; destination: string }> = [
  { slug: 'moissanite-is-what-exactly-the-complete-nz-guide-to-this-brilliant-gemstone', destination: '/moissanite-guide' },
  { slug: 'moissanite-earrings-guide-nz', destination: '/moissanite-guide/moissanite-earrings-nz' },
  { slug: 'akoya-vs-freshwater-pearls-nz-guide', destination: '/pearl-guide/akoya-vs-freshwater-pearls-nz' },
  { slug: 'bridal-earrings-guide-nz', destination: '/bridal-guide/bridal-earrings-nz' },
  { slug: 'best-bridesmaid-jewellery-gifts-guide', destination: '/bridal-guide/bridesmaid-jewellery-gifts' },
  // Wave 2 (2026-07-10): all remaining guides launched (Ting's fact-check reply
  // resolved every blocking marker), so the rest of the migrate list fires.
  // Slugs verified against the live Shopify articles API before adding.
  { slug: 'moissanite-vs-diamond-for-nz-engagement-rings-9-crucial-differences-nobody-explains-clearly', destination: '/moissanite-guide/moissanite-vs-diamond-nz' },
  { slug: 'why-choose-moissanite-over-diamonds-nz', destination: '/moissanite-guide/moissanite-vs-diamond-nz' },
  { slug: 'moissanite-jewellery-nz-why-is-it-accessible-luxury', destination: '/moissanite-guide/moissanite-vs-diamond-nz' },
  { slug: 'difference-between-moissanite-and-cubic-zirconia-a-complete-guide', destination: '/moissanite-guide/moissanite-vs-cubic-zirconia' },
  { slug: 'moissanite-colour-clarity-grades-explained-nz', destination: '/moissanite-guide/moissanite-grades-and-brands-nz' },
  { slug: 'overview-on-moissanite-colour-clarity-grades-nz', destination: '/moissanite-guide/moissanite-grades-and-brands-nz' },
  { slug: 'engagement-ring-moissanite-guide-how-to-choose-a-ring-that-shines-for-a-lifetime', destination: '/moissanite-guide/how-to-choose-a-moissanite-ring' },
  { slug: 'complete-guide-for-moissanite-ring-setting', destination: '/moissanite-guide/how-to-choose-a-moissanite-ring' },
  { slug: 'platinum-vs-silver-settings-for-moissanite-ring-nz', destination: '/moissanite-guide/how-to-choose-a-moissanite-ring' },
  { slug: 'classic-solitaire-vs-pave-moissanite-engagement-rings', destination: '/moissanite-guide/how-to-choose-a-moissanite-ring' },
  { slug: 'complete-guide-moissanite-ring-nz-cuts-for-sparkle', destination: '/moissanite-guide/how-to-choose-a-moissanite-ring' },
  { slug: 'how-to-choose-a-promise-ring-nz', destination: '/moissanite-guide/how-to-choose-a-promise-ring-nz' },
  { slug: 'best-selling-moissanite-promise-rings-in-nz-for-young-couples', destination: '/moissanite-guide/how-to-choose-a-promise-ring-nz' },
  { slug: 'how-to-know-if-pearls-are-real-or-fake', destination: '/pearl-guide/how-to-tell-real-pearls' },
  { slug: 'pearl-earrings-nz-jewellery-guide', destination: '/pearl-guide/pearl-earrings-nz' },
];

export const prunedBlogSlugs = new Set(
  [...prunedBlogRedirects, ...migratedBlogRedirects].map((r) => r.slug),
);
