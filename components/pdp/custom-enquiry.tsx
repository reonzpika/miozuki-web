import Link from 'next/link';
import { ChevronRightIcon } from '@/components/pdp/chevron-right';

export function PdpCustomEnquiry() {
  return (
    <section
      aria-labelledby="pdp-custom-heading"
      className="rounded-sm border border-charcoal/8 bg-cream p-5"
    >
      <p className="text-xs uppercase tracking-widest text-charcoal/40">
        Custom enquiries
      </p>
      <h2
        id="pdp-custom-heading"
        className="mt-2 font-serif text-xl leading-tight text-charcoal"
      >
        Looking for a custom version?
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
        Tell us what you have in mind, and we&apos;ll come back with custom options.
      </p>
      <Link
        href="/pages/bespoke-order"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Enquire about a custom piece
        <ChevronRightIcon className="text-burgundy" />
      </Link>
    </section>
  );
}
