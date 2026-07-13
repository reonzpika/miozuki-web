import Image from 'next/image';
import Link from 'next/link';
import ScrollReveal from '@/components/scroll-reveal';

const SUB_GUIDES = [
  {
    href: '/pearl-guide',
    title: 'The Pearl Guide',
    blurb: 'Freshwater pearls explained: real vs imitation, care, and choosing a pair.',
    image: '/generated/hero-pearl-guide.jpg',
  },
  {
    href: '/bridal-guide',
    title: 'The Bridal Guide',
    blurb: 'Earrings, sets and gifts for the wedding day, and long after it.',
    image: '/generated/hero-bridal-guide.jpg',
  },
] as const;

type GuideImage = {
  url: string;
  alt: string;
};

/**
 * Homepage entry point into the three guide hubs. Asymmetric editorial layout:
 * moissanite guide featured large, pearl and bridal as compact rows.
 * Moissanite card uses a live Shopify product photo, never a generated stand-in.
 */
export default function HomeGuidesSection({
  moissaniteImage,
}: {
  moissaniteImage: GuideImage | null;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-24 md:px-10">
      <ScrollReveal className="mb-10">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-burgundy">Learn before you buy</p>
        <h2 className="font-serif text-3xl text-charcoal md:text-4xl">Honest guides, written by our founder</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/65 md:text-base">
          Everything we wish every buyer knew about moissanite, pearls and bridal jewellery,
          with no pressure attached.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <ScrollReveal className="lg:col-span-3">
          <Link
            href="/moissanite-guide"
            className="group block overflow-hidden rounded-md border border-charcoal/10 bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface">
              {moissaniteImage ? (
                <Image
                  src={moissaniteImage.url}
                  alt={moissaniteImage.alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : null}
            </div>
            <div className="p-6 md:p-8">
              <h3 className="font-serif text-2xl text-charcoal transition-colors group-hover:text-burgundy">
                The Moissanite Guide
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-charcoal/65">
                What moissanite is, how it compares with diamond, lab diamond and cubic
                zirconia, and how to choose a ring you will keep forever.
              </p>
              <span className="mt-4 inline-block text-xs uppercase tracking-widest text-burgundy">
                Start reading
              </span>
            </div>
          </Link>
        </ScrollReveal>

        <div className="flex flex-col gap-6 lg:col-span-2 lg:gap-8">
          {SUB_GUIDES.map((guide, i) => (
            <ScrollReveal key={guide.href} delay={0.08 + i * 0.08} className="flex-1">
              <Link
                href={guide.href}
                className="group flex h-full items-stretch overflow-hidden rounded-md border border-charcoal/10 bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <div className="relative w-28 shrink-0 overflow-hidden sm:w-36">
                  <Image
                    src={guide.image}
                    alt=""
                    fill
                    sizes="9rem"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="flex flex-col justify-center p-5">
                  <h3 className="font-serif text-lg text-charcoal transition-colors group-hover:text-burgundy">
                    {guide.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-charcoal/65">{guide.blurb}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
