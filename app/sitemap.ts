import type { MetadataRoute } from 'next';
import { getProducts, getCollections, getBlogArticles } from '@/lib/shopify';

const BASE = 'https://www.miozuki.co.nz';

const STATIC_PATHS: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/collections', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blogs/news', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/pages/about-us', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/pages/our-founder', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/pages/appointment-online', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/pages/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/pages/bespoke-order', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/pages/jewellery-care-guide', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/pages/moissanite-faq', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/pages/nz-au-to-us-ring-size-converter', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/pages/the-master-moissanite-conversion-chart-mm-dew-nz-ring-sizes-explained', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/pages/miozuki-in-auckland-northshore', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/pages/custom-bridal-jewellery-nz', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/pages/returns-refunds-policy', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/pages/size-guide', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/pages/warranty-cover', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/policies/shipping-policy', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/policies/privacy-policy', changeFrequency: 'monthly', priority: 0.3 },
  { path: '/policies/terms-of-service', changeFrequency: 'monthly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [products, collections, articles] = await Promise.all([
    getProducts(100).catch(() => []),
    getCollections(50).catch(() => []),
    getBlogArticles(undefined, 100).catch(() => []),
  ]);

  return [
    ...STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...products.map((p) => ({
      url: `${BASE}/products/${p.handle}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...collections.map((c) => ({
      url: `${BASE}/collections/${c.handle}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: `${BASE}/blogs/news/${a.handle}`,
      lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
