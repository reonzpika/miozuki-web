import type { Metadata } from 'next';
import Link from 'next/link';
import { RingSizeChartExpandable } from '@/components/ring-size-chart-expandable';

export const metadata: Metadata = {
  title: 'Ring Size Guide | Miozuki',
  description: 'How to find your ring size: two methods, a size chart, and our ring sizer.',
};

export default function SizeGuidePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/65 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Size Guide</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Ring Size Guide
      </h1>
      <p className="text-sm text-charcoal/65 leading-relaxed mb-10">
        Not sure of your ring size? We recommend ordering our ring sizer before purchasing a ring.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-10 text-sm text-charcoal/65 leading-relaxed">

        {/* Ring Sizer CTA + policy copy */}
        <div className="space-y-6">
          <div className="bg-charcoal/4 px-5 py-5">
            <p className="text-charcoal/70 mb-3">
              <strong className="text-charcoal font-medium">The easiest way:</strong> order our physical
              ring sizer. The cost of the ring sizer is fully credited toward your ring purchase. Credit
              applies to rings only.
            </p>
            <Link
              href="/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring"
              className="text-xs tracking-widest uppercase text-burgundy underline underline-offset-4 hover:text-burgundy/70 transition-colors"
            >
              Order a ring sizer
            </Link>
          </div>
          <div>
            <p className="mb-4 text-charcoal/70">
              Each Miozuki ring is made just for you, so we recommend ordering our ring sizer first to
              ensure the perfect fit. Please allow approximately 4–6 weeks lead time.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-charcoal/70">
              <li>Measure your ring size at home: easy and accurate.</li>
              <li>
                All{' '}
                <strong className="text-charcoal font-medium">
                  custom and made-to-order rings
                </strong>{' '}
                are final sale and{' '}
                <strong className="text-charcoal font-medium">non-refundable</strong>. We{' '}
                <strong className="text-charcoal font-medium">
                  cannot accept returns or exchanges
                </strong>{' '}
                once the item has gone into production.
              </li>
              <li>
                We don&apos;t offer resizing; each ring is crafted to your selected size.
              </li>
            </ul>
            <p className="mt-3 text-charcoal/70">
              Please choose your size and ring carefully before purchasing.
            </p>
          </div>
        </div>

        {/* Size chart */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-5">Size Chart</h2>
          <p className="mb-3 text-xs text-charcoal/65">
            Tap the chart to open a larger view you can scroll on small screens.
          </p>
          <RingSizeChartExpandable
            sizes="(min-width: 768px) 672px, 100vw"
            objectPosition="left"
            priority
            className="mb-4"
          />
          <p className="text-xs text-charcoal/65">
            All Miozuki rings are sized in standard US ring sizes.
          </p>
        </div>

        <div className="h-px bg-charcoal/8" />

        {/* Method 1 */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">
            Method 1: Measure an Existing Ring (Most Accurate)
          </h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Choose a ring that fits the finger you want to size.</li>
            <li>Place the ring flat on a table.</li>
            <li>
              Measure the inside diameter of the ring (straight across the centre) using a ruler or
              caliper.
            </li>
            <li>Record the measurement in millimetres (mm).</li>
            <li>
              Match this number to the Inner Diameter (mm) column on the size chart above.
            </li>
          </ol>
          <p className="mt-3 text-charcoal/70">
            Tip: Measure twice to ensure accuracy (morning and night).
          </p>
        </div>

        {/* Method 2 */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Method 2: Measure Your Finger</h2>
          <p className="mb-3">Using a strip of paper or a piece of string:</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Wrap the strip snugly around the base of your finger (not too tight, you need to be able to slide a ring over your knuckle).</li>
            <li>Mark where the strip overlaps.</li>
            <li>
              Lay it flat and measure the length in millimetres (mm) - this is your finger circumference.
            </li>
            <li>
              Match this number to the Circumference (mm) column on the size chart above.
            </li>
          </ol>
          <p className="mt-3 text-charcoal/70">
            Tip: The paper should sit comfortably - tight enough not to slip, loose enough to remove
            easily.
          </p>
        </div>

        <div className="h-px bg-charcoal/8" />

        {/* Tips */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Sizing Tips</h2>
          <ul className="space-y-3">
            <li>
              <strong className="text-charcoal font-medium">Measure at the right time of day.</strong>{' '}
              Fingers are often larger in the evening and in warm weather. Measure mid-afternoon for the most
              representative size.
            </li>
            <li>
              <strong className="text-charcoal font-medium">Check your knuckle.</strong>{' '}
              If your knuckle is wider than the base of your finger, size for the knuckle so the ring
              can slide on, then check the fit at the base.
            </li>
            <li>
              <strong className="text-charcoal font-medium">When between sizes, size up.</strong>{' '}
              A slightly larger ring is easier to adjust than one that is too small.
            </li>
            <li>
              <strong className="text-charcoal font-medium">
                Wider bands (2.5 mm and above)
              </strong>{' '}
              may feel tighter - consider sizing up by ½ size.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
