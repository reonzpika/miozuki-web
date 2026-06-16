import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping Policy | Miozuki',
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
              <strong className="text-charcoal font-medium">Free shipping over $300.</strong> Flat rate{' '}
              <strong className="text-charcoal font-medium">$8</strong> on all NZ orders, shipped via NZ
              Post tracked courier.
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
            Items will be shipped within{' '}
            <strong className="text-charcoal font-medium">4–6 weeks</strong> once received. If your order
            includes both in-stock and made-to-order items, it will be shipped once all items are available
            in a single shipment. Shipping fees apply if you would like split shipping.
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
          <h2 className="font-serif text-xl text-charcoal mb-4">Australia Shipping</h2>
          <div className="bg-charcoal/4 px-5 py-4 mb-4">
            <p className="text-charcoal/70">
              <strong className="text-charcoal font-medium">Flat rate $12 NZD</strong> on all orders
              shipped to Australia.
            </p>
          </div>
          <p className="mb-4">
            Delivery times to Australia vary by destination. A tracking number will be emailed to you
            once your order is dispatched.
          </p>
          <p>
            We do not currently ship to other international destinations. Sign up to our newsletter
            or follow us on Instagram to be notified when more destinations launch.
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
            as soon as possible, we can only amend the address before dispatch. If a parcel is
            returned to us because of an incorrect or incomplete address, a re-delivery fee may apply.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Lost or Damaged in Transit</h2>
          <p>
            If your parcel arrives damaged, please contact us within{' '}
            <strong className="text-charcoal font-medium">3 days</strong> of delivery with photos
            of the damage, and we will make it right.
          </p>
          <p className="mt-3">
            Once a parcel is marked as successfully delivered by NZ Post, Miozuki is not responsible
            for items that are lost, stolen, or missing after delivery.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Customs &amp; Taxes</h2>
          <p>
            International orders may incur extra duties or taxes, which are the customer&apos;s
            responsibility.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Return &amp; Redeliver</h2>
          <p>
            <strong className="text-charcoal font-medium">Re-delivery:</strong> For any returned items,
            once received, a re-delivery fee may apply if the order falls under the free shipping threshold.
          </p>
          <p className="mt-3">
            <strong className="text-charcoal font-medium">Redirection:</strong> If you have entered an
            incorrect address, we can assist with redirection, or you can redirect it yourself on NZ
            Post&apos;s website.
          </p>
        </div>
      </div>
    </main>
  );
}
