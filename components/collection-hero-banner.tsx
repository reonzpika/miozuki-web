import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/lib/shopify';
import { usesPearlHeroArt } from '@/lib/collection-hero-art';
import { resolvePearlBannerImageSrc } from '@/lib/pearl-banner-image';
import { richTextToPlain, clipAfterNeedAssistanceQuestion } from '@/components/rich-text';

const FALLBACK_HERO_IMAGE =
  'https://cdn.shopify.com/s/files/1/0797/0819/3023/files/hero-image.webp?v=1773198093';

const PEARL_HERO_ALT =
  'Profile portrait baroque pearl stud earring, soft studio light, warm neutral backdrop';

type Props = {
  collection: Collection;
};

export default function CollectionHeroBanner({ collection }: Props) {
  const usePearlHero = usesPearlHeroArt(collection.handle);
  const imageUrl = usePearlHero
    ? resolvePearlBannerImageSrc()
    : (collection.image?.url ?? FALLBACK_HERO_IMAGE);
  const imageAlt = usePearlHero
    ? PEARL_HERO_ALT
    : (collection.image?.altText ?? collection.title);
  /**
   * Original portrait framing: pearl sits upper-middle; a short banner crops hard with cover only,
   * so focal points bias the jewel into view on all widths.
   */
  const pearlBannerImageClass =
    'object-cover object-[50%_8%] md:object-[50%_26%] lg:object-[48%_26%] xl:object-[49%_25%]';

  const imagePositionClass = usePearlHero
    ? pearlBannerImageClass
    : 'object-cover object-center';

  const crumbBand = 'text-cream/50';
  const crumbLink = usePearlHero
    ? 'inline-flex min-h-8 items-center rounded-sm px-0.5 text-cream/60 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/45 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal/50 md:min-h-0 md:py-0.5'
    : 'inline-flex min-h-10 items-center rounded-sm px-0.5 text-cream/60 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/45 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal/50 md:min-h-0 md:py-0.5';
  const crumbDivider = 'text-cream/35';
  const crumbCurrent = 'text-cream/85';
  const headlineColor = 'text-cream';
  const blurbTone = 'text-cream/75';

  // Only show the curated intro metafield; if a collection has none, show nothing
  // (no fallback to the long SEO description, which would render as a wall of text).
  const blurbRaw =
    collection.metafield?.value != null ? richTextToPlain(collection.metafield.value) : '';
  const blurb = blurbRaw.trim() ? clipAfterNeedAssistanceQuestion(blurbRaw.trim()) : '';

  const bannerImage = (
    <Image
      src={imageUrl}
      alt={imageAlt}
      fill
      priority
      // priority alone does not emit the fetchpriority attribute, and this banner is
      // the LCP element on every collection page; keep both, like the home hero.
      fetchPriority="high"
      sizes="100vw"
      className={imagePositionClass}
    />
  );

  // About one-third of the screen on short viewports; capped so tall monitors keep a slim strip.
  const sectionHeightClass = usePearlHero
    ? 'h-[28svh] max-h-[12rem] min-h-[9.5rem] md:h-[22svh] md:max-h-[11rem] md:min-h-[9.5rem]'
    : 'h-[33svh] max-h-[12rem] min-h-[10rem] md:h-[28svh] md:max-h-[11rem] md:min-h-[10rem]';

  const contentPaddingClass = usePearlHero
    ? 'px-5 py-2 md:px-10 md:py-4'
    : 'px-5 py-3 md:px-10 md:py-4';

  return (
    <section
      className={`relative flex flex-col justify-center overflow-hidden text-center md:text-left ${sectionHeightClass}`}
    >
      {usePearlHero ? (
        <div className="absolute inset-0 overflow-hidden bg-cream">{bannerImage}</div>
      ) : (
        bannerImage
      )}
      {!usePearlHero ? (
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-r from-charcoal/65 via-charcoal/45 to-charcoal/30"
          aria-hidden
        />
      ) : (
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-r from-charcoal/55 via-charcoal/35 to-charcoal/15"
          aria-hidden
        />
      )}

      <div
        className={`relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center md:items-start md:text-left ${contentPaddingClass}`}
      >
        <nav
          aria-label="Breadcrumb"
          className={`mb-0.5 flex flex-wrap items-center justify-center gap-x-1 gap-y-0 text-[9px] uppercase tracking-[0.2em] md:mb-2 md:justify-start md:text-[11px] ${crumbBand}`}
        >
          <Link href="/" className={crumbLink}>
            Home
          </Link>
          <span className={crumbDivider} aria-hidden>
            /
          </span>
          <Link href="/collections" className={crumbLink}>
            Collections
          </Link>
          <span className={crumbDivider} aria-hidden>
            /
          </span>
          <span className={`py-0.5 md:min-h-0 md:py-0.5 ${usePearlHero ? 'min-h-0' : 'min-h-10 py-1.5'} ${crumbCurrent}`}>{collection.title}</span>
        </nav>

        <h1
          className={`max-w-3xl font-serif leading-snug tracking-tight md:text-2xl lg:text-[1.65rem] lg:leading-snug ${usePearlHero ? 'line-clamp-2 text-sm md:line-clamp-none md:text-2xl' : 'text-xl'} ${headlineColor}`}
        >
          {collection.title}
        </h1>

        {blurb ? (
          <p
            className={`mt-1 max-w-3xl text-xs leading-snug md:mt-1.5 md:text-sm ${usePearlHero ? 'hidden md:block' : ''} ${blurbTone}`}
          >
            {blurb}
          </p>
        ) : null}
      </div>
    </section>
  );
}
