import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/lib/shopify';
import type { CollectionEducationPanel } from '@/lib/collection-page';
import { richTextToPlain, clipAfterNeedAssistanceQuestion } from '@/components/rich-text';

const TRUST_PILLS = [
  { key: 'material', label: 'Sterling silver & 9k gold', featured: true },
  { key: 'custom', label: 'Custom engagement ring', featured: true },
  { key: 'nz', label: 'NZ-based brand', featured: true },
] as const;

const FOUNDER_IMAGE =
  'https://cdn.shopify.com/s/files/1/0797/0819/3023/files/PXL_20241230_060931026_3_480x480.jpg?v=1767920670';

export function CollectionFlagshipAboveGrid({
  collection,
  afterHeroBanner = false,
}: {
  collection: Collection;
  /** When true, breadcrumb, title, and intro are omitted (shown on the collection hero banner above). */
  afterHeroBanner?: boolean;
}) {
  // Only show the curated intro metafield; no fallback to the full description.
  const introRaw =
    collection.metafield?.value != null ? richTextToPlain(collection.metafield.value) : '';
  const intro =
    afterHeroBanner ? null : introRaw.trim()
      ? clipAfterNeedAssistanceQuestion(introRaw.trim())
      : null;

  return (
    <>
      {!afterHeroBanner ? (
        <>
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs uppercase tracking-[0.2em] text-charcoal/65"
          >
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-sm px-1 text-charcoal/65 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:min-h-0 md:py-1"
            >
              Home
            </Link>
            <span className="text-charcoal/25" aria-hidden>
              /
            </span>
            <Link
              href="/collections"
              className="inline-flex min-h-11 items-center rounded-sm px-1 text-charcoal/65 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:min-h-0 md:py-1"
            >
              Collections
            </Link>
            <span className="text-charcoal/25" aria-hidden>
              /
            </span>
            <span className="min-h-11 py-2 text-charcoal/70 md:min-h-0 md:py-1">{collection.title}</span>
          </nav>

          <h1 className="font-serif text-3xl leading-tight text-charcoal md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {collection.title}
          </h1>
          {intro ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/65 md:text-base">{intro}</p>
          ) : null}
        </>
      ) : null}

      <ul
        className={`grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2 ${afterHeroBanner ? 'mt-0' : 'mt-5'}`}
        aria-label="Why shop with Miozuki"
      >
        {TRUST_PILLS.map(({ key, label, featured }) => (
          <li key={key} className="min-w-0 sm:min-w-fit">
            <span
              className={`flex h-full min-h-[3rem] items-center justify-center rounded-md border px-2 py-2 text-center text-[11px] font-medium leading-tight shadow-[0_1px_0_var(--miozuki-shadow)] sm:min-h-11 sm:justify-start sm:px-3 sm:text-left sm:text-xs md:px-3.5 md:text-sm ${
                featured
                  ? 'border-burgundy/25 bg-surface text-charcoal'
                  : 'border-charcoal/15 bg-cream text-charcoal/75'
              }`}
            >
              <span className="min-w-0">{label}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-md border border-charcoal/12 bg-surface/80 p-4">
        <div className="flex gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-charcoal/10">
            <Image
              src={FOUNDER_IMAGE}
              alt="Ting Eguchi, founder of Miozuki"
              width={44}
              height={44}
              className="object-cover object-top"
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-burgundy">From the founder</p>
            <p className="mt-1 text-sm leading-relaxed text-charcoal/80">
              It was spring in Japan when I picked a fortune slip at a shrine - and Miozuki quietly began.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const MOISSANITE_CHIPS = [
  'Brighter fire',
  'Durable for daily wear',
  'A thoughtful modern choice',
] as const;

const PEARL_CHIPS = [
  'Soft natural lustre',
  'Light on the ear',
  'Beautiful layered or worn solo',
] as const;

const BRIDAL_CHIPS = [
  'For brides and bridesmaids',
  'Pearl softness, moissanite sparkle',
  'Designed in Auckland',
] as const;

const gemstoneEducationSectionClass =
  'rounded-md border border-charcoal/12 bg-surface/60 p-6 md:p-8';

const EDUCATION_PANEL_COPY = {
  moissanite: {
    eyebrow: 'What is moissanite?',
    heading: 'A Bright Gemstone with Diamond-Like Brilliance',
    body: 'Loved for its sparkle, clarity, and durability, moissanite brings lasting sparkle to modern jewellery made for everyday wear.',
    chips: MOISSANITE_CHIPS,
    chipsLabel: 'Moissanite highlights',
  },
  pearl: {
    eyebrow: 'What are pearls?',
    heading: 'Organic Gems with Quiet, Lasting Lustre',
    body: 'Cultured pearls build lustre layer by layer, giving each piece a soft glow that pairs beautifully with sharper sparkle. We choose pearls for their understated elegance and everyday wearability.',
    chips: PEARL_CHIPS,
    chipsLabel: 'Pearl highlights',
  },
  bridal: {
    eyebrow: 'Jewellery for the day',
    heading: 'Bridal Pieces Chosen to Outlast the Occasion',
    body: 'Bridal earrings, necklaces and sets that pair pearl softness with moissanite sparkle, chosen to be worn again long after the wedding day.',
    chips: BRIDAL_CHIPS,
    chipsLabel: 'Bridal highlights',
  },
} as const;

export function CollectionFlagshipEducation({ panels }: { panels: CollectionEducationPanel[] }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 md:px-10">
      {panels.map((panel) => {
        const copy = EDUCATION_PANEL_COPY[panel.theme];
        return (
          <section key={panel.theme} className={gemstoneEducationSectionClass}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-charcoal/65">{copy.eyebrow}</p>
            <h2 className="mt-2 font-serif text-xl text-charcoal md:text-2xl">{copy.heading}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/65">{copy.body}</p>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={copy.chipsLabel}>
              {copy.chips.map((label) => (
                <li key={label}>
                  <span className="inline-block rounded-full border border-charcoal/8 bg-cream px-3 py-1.5 text-[11px] text-charcoal/75">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={panel.guideHref}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-charcoal/20 bg-cream px-5 text-sm text-charcoal transition-colors hover:border-burgundy/40 hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {panel.guideLabel}
            </Link>
          </section>
        );
      })}

      <section className="rounded-md border border-charcoal/12 bg-cream p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-charcoal/10">
            <Image
              src={FOUNDER_IMAGE}
              alt="Ting Eguchi, founder of Miozuki"
              width={56}
              height={56}
              className="object-cover object-top"
            />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-charcoal/65">
              Why I created Miozuki
            </p>
            <p className="mt-2 text-sm font-medium text-charcoal">
              Miozuki 澪月 &quot;<span className="italic">Waterway to the Moon</span>&quot; in Japanese.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/65">
          Miozuki was created to bring accessible luxury fine jewellery to women who shine softly yet
          powerfully, because we believe true charisma lives in contrast.
        </p>
        <Link
          href="/pages/about-us"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-charcoal/20 px-5 text-sm text-charcoal transition-colors hover:border-burgundy/40 hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Read our story
        </Link>
      </section>
    </div>
  );
}
