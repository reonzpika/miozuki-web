import Link from 'next/link';

/** Secondary CTAs after add to cart: FAQ quick link and jump back to gallery. */
export function PdpSecondaryActions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Link
        href="#pdp-help-links"
        className="flex min-h-11 items-center justify-center gap-2 border border-charcoal/10 bg-cream px-3 py-3 text-center text-xs font-medium text-charcoal transition-colors hover:border-charcoal/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <span className="text-burgundy" aria-hidden>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        Questions before ordering
      </Link>
      <Link
        href="#product-gallery"
        className="flex min-h-11 items-center justify-center gap-2 border border-charcoal/10 bg-cream px-3 py-3 text-center text-xs font-medium text-charcoal transition-colors hover:border-charcoal/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <span className="text-burgundy" aria-hidden>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
          </svg>
        </span>
        View on hand
      </Link>
    </div>
  );
}
