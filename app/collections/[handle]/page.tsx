import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllRatings } from '@/lib/judgeme/client';
import { getCollections, getCollectionByHandle } from '@/lib/shopify';
import { cleanDescriptionHtml } from '@/lib/description-html';
import { metaDescription } from '@/lib/meta-description';
import { getCollectionEducationPanels } from '@/lib/collection-page';
import ProductsGrid from '@/components/products-grid';
import CollectionHeroBanner from '@/components/collection-hero-banner';
import JsonLd from '@/components/json-ld';
import {
  CollectionFlagshipAboveGrid,
  CollectionFlagshipEducation,
} from '@/components/collection-flagship';
import InstagramFeed from '@/components/instagram-feed';

export const revalidate = 60;

export async function generateStaticParams() {
  const collections = await getCollections(50).catch(() => []);
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  let collection;
  try {
    collection = await getCollectionByHandle(handle);
  } catch (err) {
    console.error('Collection metadata fetch failed', { handle, error: err });
    return { title: 'Collection | Miozuki' };
  }
  if (!collection) return { title: 'Collection | Miozuki' };
  const ogImage = collection.image?.url;
  // Prefer the Shopify "Search engine listing" fields (Ting's lane) when set.
  const title = `${collection.seo?.title?.trim() || collection.title} | Miozuki`;
  const description = metaDescription(collection.seo?.description, collection.description);
  return {
    title,
    description,
    alternates: { canonical: `/collections/${handle}` },
    openGraph: ogImage
      ? { title, description, images: [{ url: ogImage, alt: collection.title }] }
      : undefined,
    twitter: ogImage
      ? { card: 'summary_large_image', title, images: [ogImage] }
      : undefined,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let collection;
  try {
    collection = await getCollectionByHandle(handle);
  } catch (err) {
    console.error('Collection fetch failed', { handle, error: err });
    throw err;
  }

  if (!collection) notFound();

  const products = collection.products.edges.map((e) => e.node);
  const ratings = await getAllRatings().catch(() => ({}));

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.miozuki.co.nz/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: 'https://www.miozuki.co.nz/collections',
      },
      { '@type': 'ListItem', position: 3, name: collection.title },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description || undefined,
    url: `https://www.miozuki.co.nz/collections/${collection.handle}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.title,
        url: `https://www.miozuki.co.nz/products/${p.handle}`,
      })),
    },
  };

  return (
    <main>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <CollectionHeroBanner collection={collection} />

      <div className="border-b border-charcoal/8 bg-cream">
        <div className="mx-auto w-full max-w-7xl px-6 pt-3 pb-2 md:px-10 md:pt-4 md:pb-3">
          <CollectionFlagshipAboveGrid collection={collection} afterHeroBanner />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pt-2 pb-12 md:px-10 md:pt-3 md:pb-16">
        <ProductsGrid
          products={products}
          layout="flagship"
          catalogueQuickFilters={false}
          ratings={ratings}
        />
      </div>

      <div className="below-fold-defer border-t border-charcoal/8 bg-cream py-14 md:py-16">
        <CollectionFlagshipEducation panels={getCollectionEducationPanels(handle)} />
      </div>

      {collection.descriptionHtml && (
        <div className="below-fold-defer mx-auto max-w-4xl px-6 py-16 md:px-10">
          <div
            className="text-sm text-charcoal/70 leading-relaxed [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:text-charcoal [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:first:mt-0 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-charcoal [&_h2]:mb-4 [&_h2]:mt-8 [&_h3]:font-medium [&_h3]:text-charcoal [&_h3]:mb-3 [&_h3]:mt-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1 [&_strong]:font-medium [&_strong]:text-charcoal [&_a]:text-burgundy [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-burgundy/70 [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6 [&_th]:text-left [&_th]:text-xs [&_th]:tracking-widest [&_th]:uppercase [&_th]:text-charcoal [&_th]:border-b [&_th]:border-charcoal/15 [&_th]:py-2 [&_th]:pr-4 [&_td]:border-b [&_td]:border-charcoal/8 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6"
            dangerouslySetInnerHTML={{
              __html: cleanDescriptionHtml(collection.descriptionHtml, undefined, {
                eagerFirstImage: false,
              }),
            }}
          />
        </div>
      )}

      <InstagramFeed />
    </main>
  );
}
