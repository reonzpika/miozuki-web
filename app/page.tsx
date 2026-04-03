import Image from 'next/image';
import Link from 'next/link';
import { getCollections, getProducts } from '@/lib/shopify';
import type { Collection, Product } from '@/lib/shopify';
import ProductCard from '@/components/product-card';

export const revalidate = 60;

export default async function Home() {
  let collections: Collection[] = [];
  let products: Product[] = [];

  try {
    [collections, products] = await Promise.all([
      getCollections(6),
      getProducts(8),
    ]);
  } catch (error) {
    console.error('Failed to fetch Shopify data:', error);
  }

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center bg-cream overflow-hidden">
        {/* Decorative ornament */}
        <div
          className="flex items-center gap-3 mb-10"
          style={{ animation: 'fade-up 0.7s ease both' }}
        >
          <div className="h-px w-10 bg-burgundy/30" />
          <div className="w-1 h-1 bg-burgundy/40 rotate-45" />
          <div className="h-px w-10 bg-burgundy/30" />
        </div>

        <h1
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-charcoal leading-tight tracking-tight mb-6 max-w-3xl"
          style={{ animation: 'fade-up 0.7s 0.1s ease both' }}
        >
          Crafted to Last.
          <br />
          <em>Made to Shine.</em>
        </h1>

        <p
          className="text-sm md:text-base text-charcoal/60 tracking-wide max-w-sm mb-10 leading-relaxed"
          style={{ animation: 'fade-up 0.7s 0.2s ease both' }}
        >
          Moissanite &amp; pearl fine jewellery —<br />
          ethically made, designed in New Zealand.
        </p>

        <Link
          href="/collections"
          className="inline-block bg-burgundy text-cream text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-burgundy/90 transition-colors"
          style={{ animation: 'fade-up 0.7s 0.3s ease both' }}
        >
          Shop Collections
        </Link>

        {/* Bottom ornament */}
        <div
          className="flex items-center gap-3 mt-10"
          style={{ animation: 'fade-up 0.7s 0.4s ease both' }}
        >
          <div className="h-px w-10 bg-burgundy/30" />
          <div className="w-1 h-1 bg-burgundy/40 rotate-45" />
          <div className="h-px w-10 bg-burgundy/30" />
        </div>
      </section>

      {/* ── Collections ──────────────────────────────────── */}
      {collections.length > 0 && (
        <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
              Our Collections
            </h2>
            <Link
              href="/collections"
              className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors hidden md:block"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-cream/60 mb-4">
                  {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText ?? collection.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center border border-charcoal/8">
                      <span className="font-serif text-lg text-charcoal/30 italic">
                        {collection.title}
                      </span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-500 flex items-end justify-center pb-8">
                    <span className="text-xs tracking-[0.2em] uppercase text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View Collection
                    </span>
                  </div>
                </div>
                <h3 className="font-serif text-lg text-charcoal mb-1">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="text-xs text-charcoal/50 line-clamp-2 leading-relaxed">
                    {collection.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────── */}
      {products.length > 0 && (
        <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full border-t border-charcoal/8">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
              New Arrivals
            </h2>
            <Link
              href="/collections/all"
              className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors hidden md:block"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="mt-auto border-t border-charcoal/8 py-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg tracking-[0.2em] uppercase text-charcoal">
            Miozuki
          </span>
          <p className="text-xs text-charcoal/40 tracking-wide text-center">
            Fine jewellery, designed in New Zealand
          </p>
          <p className="text-xs text-charcoal/30">
            © {new Date().getFullYear()} Miozuki
          </p>
        </div>
      </footer>
    </main>
  );
}
