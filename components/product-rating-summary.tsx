import { getProductReviews } from '@/lib/judgeme/client';
import StarRating from './star-rating';

export default async function ProductRatingSummary({
  productId,
}: {
  productId: string;
}) {
  const { product } = await getProductReviews(productId);
  if (!product || product.reviews_count === 0) return null;

  return (
    <a
      href="#reviews"
      className="flex items-center gap-2 w-fit group"
      aria-label={`${product.rating.toFixed(1)} out of 5, ${product.reviews_count} ${product.reviews_count === 1 ? 'review' : 'reviews'}`}
    >
      <StarRating rating={product.rating} size={14} />
      <span className="text-xs font-medium text-charcoal/70">
        {product.rating.toFixed(1)}
      </span>
      <span className="text-xs text-charcoal/50 group-hover:text-charcoal/70 transition-colors">
        {product.reviews_count === 1
          ? '1 review'
          : `${product.reviews_count} reviews`}
      </span>
    </a>
  );
}
