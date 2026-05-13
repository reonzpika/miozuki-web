import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book an Appointment | Miozuki',
  description:
    'Book a private appointment with Miozuki for moissanite fine jewellery, in person or by arrangement.',
};

export default function AppointmentPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Appointment</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Book an appointment
      </h1>
      <div className="space-y-4 text-sm text-charcoal/55 leading-relaxed mb-10">
        <p>
          While we do not have a retail store, we are based in Auckland. If you would like to see
          some of our pieces, please feel free to{' '}
          <a
            href="https://calendly.com/miozuki-info/30min?month=2026-04"
            target="_blank"
            rel="noopener noreferrer"
            className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
          >
            book an online appointment
          </a>{' '}
          with me - I would be happy to show you.
        </p>
        <p>I look forward to connecting with you.</p>
        <p>
          With care,
          <br />
          Ting, Founder
        </p>
      </div>

      <div className="h-px bg-charcoal/8 mb-10" />

      <p className="text-sm text-charcoal/65 leading-relaxed">
        Alternatively, if you have any further questions, please{' '}
        <a
          href="mailto:info@miozuki.co.nz"
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          email us
        </a>{' '}
        or{' '}
        <Link
          href="/pages/contact"
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          use our contact form
        </Link>
, and we&apos;ll get back to you within 24 hours.
      </p>
    </main>
  );
}
