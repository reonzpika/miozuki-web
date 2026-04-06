import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ring Size Guide — Miozuki',
  description: 'How to find your ring size — two methods, a size chart, and our $1 ring sizer.',
};

export default function SizeGuidePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Size Guide</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Ring Size Guide
      </h1>
      <p className="text-sm text-charcoal/55 leading-relaxed mb-10">
        Not sure of your ring size? We recommend ordering our $1 ring sizer before purchasing a ring.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-10 text-sm text-charcoal/65 leading-relaxed">

        {/* Ring Sizer CTA */}
        <div className="bg-charcoal/4 px-5 py-5">
          <p className="text-charcoal/70 mb-3">
            <strong className="text-charcoal font-medium">The easiest way:</strong> order our physical
            ring sizer. It ships within New Zealand for just $1 and takes the guesswork out of sizing.
          </p>
          <Link
            href="/products/order-your-ring-sizer-nz"
            className="text-xs tracking-widest uppercase text-burgundy underline underline-offset-4 hover:text-burgundy/70 transition-colors"
          >
            Order a Ring Sizer — $1
          </Link>
        </div>

        {/* Size chart */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-5">Size Chart</h2>
          <div className="relative w-full aspect-[4/3] overflow-hidden mb-4">
            <Image
              src="https://cdn.shopify.com/s/files/1/0797/0819/3023/files/Ring_Sizer_Chart_-_Miozuki_Cropped.jpg?v=1769656662"
              alt="Miozuki ring size chart"
              fill
              className="object-contain object-left"
            />
          </div>
          <p className="text-xs text-charcoal/40">
            All Miozuki rings are sized in standard US ring sizes.
          </p>
        </div>

        <div className="h-px bg-charcoal/8" />

        {/* Method 1 */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Method 1 — Measure an Existing Ring</h2>
          <p className="mb-3">If you already own a ring that fits the intended finger:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Measure the inner diameter of the ring in millimetres.</li>
            <li>Use the size chart above to find your US ring size.</li>
          </ol>
        </div>

        {/* Method 2 */}
        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Method 2 — Measure Your Finger</h2>
          <p className="mb-3">Using a strip of paper or a piece of string:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Wrap the strip snugly around the base of your finger (not too tight — you need to be able to slide a ring over your knuckle).</li>
            <li>Mark where the strip overlaps.</li>
            <li>Measure the length in millimetres — this is your finger circumference.</li>
            <li>Use the size chart above to find your US ring size.</li>
          </ol>
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
              can slide on — then check the fit at the base.
            </li>
            <li>
              <strong className="text-charcoal font-medium">When between sizes, size up.</strong>{' '}
              A slightly larger ring is easier to adjust than one that is too small.
            </li>
            <li>
              <strong className="text-charcoal font-medium">Dominant hand runs larger.</strong>{' '}
              If ordering for your dominant hand, you may need to go half a size up compared to your
              non-dominant hand.
            </li>
          </ul>
        </div>

        {/* T&Cs */}
        <div className="bg-charcoal/4 px-5 py-5">
          <h3 className="text-charcoal font-medium mb-3">Ring Sizer Terms</h3>
          <ul className="list-disc pl-5 space-y-2 text-charcoal/60">
            <li>The $1 ring sizer is a physical product shipped to you via standard NZ Post.</li>
            <li>The $1 cost covers postage and packaging only.</li>
            <li>The ring sizer is non-refundable.</li>
            <li>Allow 2–5 business days for delivery within New Zealand.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
