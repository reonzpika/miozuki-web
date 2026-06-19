import Link from 'next/link';
import { getProductReviews } from '@/lib/judgeme/client';
import type { JudgeMeReview } from '@/lib/judgeme/types';
import StarRating from './star-rating';

/** Display overrides for Judge.me reviewer names (source data unchanged in Judge.me). */
const REVIEWER_DISPLAY_NAME: Record<string, string> = {
  'Ting Chou': 'Casey',
};

function reviewerNameForDisplay(name: string): string {
  const trimmed = name.trim();
  return REVIEWER_DISPLAY_NAME[trimmed] ?? name;
}

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
          {reviewerNameForDisplay(review.reviewer.name)}
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
}: {
  productId: string;
}) {
  const { product, reviews } = await getProductReviews(productId);
  const count = product?.reviews_count ?? 0;
  const avgRating = product?.rating ?? 0;

  return (
    <section>
      <h2 className="font-serif text-2xl text-charcoal mb-6">Reviews</h2>

      <div className="mb-8 rounded-sm border border-charcoal/10 bg-charcoal/3 p-5">
        <p className="max-w-2xl text-sm leading-relaxed text-charcoal/65">
          Purchased this piece? After your order arrives we email you a link to leave a
          review, so it is tied to your verified purchase. Questions about sizing, lead
          times, or customisation?{' '}
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
