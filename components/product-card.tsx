import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/shopify';

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export default function ProductCard({ product }: { product: Product }) {
  const { handle, title, featuredImage, priceRange } = product;
  const price = priceRange.minVariantPrice;

  return (
    <Link href={`/products/${handle}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface mb-3">
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText ?? title}
            fill
            sizes="(max-width: 767px) 70vw, (max-width: 1023px) 33vw, 25vw"
            quality={85}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
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
      </div>
    </Link>
  );
}
