'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RingSizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-charcoal/50 underline underline-offset-2 hover:text-charcoal transition-colors text-left"
      >
        Not sure about your ring size?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-charcoal/40" />

          <div
            className="relative bg-cream w-full max-w-lg max-h-[85vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close size guide"
              className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>

            <h3 className="font-serif text-2xl text-charcoal mb-2">
              Find Your Perfect Fit
            </h3>
            <p className="text-xs text-charcoal/55 mb-5 leading-relaxed">
              Each Miozuki ring is made just for you. We recommend ordering our{' '}
              <Link
                href="/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring"
                className="underline hover:text-charcoal transition-colors"
                onClick={() => setOpen(false)}
              >
                ring sizer
              </Link>{' '}
              first to ensure the perfect fit. Please allow approximately 4 weeks
              lead time.
            </p>

            <ul className="text-xs text-charcoal/70 space-y-1.5 mb-6 leading-relaxed list-disc pl-4">
              <li>Measure your ring size at home — easy and accurate.</li>
              <li>Complimentary engraving once your size is confirmed.</li>
              <li>
                Ring sizer + shipping cost is fully credited toward your ring
                purchase.
              </li>
              <li>Credit applies to rings only.</li>
              <li>
                All made-to-order rings are final sale (no returns or exchanges,
                engraved or not).
              </li>
              <li>
                We don&apos;t offer resizing — each ring is crafted to your
                selected size.
              </li>
            </ul>

            <div className="border-t border-charcoal/8 pt-6 mb-6">
              <h4 className="font-serif text-lg text-charcoal mb-4">
                Size Chart
              </h4>
              <div className="relative w-full aspect-[4/3] bg-charcoal/5">
                <Image
                  src="https://cdn.shopify.com/s/files/1/0797/0819/3023/files/Ring_Sizer_Chart_-_Miozuki_Cropped.jpg?v=1769656662"
                  alt="Miozuki ring size chart"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="space-y-4 text-xs text-charcoal/70 leading-relaxed">
              <div>
                <p className="font-medium text-charcoal mb-1">
                  Method 1: Measure an existing ring (most accurate)
                </p>
                <p>
                  Place a ring flat and measure the inside diameter in
                  millimetres. Match to the Inner Diameter column above.
                </p>
              </div>
              <div>
                <p className="font-medium text-charcoal mb-1">
                  Method 2: Paper or string
                </p>
                <p>
                  Wrap a thin strip of paper snugly around the base of your
                  finger, mark where it overlaps, and measure the length in mm.
                  Match to the Circumference column.
                </p>
              </div>
              <div className="border-t border-charcoal/8 pt-4">
                <p className="font-medium text-charcoal mb-1">Sizing tips</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>
                    Measure morning and evening — fingers change throughout the
                    day.
                  </li>
                  <li>If between sizes, choose the larger size.</li>
                  <li>
                    Wider bands (2.5mm+) may feel tighter — consider sizing up
                    by ½.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
