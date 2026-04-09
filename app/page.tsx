import Image from 'next/image';
import Link from 'next/link';
import { getCollections, getCollectionByHandle } from '@/lib/shopify';
import { getAllRatings } from '@/lib/judgeme/client';
import type { Product } from '@/lib/shopify';
import HeroSection from '@/components/hero-section';
import CollectionsGrid from '@/components/collections-grid';
import BestSellersGrid from '@/components/best-sellers-grid';
import FounderSection from '@/components/founder-section';
import FaqAccordion from '@/components/faq-accordion';
import EmailCapture from '@/components/email-capture';
import ScrollReveal from '@/components/scroll-reveal';

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
    a: 'Yes. Moissanite is a real lab-grown gemstone with exceptional brilliance. Mohs hardness 9.25, refractive index 2.65 — chosen for its own optical properties, not as a substitute.',
  },
  {
    q: 'Will moissanite stay sparkly over time?',
    a: 'Yes. Moissanite will stay beautifully brilliant for a lifetime when cared for properly. It does not go cloudy or lose its shine. Avoid contact with chemicals, perfumes, and harsh cleaning products.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'We offer a 30-day return window on most items returned in original packaging and sellable condition. Earrings, custom-made rings, and sale items are non-refundable. We recommend ordering a ring sizer first — the cost is credited toward your ring order.',
  },
  {
    q: 'What if my parcel gets lost or stolen?',
    a: 'All NZ orders are sent via NZ Post with tracking and require a signature on delivery, giving you peace of mind from dispatch to door.',
  },
];

function SectionDivider() {
  return (
    <div className="section-divider py-0">
      <span />
    </div>
  );
}

const DIFFERENTIATORS = [
  {
    label: 'NZ-owned & operated',
    sub: 'Ships from Auckland',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c-4.5-4.5-7-8.5-7-11a7 7 0 0 1 14 0c0 2.5-2.5 6.5-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'Lifetime warranty',
    sub: 'On every piece',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Mohs 9.25 hardness',
    sub: 'Exceptional durability',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const ALLOWED_COLLECTION_HANDLES = [
  'moissanite-ear-rings',
  'moissanite-rings',
  'pearl-earrings',
  'bridal-jewellery',
];

export default async function Home() {
  const all = await getCollections(20).catch(() => []);
  const byHandle = new Map(all.map((c) => [c.handle, c]));
  const collections = ALLOWED_COLLECTION_HANDLES.flatMap((h) => {
    const c = byHandle.get(h);
    return c ? [c] : [];
  });

  let products: Product[] = [];

  try {
    const bestSellers = await getCollectionByHandle('best-sellers', 8);
    products = bestSellers?.products.edges.map((e) => e.node) ?? [];
  } catch {
    // best-sellers collection not found
  }

  const ratings = await getAllRatings().catch(() => ({}));

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Collections ──────────────────────────────────── */}
      {collections.length > 0 && (
        <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full">
          <ScrollReveal className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-burgundy mb-2">Shop</p>
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal">Our Collections</h2>
            </div>
            <Link
              href="/collections/all-moissanite-pearl-nz"
              className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors hidden md:block"
            >
              View All
            </Link>
          </ScrollReveal>

          <CollectionsGrid collections={collections} />
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <SectionDivider />
      </div>

      {/* ── Founder ───────────────────────────────────────── */}
      <FounderSection />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <SectionDivider />
      </div>

      {/* ── Best Sellers ──────────────────────────────────── */}
      {products.length > 0 && (
        <section className="py-24">
          <ScrollReveal className="flex items-end justify-between mb-10 px-6 md:px-10 max-w-7xl mx-auto">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-burgundy mb-2">Most loved</p>
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal">Best Sellers</h2>
            </div>
            <Link
              href="/collections/best-sellers"
              className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors hidden md:block"
            >
              View All
            </Link>
          </ScrollReveal>

          <BestSellersGrid products={products} ratings={ratings} />
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <SectionDivider />
      </div>

      {/* ── Differentiator strip ─────────────────────────── */}
      <section className="py-16 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            {DIFFERENTIATORS.map(({ label, sub, svg }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3">
                <div className="text-burgundy/70">{svg}</div>
                <div>
                  <p className="text-sm font-medium text-charcoal">{label}</p>
                  <p className="text-xs text-charcoal/45 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ── Accessible Luxury ─────────────────────────────── */}
      <section className="overflow-hidden">
        <div className="relative">
          <Image
            src="/generated/accessible-luxury.jpg"
            alt="Editorial still life — burgundy silk, handmade ceramic vessel and oatmeal linen on cream linen, soft Auckland window light"
            width={2048}
            height={1366}
            sizes="100vw"
            className="w-full h-[50vh] md:h-[60vh] object-cover object-center"
          />
          <div className="absolute inset-0 bg-charcoal/38 flex flex-col items-center justify-center text-center px-6">
            <ScrollReveal delay={0.1}>
              <p className="text-xs tracking-[0.3em] uppercase text-cream/60 mb-3">
                Accessible Luxury
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-cream leading-tight mb-6">
                Fine jewellery for romantic<br />moments to everyday elegance
              </h2>
              <Link
                href="/collections/all-moissanite-pearl-nz"
                className="inline-block text-xs tracking-[0.2em] uppercase text-cream border border-cream/40 px-8 py-3 hover:bg-cream hover:text-charcoal transition-colors duration-300"
              >
                Shop the Collection
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Social proof placeholder ─────────────────────── */}
      {/* TODO: replace with "As Featured In" press logos once first press mention secured.
          Target: NZ Herald Viva, Denizen, Together Journal, Fashion Quarterly. */}
      <section className="py-14 px-6 border-t border-charcoal/8">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
            <div>
              <p className="font-serif text-2xl text-charcoal mb-0.5">9.25</p>
              <p className="text-xs tracking-widest uppercase text-charcoal/45">Mohs hardness</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-charcoal/10" />
            <div>
              <p className="font-serif text-2xl text-charcoal mb-0.5">2.65</p>
              <p className="text-xs tracking-widest uppercase text-charcoal/45">Refractive index</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-charcoal/10" />
            <div>
              <p className="font-serif text-2xl text-charcoal mb-0.5">AGS / IGI</p>
              <p className="text-xs tracking-widest uppercase text-charcoal/45">Certified grading</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-charcoal/10" />
            <div>
              <p className="font-serif text-2xl text-charcoal mb-0.5">NZ-owned</p>
              <p className="text-xs tracking-widest uppercase text-charcoal/45">Ships from Auckland</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Email capture ─────────────────────────────────── */}
      <EmailCapture />

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-10 max-w-3xl mx-auto w-full">
        <ScrollReveal className="mb-12 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-burgundy mb-3">Questions</p>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
            Frequently Asked Questions
          </h2>
        </ScrollReveal>

        <FaqAccordion items={HOME_FAQ} />

        <ScrollReveal delay={0.1} className="mt-10 text-center">
          <Link
            href="/pages/moissanite-faq"
            className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors underline underline-offset-4"
          >
            Full Moissanite Guide
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
