import { getFeaturedReviews } from '@/lib/judgeme/client';
import { reviewerNameForDisplay } from '@/lib/judgeme/reviewer-display';
import StarRating from '@/components/star-rating';
import ScrollReveal from '@/components/scroll-reveal';

/**
 * Homepage social proof: real Judge.me review quotes plus the storewide
 * aggregate. Renders nothing when there are not enough quotable reviews,
 * so the section can never show placeholder or invented praise.
 */
export default async function HomeTestimonials() {
  const { reviews, averageRating, totalCount } = await getFeaturedReviews(3);
  if (reviews.length < 2) return null;
  // Only make a numeric aggregate claim once there is a meaningful base;
  // below that, show the quotes without a statistic.
  const showAggregate = totalCount >= 5;

  return (
    <section className="border-y border-charcoal/8 bg-surface/60 py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <ScrollReveal className="mb-10 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-burgundy">From our customers</p>
          <h2 className="font-serif text-3xl text-charcoal md:text-4xl">Worn and loved</h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <StarRating rating={averageRating} size={18} />
            <p className="text-sm text-charcoal/65">
              {showAggregate
                ? `${averageRating.toFixed(1)} from ${totalCount} verified reviews`
                : 'From verified Judge.me reviews'}
            </p>
          </div>
        </ScrollReveal>

        {/* Featured quote first, remaining quotes paired below: deliberately
            asymmetric (three equal cards in a row is a banned pattern). */}
        <ScrollReveal>
          <figure className="mx-auto max-w-3xl text-center">
            <blockquote className="font-serif text-xl leading-relaxed text-charcoal/90 md:text-2xl">
              &ldquo;{reviews[0].body.trim()}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-xs uppercase tracking-[0.2em] text-charcoal/50">
              {reviews[0].reviewer?.name ? reviewerNameForDisplay(reviews[0].reviewer.name) : 'Verified customer'}
              {reviews[0].reviewer?.verified_buyer ? (
                <span className="ml-2 normal-case tracking-normal text-burgundy/80">Verified buyer</span>
              ) : null}
            </figcaption>
          </figure>
        </ScrollReveal>

        {reviews.length > 1 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
            {reviews.slice(1).map((review, i) => (
              <ScrollReveal key={review.id} delay={i * 0.08}>
                <figure className="flex h-full flex-col rounded-md border border-charcoal/10 bg-cream p-6">
                  <StarRating rating={review.rating} size={14} />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-charcoal/80">
                    &ldquo;{review.body.trim()}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 text-xs uppercase tracking-[0.2em] text-charcoal/50">
                    {review.reviewer?.name ? reviewerNameForDisplay(review.reviewer.name) : 'Verified customer'}
                    {review.reviewer?.verified_buyer ? (
                      <span className="ml-2 normal-case tracking-normal text-burgundy/80">Verified buyer</span>
                    ) : null}
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
