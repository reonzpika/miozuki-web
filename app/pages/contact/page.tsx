import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us — Miozuki',
  description: 'Get in touch with Miozuki — questions about orders, ring sizing, or our jewellery.',
};

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Contact</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Contact Us
      </h1>
      <p className="text-sm text-charcoal/55 leading-relaxed mb-10">
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
              href="/products/order-your-ring-sizer-nz"
              className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
            >
              $1 ring sizer
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
          <form
            action="mailto:info@miozuki.co.nz"
            method="POST"
            encType="text/plain"
            className="space-y-5"
          >
            <div>
              <label htmlFor="name" className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors"
                placeholder="Full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="order" className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
                Order Number <span className="normal-case text-charcoal/30">(if applicable)</span>
              </label>
              <input
                id="order"
                name="order"
                type="text"
                className="w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors"
                placeholder="#1234"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors resize-none"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-charcoal text-cream text-xs tracking-widest uppercase py-4 hover:bg-charcoal/85 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
