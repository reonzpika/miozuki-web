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
      <div className="relative aspect-square overflow-hidden bg-cream/60 mb-4">
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText ?? title}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            quality={85}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-charcoal/20 text-xs tracking-widest uppercase">
              Miozuki
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div>
        <h3 className="text-sm text-charcoal leading-snug mb-1 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-burgundy font-medium">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
    </Link>
  );
}
