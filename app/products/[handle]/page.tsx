import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProducts, getProductByHandle } from '@/lib/shopify';
import ProductGallery from '@/components/product-gallery';
import AddToCart from '@/components/add-to-cart';
import ProductReviews from '@/components/product-reviews';
import ProductRatingSummary from '@/components/product-rating-summary';
import { ProductDescriptionDisclosure } from '@/components/product-description-disclosure';
import {
  PdpSecondaryActions,
  PdpInfoCardsSection,
  PdpFounderTeaser,
  PdpCustomerPhotosStrip,
  PdpQuickLinksRow,
  PdpCustomEnquiry,
  isEarringProduct,
} from '@/components/pdp-product-story';

export const revalidate = 60;

/** Local corrections when Shopify copy is updated here before Admin. */
const PDP_DESCRIPTION_REPLACEMENTS: Array<{ match: string; replacement: string }> = [
  {
    match:
      'Five moissanites trace a soft curve across sterling silver, reflecting a calm, timeless presence.',
    replacement:
      'Five moissanites trace a curve across sterling silver band, reflecting a classy and elegant style.',
  },
];

function applyPdpDescriptionCorrections(
  descriptionHtml: string | null | undefined,
  description: string | null | undefined
): { descriptionHtml: string | null; description: string | null } {
  let html = descriptionHtml ?? null;
  let plain = description ?? null;
  for (const { match, replacement } of PDP_DESCRIPTION_REPLACEMENTS) {
    if (plain?.includes(match)) plain = plain.replace(match, replacement);
    if (html?.includes(match)) html = html.replace(match, replacement);
  }
  return { descriptionHtml: html, description: plain };
}

export async function generateStaticParams() {
  const products = await getProducts(100).catch(() => []);
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  let product;
  try {
    product = await getProductByHandle(handle);
  } catch (err) {
    console.error('PDP metadata fetch failed', { handle, error: err });
    return { title: 'Product | Miozuki' };
  }
  if (!product) return { title: 'Product | Miozuki' };
  const { description: metaDesc } = applyPdpDescriptionCorrections(
    product.descriptionHtml,
    product.description
  );
  return {
    title: `${product.title} | Miozuki`,
    description: metaDesc || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let product;
  try {
    product = await getProductByHandle(handle);
  } catch (err) {
    console.error('PDP fetch failed', { handle, error: err });
    throw err;
  }

  if (!product) notFound();

  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);

  const getMetafield = (key: string) =>
    product.metafields?.find((m) => m?.key === key)?.value ?? null;

  const { descriptionHtml: descHtml, description: descPlain } = applyPdpDescriptionCorrections(
    product.descriptionHtml,
    product.description
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm uppercase tracking-widest text-charcoal/40 md:mb-8 md:gap-2 md:text-xs"
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-sm px-1 text-charcoal/50 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:min-h-0 md:py-1"
        >
          Home
        </Link>
        <span className="text-charcoal/25" aria-hidden>
          /
        </span>
        <Link
          href="/collections"
          className="inline-flex min-h-11 items-center rounded-sm px-1 text-charcoal/50 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:min-h-0 md:py-1"
        >
          Collections
        </Link>
        <span className="text-charcoal/25" aria-hidden>
          /
        </span>
        <span className="min-h-11 max-w-full truncate py-2 text-charcoal/70 md:min-h-0 md:py-1">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-20">
        <div className="md:sticky md:top-24 md:self-start">
          <ProductGallery images={images} title={product.title} />
        </div>

        <div className="flex flex-col gap-8 pb-24 md:pb-0">
          <div>
            {product.productType && (
              <p className="mb-2 text-xs uppercase tracking-widest text-charcoal/40">
                {product.productType}
              </p>
            )}
            <h1 className="mb-3 font-serif text-3xl leading-tight text-charcoal md:text-4xl">
              {product.title}
            </h1>
            <div className="mb-4">
              <Suspense fallback={null}>
                <ProductRatingSummary productId={product.id} />
              </Suspense>
            </div>
            <ProductDescriptionDisclosure
              descriptionHtml={descHtml}
              plainDescription={descPlain}
            />
            <AddToCart
              variants={variants}
              priceRange={product.priceRange}
              productTitle={product.title}
            />
          </div>

          <PdpSecondaryActions />

          <PdpInfoCardsSection
            showMadeToOrderBanner={!isEarringProduct(product.productType, product.tags)}
            materialsRichText={getMetafield('product_material')}
            productDetailsRichText={getMetafield('product_details')}
            whatsIncludedRichText={getMetafield('what_is_included')}
          />

          <PdpFounderTeaser />

          <PdpCustomerPhotosStrip images={images} title={product.title} />
        </div>
      </div>

      <div id="reviews" className="mt-16 border-t border-charcoal/8 pt-12">
        <Suspense fallback={<div className="h-24 animate-pulse bg-charcoal/5" />}>
          <ProductReviews
            productId={product.id}
            productHandle={product.handle}
            productTitle={product.title}
          />
        </Suspense>
      </div>

      <div className="mt-12 space-y-10">
        <PdpQuickLinksRow />

        <PdpCustomEnquiry />

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="border border-charcoal/10 px-3 py-1 text-xs tracking-wide text-charcoal/40"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
