import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProducts, getProductByHandle } from '@/lib/shopify';
import RichText from '@/components/rich-text';
import ProductGallery from '@/components/product-gallery';
import AddToCart from '@/components/add-to-cart';
import RingSizeGuide from '@/components/ring-size-guide';
import ProductReviews from '@/components/product-reviews';

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
  const product = await getProductByHandle(handle).catch(() => null);
  if (!product) return { title: 'Product — Miozuki' };
  return {
    title: `${product.title} — Miozuki`,
    description: product.description || undefined,
  };
}

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);

  if (!product) notFound();

  const images = product.images.edges.map((e) => e.node);
  const variants = product.variants.edges.map((e) => e.node);
  const price = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasPriceRange =
    parseFloat(maxPrice.amount) > parseFloat(price.amount);

  const hasRingSizes = variants.some((v) =>
    v.selectedOptions.some((o) => o.name === 'Ring size')
  );

  const getMetafield = (key: string) =>
    product.metafields?.find((m) => m?.key === key)?.value ?? null;

  return (
    <main className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-8">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-charcoal transition-colors">Collections</Link>
        <span>/</span>
        <span className="text-charcoal/70">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div className="md:sticky md:top-24 self-start">
          <ProductGallery images={images} title={product.title} />
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-6">
          {/* Title + price */}
          <div>
            {product.productType && (
              <p className="text-xs tracking-widest uppercase text-charcoal/40 mb-2">
                {product.productType}
              </p>
            )}
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight mb-4">
              {product.title}
            </h1>
            <p className="text-xl text-burgundy font-medium">
              {hasPriceRange
                ? `From ${formatPrice(price.amount, price.currencyCode)}`
                : formatPrice(price.amount, price.currencyCode)}
            </p>
          </div>

          <div className="h-px bg-charcoal/8" />

          {/* Variant selector + add to cart */}
          <AddToCart variants={variants} />

          {/* Ring size guide link */}
          {hasRingSizes && <RingSizeGuide />}

          <div className="h-px bg-charcoal/8" />

          {/* Description */}
          {product.descriptionHtml ? (
            <div
              className="prose prose-sm text-charcoal/70 leading-relaxed max-w-none [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-4"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : product.description ? (
            <p className="text-sm text-charcoal/70 leading-relaxed">
              {product.description}
            </p>
          ) : null}

          {/* Metafield accordions */}
          {[
            { label: "What's Included", value: getMetafield('what_is_included') },
            { label: 'Details', value: getMetafield('product_details') },
            { label: 'Materials', value: getMetafield('product_material') },
          ].map(({ label, value }) =>
            value ? (
              <details key={label} className="group border-t border-charcoal/8 pt-4">
                <summary className="flex items-center justify-between cursor-pointer list-none text-xs tracking-widest uppercase text-charcoal/50 hover:text-charcoal transition-colors">
                  <span>{label}</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </summary>
                <RichText
                  value={value}
                  className="mt-3 text-xs text-charcoal/55 leading-relaxed"
                />
              </details>
            ) : null
          )}

          {/* Shipping note */}
          <details className="group border-t border-charcoal/8 pt-4">
            <summary className="flex items-center justify-between cursor-pointer list-none text-xs tracking-widest uppercase text-charcoal/50 hover:text-charcoal transition-colors">
              <span>Shipping</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </summary>
            <p className="mt-3 text-xs text-charcoal/55 leading-relaxed">
              All New Zealand orders ship for a flat rate of $8 NZD via NZ Post,
              with tracking and a signature required on delivery. Orders typically
              arrive within 2–7 business days (rural may take longer). Made-to-order
              items ship once ready — approximately 4 weeks from order.
            </p>
          </details>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs tracking-wide text-charcoal/40 border border-charcoal/10 px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 border-t border-charcoal/8 pt-12">
        <Suspense fallback={<div className="h-24 animate-pulse bg-charcoal/5" />}>
          <ProductReviews productId={product.id} />
        </Suspense>
      </div>
    </main>
  );
}
