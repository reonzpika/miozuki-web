import Image from 'next/image';
import Link from 'next/link';

/** Shopify CDN headshot: PDP founder teaser only (matches home / collections). */
const PDP_FOUNDER_HEADSHOT_SRC =
  'https://cdn.shopify.com/s/files/1/0797/0819/3023/files/PXL_20241230_060931026_3_480x480.jpg?v=1767920670';

export function PdpFounderTeaser() {
  return (
    <section
      aria-labelledby="pdp-founder-heading"
      className="rounded-sm border border-charcoal/8 bg-surface p-5"
    >
      <p className="text-xs uppercase tracking-widest text-charcoal/40">
        Founder&apos;s story
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-charcoal/10">
          <Image
            src={PDP_FOUNDER_HEADSHOT_SRC}
            alt="Ting Eguchi, founder of Miozuki"
            width={56}
            height={56}
            className="object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <blockquote
            id="pdp-founder-heading"
            className="text-sm leading-relaxed text-charcoal/80"
          >
            &ldquo;I created Miozuki to honour the charisma of contrast - the woman who is both soft
            and strong, like pearl and moissanite. It began with a fortune slip in Fukuoka, Japan,
            and became a quiet reminder that true beauty is found in meaning.&rdquo;
          </blockquote>
          <p className="mt-3 text-xs text-charcoal/45">
            Read more on{' '}
            <Link
              href="/pages/our-founder"
              className="text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Our founder
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
