import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Custom Made — Miozuki',
  description:
    'Custom made and bespoke moissanite fine jewellery by Miozuki — designed with you, crafted in sterling silver.',
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
        As a small business, we love creating timeless pieces that feel uniquely yours. If you
        cannot find something that feels quite right, please feel free to get in touch. Whether it
        is a design you have been dreaming of or a piece you would love to see on our website, we
        would be pleased to bring your vision to life.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <p className="text-sm text-charcoal/65 leading-relaxed">
        For a piece as personal as your story, submit a{' '}
        <Link
          href="/pages/contact"
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          bespoke order enquiry
        </Link>{' '}
        or send us an email{' '}
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
