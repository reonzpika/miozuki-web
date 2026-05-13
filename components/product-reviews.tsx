import Link from 'next/link';
import { getProductReviews } from '@/lib/judgeme/client';
import { storefrontProductJudgeMeReviewsUrl } from '@/lib/judgeme/storefront-origin';
import type { JudgeMeReview } from '@/lib/judgeme/types';
import { ProductReviewWriteDisclosure } from './product-review-write-disclosure';
import StarRating from './star-rating';

function ReviewCard({ review }: { review: JudgeMeReview }) {
  const date = new Date(review.created_at).toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="py-6 border-t border-charcoal/8">
      <div className="flex items-center justify-between mb-3">
        <StarRating rating={review.rating} size={14} />
        <time className="text-xs text-charcoal/40">{date}</time>
      </div>
      {review.title && (
        <p className="font-serif text-sm text-charcoal mb-1">{review.title}</p>
      )}
      {review.body && (
        <p className="text-sm text-charcoal/70 leading-relaxed mb-3">
          {review.body}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-charcoal/80">
          {review.reviewer.name}
        </span>
        {review.verified === 'verified_buyer' && (
          <span className="text-[10px] tracking-wide bg-burgundy/10 text-burgundy px-2 py-0.5">
            Verified Buyer
          </span>
        )}
      </div>
    </article>
  );
}

export default async function ProductReviews({
  productId,
  productHandle,
  productTitle,
}: {
  productId: string;
  productHandle: string;
  productTitle: string;
}) {
  const { product, reviews } = await getProductReviews(productId);
  const count = product?.reviews_count ?? 0;
  const avgRating = product?.rating ?? 0;

  const reviewFormHref = storefrontProductJudgeMeReviewsUrl(productHandle);
  const shopifyProductNumericId = productId.split('/').pop() ?? '';
  return (
    <section>
      <h2 className="font-serif text-2xl text-charcoal mb-6">Reviews</h2>

      <div className="mb-8 rounded-sm border border-charcoal/10 bg-charcoal/3 p-5 md:flex md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-8">
        <p className="mb-5 max-w-xl min-w-0 text-sm leading-relaxed text-charcoal/65 md:mb-0">
          Purchased this piece? Open &quot;Write a review&quot; to show the Judge.me form here on
          this page. Questions about sizing, lead times, or customisation?{' '}
          <Link
            href="/pages/contact"
            className="font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Contact us
          </Link>
          {', '}or see shipping, returns, and care in the{' '}
          <a
            href="#pdp-help-links"
            className="font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            FAQ
          </a>{' '}
          below.
        </p>
        <div className="relative z-10 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap md:shrink-0">
          <ProductReviewWriteDisclosure
            productNumericId={shopifyProductNumericId}
            productTitle={productTitle}
            reviewPageFallbackHref={reviewFormHref}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <StarRating rating={avgRating} size={18} />
        {count > 0 && (
          <span className="text-base font-medium text-charcoal">
            {avgRating.toFixed(1)}
          </span>
        )}
        <span className="text-sm text-charcoal/50">
          {count === 0
            ? 'No reviews yet'
            : `${count} ${count === 1 ? 'review' : 'reviews'}`}
        </span>
      </div>

      {count === 0 ? (
        <p className="text-sm text-charcoal/40 italic">
          Be the first to share your experience.
        </p>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
