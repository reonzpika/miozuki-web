import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Jewellery Care Guide — Miozuki',
  description:
    'How to care for your Miozuki moissanite and pearl jewellery to keep it looking its best.',
};

export default function JewelleryCareGuidePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Jewellery Care Guide</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Jewellery Care Guide
      </h1>
      <p className="text-sm text-charcoal/55 leading-relaxed mb-10">
        Simple care keeps your pieces looking their best for years to come.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-10">
        {/* Daily Care */}
        <section>
          <h2 className="font-serif text-2xl text-charcoal mb-5">Daily Care</h2>
          <ul className="space-y-4">
            <li className="text-sm text-charcoal/65 leading-relaxed">
              <strong className="text-charcoal font-medium">Last on, first off.</strong>{' '}
              Put jewellery on after applying makeup, perfume, and hairspray. Remove it first
              when undressing.
            </li>
            <li className="text-sm text-charcoal/65 leading-relaxed">
              <strong className="text-charcoal font-medium">Remove before activity.</strong>{' '}
              Take off jewellery before exercising, showering, swimming, or entering hot or
              humid environments. Sweat, chlorine, and salt water can damage pearls and tarnish
              silver.
            </li>
            <li className="text-sm text-charcoal/65 leading-relaxed">
              <strong className="text-charcoal font-medium">Protect from chemicals.</strong>{' '}
              Household cleaners, bleach, perfumes, and acidic substances will wear down rhodium
              plating and compromise the metal finish.
            </li>
          </ul>
        </section>

        <div className="h-px bg-charcoal/8" />

        {/* Cleaning */}
        <section>
          <h2 className="font-serif text-2xl text-charcoal mb-5">Cleaning</h2>
          <ul className="space-y-4">
            <li className="text-sm text-charcoal/65 leading-relaxed">
              <strong className="text-charcoal font-medium">Gentle wash.</strong>{' '}
              Use lukewarm water with a drop of mild soap. Wipe pearls or moissanite gently
              with a soft microfibre cloth, then rinse lightly and pat dry with a lint-free cloth.
            </li>
            <li className="text-sm text-charcoal/65 leading-relaxed">
              <strong className="text-charcoal font-medium">Polishing metal.</strong>{' '}
              Use a non-abrasive jewellery cloth to refresh the shine of rhodium-plated silver.
              Do not use silver dips or abrasive cleaners — these strip the coating.
            </li>
            <li className="text-sm text-charcoal/65 leading-relaxed">
              <strong className="text-charcoal font-medium">Pearls — no ultrasonic cleaners.</strong>{' '}
              Never use ultrasonic or steam cleaners on pearl jewellery. Excessive vibration and
              heat can damage the delicate nacre surface.
            </li>
          </ul>
        </section>

        <div className="h-px bg-charcoal/8" />

        {/* Storage */}
        <section>
          <h2 className="font-serif text-2xl text-charcoal mb-5">Storage</h2>
          <ul className="space-y-4">
            <li className="text-sm text-charcoal/65 leading-relaxed">
              <strong className="text-charcoal font-medium">Store separately.</strong>{' '}
              Store jewellery in a velvet-lined box, individual pouch, or dedicated compartment.
              This prevents scratching from harder stones or metals.
            </li>
            <li className="text-sm text-charcoal/65 leading-relaxed">
              <strong className="text-charcoal font-medium">Pearl preservation.</strong>{' '}
              Pearls are delicate organic gems that benefit from being worn. Avoid storing them
              in airtight plastic bags — they need a little natural moisture to keep their lustre.
              Never store pearls with other jewellery that could scratch them.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
