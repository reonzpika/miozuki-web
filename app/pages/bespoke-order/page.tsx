import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Custom Made | Miozuki',
  description:
    'Custom made and bespoke moissanite fine jewellery by Miozuki, designed with you, with gold options available on request.',
};

export default function CustomMadePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Custom Made</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Custom made
      </h1>
      <p className="text-sm text-charcoal/55 leading-relaxed mb-10">
        Our pieces are designed to feel timeless and uniquely yours.
      </p>

      <p className="border-l border-burgundy bg-surface px-5 py-4 text-sm text-charcoal/70 leading-relaxed mb-10">
        Gold options are available on request for custom pieces.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <p className="text-sm text-charcoal/65 leading-relaxed">
        Looking for something special? We would love to help bring your idea to life. Get in touch
        to start your custom piece through our{' '}
        <Link
          href="/pages/contact"
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          contact page
        </Link>{' '}
        or by emailing{' '}
        <a
          href="mailto:info@miozuki.co.nz?subject=Bespoke%20order%20enquiry"
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          info@miozuki.co.nz
        </a>
        .
      </p>
    </main>
  );
}
