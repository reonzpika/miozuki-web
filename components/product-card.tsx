'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/shopify';
import type { RatingSummary } from '@/lib/judgeme/types';
import { useHoverCapable } from '@/hooks/use-hover-capable';
import { MiozukiBrandLogo } from '@/components/miozuki-brand-logo';
import StarRating from './star-rating';

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

const BADGE_KEYWORDS = [
  'best seller',
  'bestseller',
  'bridal',
  'gift',
  'popular',
  'pearl',
] as const;

/** Flagship grid pills: force copy when a SKU should read as bridal regardless of tag order. */
const FLAGSHIP_BADGE_BY_HANDLE: Record<string, string> = {
  'emerald-cut-moissanite-hoop': 'Bridal',
};

function pickCollectionBadge(tags: string[]): string | null {
  const lower = tags.map((t) => t.toLowerCase());
  for (const key of BADGE_KEYWORDS) {
    const i = lower.findIndex((t) => t.includes(key));
    if (i >= 0) {
      const raw = tags[i];
      return raw.length > 22 ? `${raw.slice(0, 19)}…` : raw;
    }
  }
  return null;
}

function pickFlagshipBadge(handle: string, tags: string[]): string | null {
  const forced = FLAGSHIP_BADGE_BY_HANDLE[handle];
  if (forced !== undefined) return forced;
  return pickCollectionBadge(tags);
}

function productMetaLine(product: Product): string | null {
  if (product.productType?.trim()) return product.productType.trim();
  const bits = product.tags.filter(Boolean).slice(0, 2);
  return bits.length ? bits.join(' · ') : null;
}

export default function ProductCard({
  product,
  rating,
  layout = 'default',
}: {
  product: Product;
  rating?: RatingSummary;
  layout?: 'default' | 'flagship';
}) {
  const hoverCapable = useHoverCapable();
  const { handle, title, featuredImage, images, priceRange, tags } = product;
  const price = priceRange.minVariantPrice;
  const badge = layout === 'flagship' ? pickFlagshipBadge(handle, tags) : null;
  const meta = layout === 'flagship' ? productMetaLine(product) : null;
  const href = `/products/${handle}`;

  const allImages = images.edges.map((e) => e.node);
  const primary = featuredImage ?? allImages[0] ?? null;
  const secondary =
    hoverCapable && primary
      ? (allImages.find((img) => img.url !== primary.url) ?? null)
      : null;

  return (
    <Link href={href} className="group block w-full">
      {/* Image */}
      <div
        className={`relative mb-3 overflow-hidden border border-charcoal/12 bg-champagne shadow-[0_12px_36px_rgb(31_31_31/0.08)] ${layout === 'flagship' ? 'aspect-[10/13] rounded-sm' : 'aspect-[4/5] rounded-lg'}`}
      >
        {badge ? (
          <div className="pointer-events-none absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] rounded-full border border-burgundy/25 bg-burgundy px-2.5 py-1 text-[10px] leading-tight text-cream tracking-wide uppercase">
            {badge}
          </div>
        ) : null}
        {primary ? (
          <>
            <Image
              src={primary.url}
              alt={primary.altText ?? title}
              fill
              sizes="(max-width: 767px) 70vw, (max-width: 1023px) 33vw, 25vw"
              quality={85}
              className={`object-cover transition-opacity duration-500 ease-out${secondary ? ' group-hover:opacity-0' : ''}`}
            />
            {secondary ? (
              <Image
                src={secondary.url}
                alt={secondary.altText ?? title}
                fill
                sizes="(max-width: 767px) 70vw, (max-width: 1023px) 33vw, 25vw"
                quality={85}
                className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MiozukiBrandLogo variant="dark" className="h-11 w-auto opacity-25 pointer-events-none select-none" />
          </div>
        )}

        {hoverCapable ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-burgundy/90 px-4 py-3 backdrop-blur-[2px] transition-transform duration-300 ease-out group-hover:translate-y-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-cream text-center">
              View Piece
            </p>
          </div>
        ) : null}
      </div>

      {/* Text */}
      <div>
        <h3
          className={`text-[13px] text-charcoal leading-snug mb-1 line-clamp-2 transition-colors duration-200${hoverCapable ? ' group-hover:text-charcoal/70' : ''}`}
        >
          {title}
        </h3>
        {meta ? (
          <p className="mb-1 line-clamp-2 text-[11px] leading-snug text-charcoal/50">{meta}</p>
        ) : null}
        <p className="text-[13px] text-graphite font-medium tabular-nums">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
        {rating && rating.count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={rating.rating} size={11} />
            <span className="text-[11px] text-charcoal/40">({rating.count})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
