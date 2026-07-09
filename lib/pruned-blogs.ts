// Blog prune list (SEO cleanup, 2026-07-09): thin, listicle, or near-duplicate
// posts with an explicit disposition in miozuki-brain/seo/content-plan.md and
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

export const prunedBlogSlugs = new Set(prunedBlogRedirects.map((r) => r.slug));
