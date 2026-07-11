import Link from 'next/link';

/**
 * Interim conversion CTA for hub articles, a natural contextual product link
 * (permitted by the masterplan). Replaced/augmented by the advisor chatbot later;
 * the chatbot is a conversion upgrade, not a launch gate (decided 2026-06-21).
 */
export function HubCta({
  heading = 'Explore the collection',
  body,
  href = '/collections/moissanite-nz',
  label = 'Shop moissanite',
}: {
  heading?: string;
  body: string;
  href?: string;
  label?: string;
}) {
  return (
    <aside className="my-10 rounded-2xl border border-burgundy/20 bg-gradient-to-b from-[#fcf0ef] to-blush p-6">
      <h3 className="mb-1 font-serif text-xl text-charcoal">{heading}</h3>
      <p className="mb-4 text-sm leading-relaxed text-charcoal/75">{body}</p>
      <Link
        href={href}
        className="inline-block rounded-full border border-burgundy bg-burgundy px-6 py-2.5 text-xs uppercase tracking-[0.04em] text-cream transition-colors hover:border-accent-hover hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {label}
      </Link>
    </aside>
  );
}
