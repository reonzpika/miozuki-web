import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/lib/shopify';
import { usesPearlHeroArt } from '@/lib/collection-hero-art';
import { resolvePearlBannerImageSrc } from '@/lib/pearl-banner-image';
import { richTextToPlain, clipAfterNeedAssistanceQuestion } from '@/components/rich-text';

const FALLBACK_HERO_IMAGE =
  'https://miozuki.co.nz/cdn/shop/files/hero-image.webp?v=1773198093';

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
   * Original portrait framing: pearl sits upper-middle; shallow banners crop hard with cover only,
   * so favour a slightly taller strip (section min-heights) and focal points that bias the jewel into view on all widths.
   */
  const pearlBannerImageClass =
    'object-cover object-[48%_30%] sm:object-[46%_29%] md:object-[50%_26%] lg:object-[48%_26%] xl:object-[49%_25%]';

  const imagePositionClass = usePearlHero
    ? pearlBannerImageClass
    : 'object-cover object-center';

  const crumbBand = usePearlHero ? 'text-charcoal/45' : 'text-cream/50';
  const crumbLink = usePearlHero
    ? 'inline-flex min-h-10 items-center rounded-sm px-0.5 text-charcoal/60 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:min-h-0 md:py-0.5'
    : 'inline-flex min-h-10 items-center rounded-sm px-0.5 text-cream/60 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/45 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal/50 md:min-h-0 md:py-0.5';
  const crumbDivider = usePearlHero ? 'text-charcoal/30' : 'text-cream/35';
  const crumbCurrent = usePearlHero ? 'text-charcoal' : 'text-cream/85';
  const headlineColor = usePearlHero ? 'text-charcoal' : 'text-cream';
  const blurbTone = usePearlHero ? 'text-charcoal/65' : 'text-cream/68';

  const blurbRaw =
    collection.metafield?.value != null
      ? richTextToPlain(collection.metafield.value)
      : (collection.description ?? '');
  const blurb = blurbRaw.trim() ? clipAfterNeedAssistanceQuestion(blurbRaw.trim()) : '';

  const bannerImage = (
    <Image
      src={imageUrl}
      alt={imageAlt}
      fill
      priority
      sizes="100vw"
      className={imagePositionClass}
    />
  );

  return (
    <section className="relative flex min-h-[16rem] flex-col justify-center overflow-hidden text-center sm:min-h-[16.75rem] md:min-h-[18.25rem] md:text-left">
      {usePearlHero ? (
        <div className="absolute inset-0 overflow-hidden bg-cream">{bannerImage}</div>
      ) : (
        bannerImage
      )}
      {!usePearlHero ? (
        <div className="absolute inset-0 bg-charcoal/28" aria-hidden />
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-5 py-6 md:items-start md:px-10 md:py-7">
        <nav
          aria-label="Breadcrumb"
          className={`mb-2 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-[10px] uppercase tracking-[0.22em] md:justify-start md:text-[11px] ${crumbBand}`}
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
          <span className={`min-h-10 py-1.5 md:min-h-0 md:py-0.5 ${crumbCurrent}`}>{collection.title}</span>
        </nav>

        <h1
          className={`max-w-3xl font-serif text-xl leading-snug tracking-tight md:text-2xl lg:text-[1.65rem] lg:leading-snug ${headlineColor}`}
        >
          {collection.title}
        </h1>

        {blurb ? (
          <p
            className={`mt-1.5 max-w-3xl text-xs leading-snug sm:text-sm ${blurbTone}`}
          >
            {blurb}
          </p>
        ) : null}
      </div>
    </section>
  );
}
