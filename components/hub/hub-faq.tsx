import JsonLd from '@/components/json-ld';

export type HubFaqItem = { q: string; a: string };

/**
 * FAQ block for hub articles. Renders a no-JS <details> accordion and emits
 * FAQPage JSON-LD so the questions are eligible for rich results.
 */
export function HubFaq({ items }: { items: HubFaqItem[] }) {
  if (!items?.length) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
  return (
    <section className="mt-12 border-t border-charcoal/10 pt-8">
      <h2 className="mb-4 font-serif text-2xl text-charcoal">Common questions</h2>
      <div className="divide-y divide-charcoal/10">
        {items.map((i) => (
          <details key={i.q} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-charcoal">
              {i.q}
              <span
                className="ml-3 shrink-0 text-charcoal/40 transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="mt-2 text-[15px] leading-relaxed text-charcoal/75">{i.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={schema} />
    </section>
  );
}
