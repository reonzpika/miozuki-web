import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/shopify';
import type { RatingSummary } from '@/lib/judgeme/types';
import StarRating from './star-rating';

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export default function ProductCard({
  product,
  rating,
}: {
  product: Product;
  rating?: RatingSummary;
}) {
  const { handle, title, featuredImage, images, priceRange } = product;
  const price = priceRange.minVariantPrice;

  const allImages = images.edges.map((e) => e.node);
  const primary = featuredImage ?? allImages[0] ?? null;
  const secondary = allImages.find((img) => img.url !== primary?.url) ?? null;

  return (
    <Link href={`/products/${handle}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface mb-3">
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
            {secondary && (
              <Image
                src={secondary.url}
                alt={secondary.altText ?? title}
                fill
                sizes="(max-width: 767px) 70vw, (max-width: 1023px) 33vw, 25vw"
                quality={85}
                className="object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-charcoal/20 text-xs tracking-widest uppercase">Miozuki</span>
          </div>
        )}

        {/* Luxury hover overlay — slides up from bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-charcoal/72 px-4 py-3 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 backdrop-blur-[2px]">
          <p className="text-[10px] tracking-[0.2em] uppercase text-cream text-center">
            View Piece
          </p>
        </div>
      </div>

      {/* Text */}
      <div>
        <h3 className="text-[13px] text-charcoal leading-snug mb-1 line-clamp-2 group-hover:text-charcoal/70 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-[13px] text-burgundy font-medium">
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
