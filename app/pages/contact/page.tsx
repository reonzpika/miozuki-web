import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Contact Us | Miozuki',
  description: 'Get in touch with Miozuki, questions about orders, ring sizing, or our jewellery.',
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ about?: string | string[] }>;
}) {
  const resolved = await searchParams;
  const aboutRaw = resolved.about;
  const about =
    typeof aboutRaw === 'string' ? aboutRaw.trim() : undefined;
  const initialMessage =
    about && about.length > 0 ? `Question about ${about}:\n\n` : '';

  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/65 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Contact</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Contact Us
      </h1>
      <p className="text-sm text-charcoal/65 leading-relaxed mb-10">
        We&apos;re a small brand and we read every message personally. We aim to respond within
        1–2 business days.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-8 text-sm text-charcoal/65 leading-relaxed">

        {/* Email */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-3">Email</h2>
          <p className="mb-1">For all enquiries, including orders, returns, and sizing questions:</p>
          <a
            href="mailto:info@miozuki.co.nz"
            className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
          >
            info@miozuki.co.nz
          </a>
        </div>

        {/* Ring sizing */}
        <div className="bg-charcoal/4 px-5 py-4">
          <p className="text-charcoal/70">
            <strong className="text-charcoal font-medium">Not sure about your ring size?</strong>{' '}
            We recommend ordering our{' '}
            <Link
              href="/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring"
              className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
            >
              ring sizer
            </Link>{' '}
            before purchasing. You can also visit our{' '}
            <Link
              href="/pages/size-guide"
              className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
            >
              Size Guide
            </Link>{' '}
            for measurement methods and a size chart.
          </p>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-5">Send a Message</h2>
          <ContactForm key={about ?? ''} initialMessage={initialMessage} />
        </div>
      </div>
    </main>
  );
}
