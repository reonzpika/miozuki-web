import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping Policy — Miozuki',
  description: 'Miozuki NZ shipping rates, delivery times, and made-to-order lead times.',
};

export default function ShippingPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Shipping Policy</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Shipping Policy
      </h1>
      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-8 text-sm text-charcoal/65 leading-relaxed">

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">New Zealand Shipping</h2>
          <div className="bg-charcoal/4 px-5 py-4 mb-4">
            <p className="text-charcoal/70">
              <strong className="text-charcoal font-medium">Flat rate $8</strong> on all NZ orders,
              shipped via NZ Post tracked courier.
            </p>
          </div>
          <ul className="list-disc pl-5 space-y-2">
            <li>Estimated delivery: <strong className="text-charcoal font-medium">2–7 business days</strong> after dispatch</li>
            <li>All parcels are sent with signature required on delivery</li>
            <li>A tracking number will be emailed to you once your order is dispatched</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Made-to-Order Lead Time</h2>
          <p>
            Some Miozuki pieces are made to order. If this applies to your item, the product page
            will state the lead time clearly. Typical made-to-order lead times are{' '}
            <strong className="text-charcoal font-medium">5–10 business days</strong> before dispatch.
            Lead times do not include transit time.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Order Processing</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Orders are processed on business days (Monday–Friday, excluding NZ public holidays)</li>
            <li>Orders placed after 12pm NZST may be processed the following business day</li>
            <li>You will receive a confirmation email when your order is placed and a dispatch notification when it ships</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">International Shipping</h2>
          <p>
            We currently ship within New Zealand only. International shipping is not available at
            this time. Sign up to our newsletter or follow us on Instagram to be notified when
            international shipping launches.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Incorrect Address</h2>
          <p>
            Please ensure your shipping address is correct at checkout. Miozuki is not responsible
            for parcels delivered to an incorrect address provided by the customer. If you notice
            an error, contact us at{' '}
            <a
              href="mailto:info@miozuki.co.nz"
              className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
            >
              info@miozuki.co.nz
            </a>{' '}
            as soon as possible — we can only amend the address before dispatch.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Lost or Damaged in Transit</h2>
          <p>
            If your parcel is lost or arrives damaged, please contact us within{' '}
            <strong className="text-charcoal font-medium">48 hours</strong> of the expected
            delivery date. We will lodge an investigation with NZ Post on your behalf.
          </p>
        </div>
      </div>
    </main>
  );
}
