import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getProducts, getProductByHandle } from '@/lib/shopify';
import ProductGallery from '@/components/product-gallery';
import AddToCart from '@/components/add-to-cart';
import ProductReviews from '@/components/product-reviews';
import ProductRatingSummary from '@/components/product-rating-summary';
import { ProductDescriptionDisclosure } from '@/components/product-description-disclosure';
import { PdpSecondaryActions } from '@/components/pdp/secondary-actions';
import { PdpInfoCardsSection } from '@/components/pdp/info-cards-section';
import { PdpFounderTeaser } from '@/components/pdp/founder-teaser';
import { PdpCustomerPhotosStrip } from '@/components/pdp/customer-photos-strip';
import { PdpQuickLinksRow } from '@/components/pdp/quick-links-row';
import { PdpCustomEnquiry } from '@/components/pdp/custom-enquiry';
import { isEarringProduct } from '@/lib/product-helpers';
import { getRequestAbsoluteUrl } from '@/lib/absolute-url';
import { getProductReviews } from '@/lib/judgeme/client';
import { metaDescription } from '@/lib/meta-description';
import JsonLd from '@/components/json-ld';

export const revalidate = 60;

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
  const ogImageNode =
    product.featuredImage ?? product.images.edges[0]?.node ?? null;
  const ogImageUrl = ogImageNode?.url;
  // Prefer the Shopify "Search engine listing" fields (Ting's lane) when set;
  // fall back to the product title and truncated body copy.
  const pageTitle = `${product.seo?.title?.trim() || product.title} | Miozuki`;
  const description = metaDescription(product.seo?.description, product.description);
  const canonicalPath = `/products/${handle}`;
  const openGraphBase = {
    title: product.title,
    description,
    url: canonicalPath,
    siteName: 'Miozuki',
    type: 'website' as const,
    locale: 'en_NZ',
  };
  return {
    title: pageTitle,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: ogImageUrl
      ? {
          ...openGraphBase,
          images: [
            {
              url: ogImageUrl,
              alt: product.title,
              ...(ogImageNode?.width && ogImageNode?.height
                ? { width: ogImageNode.width, height: ogImageNode.height }
                : {}),
            },
          ],
        }
      : openGraphBase,
    twitter: ogImageUrl
      ? {
          card: 'summary_large_image',
          title: product.title,
          description,
          images: [ogImageUrl],
        }
      : undefined,
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
  const media = product.media.edges.map((e) => e.node);
  const firstVideoItem = media.find((m) => m.mediaContentType === 'VIDEO');
  const firstVideo =
    firstVideoItem && firstVideoItem.mediaContentType === 'VIDEO'
      ? { sources: firstVideoItem.sources, previewImage: firstVideoItem.previewImage }
      : null;
  const variants = product.variants.edges.map((e) => e.node);

  // LCP fix: render media[0] server-side with priority so its preload ships in the
  // initial HTML. The gallery is a client component and cannot emit a priority preload
  // on its own (it only lands after hydration). Passed into the gallery as firstImage.
  const firstMedia = media[0];
  const galleryFirstImage =
    firstMedia && firstMedia.mediaContentType === 'IMAGE' ? (
      <Image
        src={firstMedia.image.url}
        alt={firstMedia.image.altText ?? product.title}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    ) : null;

  const getMetafield = (key: string) =>
    product.metafields?.find((m) => m?.key === key)?.value ?? null;

  const descHtml = product.descriptionHtml ?? null;
  const descPlain = product.description ?? null;

  const shareUrl = await getRequestAbsoluteUrl(`/products/${encodeURIComponent(handle)}`);

  const reviewData = await getProductReviews(product.id).catch(() => null);
  const minPrice = product.priceRange.minVariantPrice;
  const productUrl = `https://www.miozuki.co.nz/products/${handle}`;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: descPlain || undefined,
    image: product.featuredImage?.url
      ? [product.featuredImage.url]
      : images.map((i) => i.url),
    brand: { '@type': 'Brand', name: 'Miozuki' },
    ...(reviewData?.product && reviewData.product.reviews_count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewData.product.rating.toFixed(1),
            reviewCount: reviewData.product.reviews_count,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: minPrice.currencyCode,
      price: minPrice.amount,
      availability: variants.some((v) => v.availableForSale)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: productUrl,
    },
  };
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
      { '@type': 'ListItem', position: 3, name: product.title },
    ],
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
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
          <ProductGallery media={media} title={product.title} firstImage={galleryFirstImage} />
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

          <PdpSecondaryActions firstVideo={firstVideo} />

          <PdpInfoCardsSection
            showMadeToOrderBanner={!isEarringProduct(product.productType, product.tags)}
            materialsRichText={getMetafield('product_material')}
            productDetailsRichText={getMetafield('product_details')}
            whatsIncludedRichText={getMetafield('what_is_included')}
            shareUrl={shareUrl}
            productTitle={product.title}
          />

          <PdpFounderTeaser />

          <PdpCustomerPhotosStrip images={images} title={product.title} />
        </div>
      </div>

      <div id="reviews" className="mt-16 border-t border-charcoal/8 pt-12">
        <Suspense fallback={<div className="h-24 animate-pulse bg-charcoal/5" />}>
          <ProductReviews productId={product.id} />
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
