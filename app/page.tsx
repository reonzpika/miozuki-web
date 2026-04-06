import Image from 'next/image';
import Link from 'next/link';
import { getCollections, getCollectionByHandle } from '@/lib/shopify';
import type { Product } from '@/lib/shopify';
import ProductCard from '@/components/product-card';

export const revalidate = 60;

const HOME_FAQ = [
  {
    q: 'Is Miozuki a local New Zealand business?',
    a: 'Yes, we are a Japanese-inspired small business based in Auckland, New Zealand. All orders are shipped directly from Auckland via NZ Post.',
  },
  {
    q: 'What material is used for Miozuki jewellery?',
    a: 'All Miozuki pieces are crafted in genuine 925 sterling silver, stamped S925 as a mark of authenticity, and finished with rhodium plating for extra shine and durability.',
  },
  {
    q: 'Is moissanite a real gemstone? Does it look like a diamond?',
    a: 'Yes. Moissanite is a real lab-grown gemstone with exceptional brilliance. While it is not a diamond, it closely mirrors the look of one — with a bright, graceful shimmer that often outshines diamond.',
  },
  {
    q: 'Will moissanite stay sparkly over time?',
    a: 'Yes. Moissanite will stay beautifully brilliant for a lifetime when cared for properly. It does not go cloudy or lose its shine. Avoid contact with chemicals, perfumes, and harsh cleaning products.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'Some items are subject to a 14-day refund policy if returned in original packaging and sellable condition. Earrings, custom-made rings, and sale items are non-refundable. We recommend ordering a ring sizer first — the cost is credited toward your final ring order.',
  },
  {
    q: 'What if my parcel gets lost or stolen?',
    a: 'All NZ orders are sent via NZ Post with tracking and require a signature on delivery, giving you peace of mind from dispatch to door.',
  },
];

export default async function Home() {
  let collections = await getCollections(6).catch(() => []);
  let products: Product[] = [];

  try {
    const bestSellers = await getCollectionByHandle('best-sellers', 8);
    products = bestSellers?.products.edges.map((e) => e.node) ?? [];
  } catch {
    // best-sellers collection not found — leave products empty
  }

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://miozuki.co.nz/cdn/shop/files/hero-image.webp?v=1773198093"
          alt="Miozuki fine jewellery"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-charcoal/40" />

        {/* Content */}
        <div className="relative z-10 px-6 flex flex-col items-center">
          <div
            className="flex items-center gap-3 mb-8"
            style={{ animation: 'fade-up 0.7s ease both' }}
          >
            <div className="h-px w-10 bg-cream/40" />
            <div className="w-1 h-1 bg-cream/50 rotate-45" />
            <div className="h-px w-10 bg-cream/40" />
          </div>

          <h1
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-tight tracking-tight mb-4 max-w-3xl"
            style={{ animation: 'fade-up 0.7s 0.1s ease both' }}
          >
            Modern Diamond
            <br />
            <em>Alternatives in NZ</em>
          </h1>

          <p
            className="text-sm md:text-base text-cream/80 tracking-wide max-w-sm mb-10 leading-relaxed"
            style={{ animation: 'fade-up 0.7s 0.2s ease both' }}
          >
            Moissanite &amp; Pearl Fine Jewellery
          </p>

          <Link
            href="/collections/all-moissanite-pearl-nz"
            className="inline-block bg-cream text-charcoal text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-cream/90 transition-colors"
            style={{ animation: 'fade-up 0.7s 0.3s ease both' }}
          >
            Shop Now
          </Link>

          <div
            className="flex items-center gap-3 mt-10"
            style={{ animation: 'fade-up 0.7s 0.4s ease both' }}
          >
            <div className="h-px w-10 bg-cream/40" />
            <div className="w-1 h-1 bg-cream/50 rotate-45" />
            <div className="h-px w-10 bg-cream/40" />
          </div>
        </div>
      </section>

      {/* ── Shop Moissanite NZ / Brand Story ─────────────── */}
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Text */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-burgundy mb-4">
              Shop Moissanite NZ
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight mb-6">
              For women who choose<br />
              <em>meaning over tradition.</em>
            </h2>
            <p className="text-sm text-charcoal/60 leading-relaxed mb-6 max-w-md">
              Hi, I'm Ting Eguchi, founder of Miozuki. We are a small NZ jewellery brand,
              crafted with the idea of&nbsp;<em>accessible luxury</em> in mind. It all
              started with a fortune slip I picked at a shrine in Japan back in 2025 — and
              became the story of this brand.
            </p>
            <Link
              href="/pages/about-us"
              className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors underline underline-offset-4"
            >
              About Miozuki
            </Link>
          </div>

          {/* Founder image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src="https://miozuki.co.nz/cdn/shop/files/PXL_20241230_060931026_3_cd8ca67f-1ad0-45d2-99fb-0d11db68810d.jpg?v=1775102318"
              alt="Ting Eguchi, founder of Miozuki"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* ── Collections ──────────────────────────────────── */}
      {collections.length > 0 && (
        <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto w-full border-t border-charcoal/8">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
              Our Collections
            </h2>
            <Link
              href="/collections/all-moissanite-pearl-nz"
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

      {/* ── Best Sellers ──────────────────────────────────── */}
      {products.length > 0 && (
        <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto w-full border-t border-charcoal/8">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
              Best Sellers
            </h2>
            <Link
              href="/collections/best-sellers"
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

      {/* ── Accessible Luxury ─────────────────────────────── */}
      <section className="border-t border-charcoal/8">
        <div className="relative">
          <Image
            src="https://miozuki.co.nz/cdn/shop/files/Generated_Image_October_03_2025_-_1_19PM.jpg?v=1769746362"
            alt="Accessible luxury jewellery"
            width={2048}
            height={1366}
            sizes="100vw"
            className="w-full h-[50vh] md:h-[60vh] object-cover object-center"
          />
          <div className="absolute inset-0 bg-charcoal/35 flex flex-col items-center justify-center text-center px-6">
            <p className="text-xs tracking-[0.3em] uppercase text-cream/70 mb-3">
              Accessible Luxury
            </p>
            <h2 className="font-serif text-3xl md:text-5xl text-cream leading-tight mb-4">
              Fine jewellery for romantic<br />moments to everyday elegance
            </h2>
            <Link
              href="/collections/all-moissanite-pearl-nz"
              className="mt-2 text-xs tracking-[0.2em] uppercase text-cream border border-cream/40 px-8 py-3 hover:bg-cream hover:text-charcoal transition-colors"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-10 max-w-3xl mx-auto w-full">
        <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-charcoal/8">
          {HOME_FAQ.map(({ q, a }) => (
            <details key={q} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium text-charcoal/80 hover:text-charcoal group-open:text-burgundy transition-colors">
                <span>{q}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180"
                >
                  <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-charcoal/60 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
