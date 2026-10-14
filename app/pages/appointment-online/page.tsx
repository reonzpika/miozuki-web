import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Book an Appointment | Miozuki',
  description:
    'Book a free online appointment with Ting, or arrange an in-person meeting in Auckland Central or the North Shore for jewellery advice and ring sizing.',
};

export default function AppointmentPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/65 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Appointment</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Personal guidance, online or in Auckland
      </h1>
      <div className="max-w-2xl text-sm font-light text-charcoal/65 leading-relaxed mb-10">
        <p>
          Unsure which ring or size to choose? Book a free appointment with me to discuss
          styles, gold options, sizing or a bespoke idea.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <section className="flex flex-col border border-charcoal/10 bg-surface p-6 md:p-8">
          <h2 className="font-serif text-2xl text-charcoal mb-3">Online appointment</h2>
          <p className="text-sm font-light leading-relaxed text-charcoal/65 mb-6">
            Talk through your questions from home. We can discuss styles, gold options,
            sizing and bespoke ideas together.
          </p>
          <a
            href="https://calendly.com/miozuki-info/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex min-h-11 items-center justify-center bg-burgundy px-4 py-4 text-center text-xs font-medium tracking-wide text-cream transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Book a free online appointment
          </a>
        </section>

        <section className="flex flex-col border border-charcoal/10 bg-surface p-6 md:p-8">
          <h2 className="font-serif text-2xl text-charcoal mb-3">In-person appointment</h2>
          <p className="text-sm font-light leading-relaxed text-charcoal/65 mb-6">
            Meet around Auckland Central or the North Shore to have your finger measured
            and discuss your options. We&apos;ll agree on a suitable location and time together.
          </p>
          <a
            href="mailto:info@miozuki.co.nz?subject=In-person%20appointment%20enquiry"
            className="mt-auto inline-flex min-h-11 items-center justify-center border border-burgundy px-4 py-4 text-center text-xs font-medium tracking-wide text-burgundy transition-colors hover:bg-burgundy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Arrange an in-person appointment
          </a>
        </section>
      </div>

      <p className="text-xs leading-relaxed text-charcoal/65 mb-8">
        Both appointments are free. Miozuki is an online jewellery brand. In-person meetings
        are by appointment; we don&apos;t have a walk-in store.
      </p>

      <div className="space-y-3 text-sm font-light text-charcoal/65 leading-relaxed mb-10">
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
        , and we&apos;ll get back to you within 1–2 business days.
      </p>
    </main>
  );
}
