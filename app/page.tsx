import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCollections, getCollectionByHandle } from '@/lib/shopify';
import { getAllRatings } from '@/lib/judgeme/client';
import type { Collection, Product } from '@/lib/shopify';
import HeroSection from '@/components/hero-section';
import HomeShopShortcuts from '@/components/home-shop-shortcuts';
import CollectionsGrid from '@/components/collections-grid';
import BestSellersGrid from '@/components/best-sellers-grid';
import FounderSection from '@/components/founder-section';
import HomeTestimonials from '@/components/home-testimonials';
import HomeGuidesSection from '@/components/home-guides-section';
import FaqAccordion from '@/components/faq-accordion';
import ScrollReveal from '@/components/scroll-reveal';
import JsonLd from '@/components/json-ld';

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

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
    a: 'Yes. Moissanite is a real lab-grown gemstone known for its exceptional brilliance and diamond-like appearance. With a Mohs hardness of 9.25, it is one of the hardest gemstones available, and its refractive index of 2.65 gives it even more fire and sparkle than diamond.',
  },
  {
    q: 'Will moissanite stay sparkly over time?',
    a: 'Yes. Moissanite will stay beautifully brilliant for a lifetime when cared for properly. It does not go cloudy or lose its shine. Avoid contact with chemicals, perfumes, and harsh cleaning products.',
  },
  {
    q: 'How do I know what ring size to order?',
    a: 'We recommend ordering a ring sizer before you order your ring, the cost is credited toward your final purchase. Since our rings are made to order, getting your size right the first time avoids the need for a resize.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'We offer a 14-day return window on most items returned in original packaging and sellable condition. Earrings, custom-made rings, and sale items are non-refundable. We recommend ordering a ring sizer first, the cost is credited toward your ring order.',
  },
  {
    q: 'What if my parcel gets lost or stolen?',
    a: 'All NZ orders are sent via NZ Post with tracking and require a signature on delivery, giving you peace of mind from dispatch to door.',
  },
  {
    q: 'Do you ship to Australia?',
    a: 'Yes, we ship to Australia as well as New Zealand, with tracked delivery. AU orders are shown in AUD at checkout.',
  },
];

// FAQPage schema is generated from HOME_FAQ so the hidden schema can never drift
// from the visible homepage text (Google requires them to match). Business
// identity schema (name, address, founder, etc.) already lives site-wide in
// app/layout.tsx, not duplicated here.
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const DIFFERENTIATORS = [
  {
    label: 'NZ-owned & operated',
    sub: 'Ships from Auckland to NZ & Australia',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c-4.5-4.5-7-8.5-7-11a7 7 0 0 1 14 0c0 2.5-2.5 6.5-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'Signature-only delivery',
    sub: 'Tracked shipping',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
    ),
  },
  {
    label: 'Gift-ready packaging',
    sub: 'Beautifully prepared for gifting or keeping.',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 10.5h16v11H4z" />
        <path d="M4 14h16" />
        <path d="M12 10.5V21.5" />
        <path d="M8.5 10.5V9a3.5 3.5 0 0 1 7 0v1.5" />
      </svg>
    ),
  },
  {
    label: 'Exceptional moissanite brilliance',
    sub: 'Known for its fire and clarity',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.5 20 12 12 20.5 4 12z" />
        <path d="M12 3.5v17" />
        <path d="M4 12h16" />
      </svg>
    ),
  },
];

/** Featured on the home grid (order preserved). Best Sellers is only the product rail below, not a grid tile. */
const HOME_FEATURED_COLLECTION_HANDLES = [
  'moissanite-earrings',
  'moissanite-rings',
  'pearl-earrings',
  'bridal-jewellery',
] as const;

