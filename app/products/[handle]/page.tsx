import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProducts, getProductByHandle } from '@/lib/shopify';
import RichText from '@/components/rich-text';
import ProductGallery from '@/components/product-gallery';
import AddToCart from '@/components/add-to-cart';
import PdpTrustStrip from '@/components/pdp-trust-strip';
import ProductReviews from '@/components/product-reviews';
import ProductRatingSummary from '@/components/product-rating-summary';

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
          {/* Title, rating, variant-aware price, and add to cart */}
          <div>
            {product.productType && (
              <p className="text-xs tracking-widest uppercase text-charcoal/40 mb-2">
                {product.productType}
              </p>
            )}
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight mb-3">
              {product.title}
            </h1>
            <div className="mb-4">
              <Suspense fallback={null}>
                <ProductRatingSummary productId={product.id} />
              </Suspense>
            </div>
            <AddToCart variants={variants} priceRange={product.priceRange} />
          </div>

          {/* Trust strip */}
          <PdpTrustStrip />

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

          {/* Materials — always renders, metafield first then stone data fallback */}
          <details className="group border-t border-charcoal/8 pt-4">
            <summary className="flex items-center justify-between cursor-pointer list-none text-xs tracking-widest uppercase text-charcoal/50 hover:text-charcoal transition-colors">
              <span>Materials</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </summary>
            {getMetafield('product_material') && (
              <RichText
                value={getMetafield('product_material') as string}
                className="mt-3 text-xs text-charcoal/55 leading-relaxed"
              />
            )}
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-charcoal/55 leading-relaxed">
              <dt className="text-charcoal/40">Stone</dt>
              <dd>Lab-grown moissanite</dd>
              <dt className="text-charcoal/40">Hardness</dt>
              <dd>Mohs 9.25 (second only to diamond)</dd>
              <dt className="text-charcoal/40">Refractive index</dt>
              <dd>2.65 (greater fire than diamond)</dd>
              <dt className="text-charcoal/40">Colour</dt>
              <dd>DEF (colourless grade)</dd>
              <dt className="text-charcoal/40">Clarity</dt>
              <dd>VVS</dd>
              <dt className="text-charcoal/40">Certification</dt>
              <dd>AGS or IGI graded</dd>
            </dl>
          </details>

          {/* Shipping note */}
          <details className="group border-t border-charcoal/8 pt-4">
            <summary className="flex items-center justify-between cursor-pointer list-none text-xs tracking-widest uppercase text-charcoal/50 hover:text-charcoal transition-colors">
              <span>Shipping</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </summary>
            <p className="mt-3 text-xs text-charcoal/55 leading-relaxed">
              Free New Zealand shipping on orders over $150 NZD via NZ Post,
              tracked and signature required on delivery. Orders under $150
              ship for a flat $8 NZD. Typical delivery 2–7 business days
              (rural may take longer). Made-to-order items ship once ready —
              approximately 4 weeks from order.
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
      <div id="reviews" className="mt-16 border-t border-charcoal/8 pt-12">
        <Suspense fallback={<div className="h-24 animate-pulse bg-charcoal/5" />}>
          <ProductReviews productId={product.id} />
        </Suspense>
      </div>
    </main>
  );
}
