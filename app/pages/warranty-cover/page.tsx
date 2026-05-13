import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Warranty Cover | Miozuki',
  description: 'Miozuki jewellery warranty terms and how to submit a claim.',
};

export default function WarrantyCoverPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Warranty</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Warranty Cover
      </h1>
      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-8 text-sm text-charcoal/65 leading-relaxed">
        <p>
          All Miozuki pieces are crafted with care and come with a product warranty covering
          any defects resulting from the craftsmanship of our jewellery.
        </p>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Warranty Period</h2>
          <p className="bg-charcoal/4 px-5 py-4 text-charcoal/70">
            <strong className="text-charcoal font-medium">6 months</strong> for all sterling
            silver products, from the date of purchase.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">What Is Not Covered</h2>
          <p className="mb-3">This warranty does not cover:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Lost items</li>
            <li>Normal wear and tear (including scratches, tarnishing, fading, chain breakage, or bent sterling silver)</li>
            <li>Loss of gemstones or jewellery</li>
            <li>Loose settings or clasps becoming loose over time</li>
            <li>Damage caused by improper care (exposure to chemicals, water, or excessive force)</li>
            <li>Any modifications or repairs made by third parties outside of Miozuki</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">How to Submit a Claim</h2>
          <p className="mb-4">
            Each warranty claim is carefully reviewed on a case-by-case basis. By submitting
            a claim, you agree to the following:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-charcoal font-medium">Return the item.</strong> Once a
              claim is accepted, the affected item must be sent back for inspection and quality
              testing. Return shipping costs are the customer&apos;s responsibility.
            </li>
            <li>
              <strong className="text-charcoal font-medium">Replacement.</strong> If the item
              is in stock and your claim is approved, you will receive a replacement of the same
              item.
            </li>
            <li>
              <strong className="text-charcoal font-medium">Store credit.</strong> If the item
              is out of stock or discontinued, you will receive store credit equal to the
              purchase price.
            </li>
          </ul>
          <p className="mt-5">
            To submit a claim, please contact us at{' '}
            <a
              href="mailto:info@miozuki.co.nz"
              className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
            >
              info@miozuki.co.nz
            </a>{' '}
            with your order number and photos of the issue.
          </p>
        </div>
      </div>
    </main>
  );
}
