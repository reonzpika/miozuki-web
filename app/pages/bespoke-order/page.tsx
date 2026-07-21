import type { Metadata } from 'next';
import Link from 'next/link';
import CustomMadeEnquiryForm from '@/components/custom-made-enquiry-form';

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
      <p className="max-w-prose text-sm md:text-base text-charcoal/55 leading-relaxed mb-10">
        Created exclusively for you, each custom-made piece is thoughtfully designed to reflect your
        story, your style, and the meaning behind it.
      </p>

      <p className="border-l border-burgundy bg-surface px-5 py-4 text-sm text-charcoal/70 leading-relaxed mb-10">
        For something uniquely yours, custom pieces can be created in gold or platinum, with coloured
        moissanites available upon request.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="mb-8">
        <h2 className="font-serif text-xl text-charcoal mb-3">Start your custom piece</h2>
        <p className="text-sm text-charcoal/55 leading-relaxed">
          Tell us a little about what you have in mind. We normally reply within 1–2 business days.
        </p>
      </div>

      <CustomMadeEnquiryForm />

      <p className="mt-10 text-sm text-charcoal/55 leading-relaxed">
        Prefer email? Write to{' '}
        <a
          href="mailto:info@miozuki.co.nz?subject=Custom%20made%20enquiry"
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          info@miozuki.co.nz
        </a>
        .
      </p>
    </main>
  );
}
