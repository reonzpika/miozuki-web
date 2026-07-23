import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Returns & Refunds Policy | Miozuki',
  description: 'Miozuki returns and refunds policy, 14-day change of mind return window and how to submit a request.',
};

export default function ReturnsRefundsPolicyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/65 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Returns &amp; Refunds</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Returns &amp; Refunds Policy
      </h1>
      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-8 text-sm text-charcoal/65 leading-relaxed">
        <p>
          We want you to love every piece you receive from Miozuki. If something isn&apos;t right,
          we&apos;re here to help.
        </p>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Change of Mind Returns</h2>
          <p className="mb-4">
            Only some items are eligible for our standard{' '}
            <strong className="text-charcoal font-medium">14-day</strong> change of mind returns.
            Where an item qualifies, we accept the return within 14 days of receiving your order,
            provided the item is:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Unworn and in original condition</li>
            <li>Returned in its original packaging</li>
            <li>Accompanied by proof of purchase</li>
          </ul>
          <p className="mt-4">
            Some items are not eligible for change of mind returns, please see Non-Returnable Items
            below. Return shipping costs are the customer&apos;s responsibility for change of mind
            returns.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Non-Returnable Items</h2>
          <p className="mb-3">The following items cannot be returned or refunded:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-charcoal font-medium">Earrings</strong>, for hygiene reasons,
              all earring sales are final
            </li>
            <li>
              <strong className="text-charcoal font-medium">Custom or engraved pieces</strong>, items
              personalised with engraving cannot be returned
            </li>
            <li>
              <strong className="text-charcoal font-medium">Sale items</strong>, all discounted items
              are sold as final sale
            </li>
            <li>
              <strong className="text-charcoal font-medium">End of season items</strong>, end of
              season pieces are final sale and cannot be returned
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Faulty or Damaged Items</h2>
          <p>
            If your item arrives faulty or damaged, please contact us within{' '}
            <strong className="text-charcoal font-medium">3 days</strong> of delivery with photos
            of the damage. We will arrange a replacement or refund at no cost to you. This is separate
            from our standard warranty cover, please see our{' '}
            <Link href="/pages/warranty-cover" className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors">
              Warranty Cover
            </Link>{' '}
            page for manufacturing defect claims.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">How to Submit a Return Request</h2>
          <p>
            To start a return, email us at{' '}
            <a
              href="mailto:info@miozuki.co.nz"
              className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
            >
              info@miozuki.co.nz
            </a>{' '}
            with your order number and the reason for your return, and we will guide you through the
            next steps. Please wait for our approval before sending anything back. Once we receive
            and inspect your item, your refund or store credit will be processed within{' '}
            <strong className="text-charcoal font-medium">5 business days</strong>.
          </p>
        </div>

        <div className="bg-charcoal/4 px-5 py-4">
          <p className="text-charcoal/70">
            <strong className="text-charcoal font-medium">Please do not send items back without prior approval.</strong>{' '}
            Unapproved returns may not be accepted and will be returned to sender at the customer&apos;s expense.
          </p>
        </div>
      </div>
    </main>
  );
}