export default async function Home() {
  let all: Collection[] = [];
  try {
    all = await getCollections(50);
  } catch {
    all = [];
  }
  const byHandle = new Map(all.map((c) => [c.handle, c]));

  let products: Product[] = [];

  try {
    const bestSellers = await getCollectionByHandle('best-sellers', 8);
    products = bestSellers?.products.edges.map((e) => e.node) ?? [];
  } catch {
    // best-sellers collection not found
  }

  if (products.length === 0) {
    try {
      const fallback = await getCollectionByHandle('moissanite-nz', 8);
      products = fallback?.products.edges.map((e) => e.node) ?? [];
    } catch {
      // catalog fallback failed
    }
  }

  const seenHandles = new Set<string>();
  const curatedCollections: Collection[] = [];

  for (const handle of HOME_FEATURED_COLLECTION_HANDLES) {
    let c: Collection | null = byHandle.get(handle) ?? null;
    if (!c) {
      try {
        c = await getCollectionByHandle(handle, 1);
      } catch {
        c = null;
      }
    }
    if (c && !seenHandles.has(c.handle)) {
      curatedCollections.push(c);
      seenHandles.add(c.handle);
    }
  }

  if (curatedCollections.length === 0) {
    curatedCollections.push(
      ...all.filter((c) => c.handle !== 'best-sellers').slice(0, 4),
    );
  } else {
    for (const c of all) {
      if (curatedCollections.length >= 4) break;
      if (c.handle === 'best-sellers') continue;
      if (!seenHandles.has(c.handle)) {
        curatedCollections.push(c);
        seenHandles.add(c.handle);
      }
    }
  }

  const ratings = await getAllRatings().catch(() => ({}));

  // Real Shopify product photo for the moissanite guide card (never a generated stand-in).
  let moissaniteGuideImage: { url: string; alt: string } | null = null;
  try {
    const rings = await getCollectionByHandle('moissanite-rings', 4);
    const pick = rings?.products.edges
      .map((e) => e.node)
      .find((p) => p.featuredImage?.url);
    if (pick?.featuredImage) {
      moissaniteGuideImage = {
        url: pick.featuredImage.url,
        alt: pick.featuredImage.altText || pick.title,
      };
    }
  } catch {
    // collection unavailable
  }
  if (!moissaniteGuideImage) {
    const pick = products.find((p) => p.featuredImage?.url);
    if (pick?.featuredImage) {
      moissaniteGuideImage = {
        url: pick.featuredImage.url,
        alt: pick.featuredImage.altText || pick.title,
      };
    }
  }

  return (
    <main>
      <JsonLd data={FAQ_SCHEMA} />
      {/* ── Hero ─────────────────────────────────────────── */}
      <HeroSection />

      <HomeShopShortcuts />

      {/* ── Best Sellers (product-first: most-loved pieces before category browse) ── */}
      {products.length > 0 && (
        <section className="py-24">
          <ScrollReveal className="mb-10 flex max-w-7xl mx-auto flex-col gap-4 px-6 sm:flex-row sm:items-end sm:justify-between md:px-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-burgundy mb-2">Most loved</p>
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal">Best Sellers</h2>
            </div>
            <Link
              href="/collections/best-sellers"
              className="inline-flex min-h-11 shrink-0 items-center text-xs tracking-widest uppercase text-burgundy transition-colors hover:text-burgundy/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              View All
            </Link>
          </ScrollReveal>

          <BestSellersGrid products={products} ratings={ratings} />
        </section>
      )}

      {/* ── Collections ──────────────────────────────────── */}
      {curatedCollections.length > 0 && (
        <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full">
          <ScrollReveal className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-burgundy mb-2">Shop</p>
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal">Our Collections</h2>
            </div>
            <Link
              href="/collections/moissanite-nz"
              className="inline-flex min-h-11 shrink-0 items-center text-xs tracking-widest uppercase text-burgundy transition-colors hover:text-burgundy/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              View All
            </Link>
          </ScrollReveal>

          <CollectionsGrid collections={curatedCollections} />
        </section>
      )}

      {/* ── Social proof: real Judge.me reviews ───────────── */}
      <HomeTestimonials />

      {/* ── Founder ───────────────────────────────────────── */}
      <FounderSection />

      {/* ── Differentiator strip ─────────────────────────── */}
      <section className="w-full bg-burgundy py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-4">
              {DIFFERENTIATORS.map(({ label, sub, svg }) => (
                <div key={label} className="flex flex-col items-center text-center gap-3">
                  <div className="text-cream">{svg}</div>
                  <div>
                    <p className="text-sm font-medium text-cream">{label}</p>
                    <p className="text-xs text-cream/75 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Accessible Luxury ─────────────────────────────── */}
      <section className="overflow-hidden">
        <div className="relative h-[50vh] min-h-[17.5rem] w-full md:h-[60vh] md:min-h-[22.5rem]">
          <Image
            src="/generated/accessible-luxury.webp"
            alt="Woman in profile wearing a large baroque pearl earring, warm neutral studio light"
            fill
            sizes="100vw"
            quality={82}
            className="object-cover object-[72%_32%] sm:object-[68%_center] md:object-[56%_center]"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent text-center px-6">
            <ScrollReveal delay={0.1}>
              <p className="text-xs tracking-[0.3em] uppercase text-cream/60 mb-3">
                Accessible Luxury
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-cream leading-tight mb-6">
                Fine jewellery for romantic<br />moments to everyday elegance
              </h2>
              <Link
                href="/collections/moissanite-nz"
                className="inline-block text-xs tracking-[0.2em] uppercase text-cream border border-cream/40 px-8 py-3 hover:bg-cream hover:text-charcoal transition-colors duration-300"
              >
                Shop the Collection
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Guide hubs entry ──────────────────────────────── */}
      <HomeGuidesSection moissaniteImage={moissaniteGuideImage} />

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
            href="/moissanite-guide"
            className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors underline underline-offset-4"
          >
            Full Moissanite Guide
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
