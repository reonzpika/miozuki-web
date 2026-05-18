'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export const RING_SIZE_CHART_SRC =
  'https://cdn.shopify.com/s/files/1/0797/0819/3023/files/Ring_Sizer_Chart_-_Miozuki_Cropped.jpg?v=1769656662';

type RingSizeChartExpandableProps = {
  /** Passed to Next/Image for the inline preview. */
  sizes: string;
  priority?: boolean;
  objectPosition?: 'left' | 'center';
  /** Small “Enlarge” label on the thumbnail (optional). */
  showEnlargeHint?: boolean;
  /** Extra classes on the clickable thumbnail wrapper (margins, etc.). */
  className?: string;
  /** Thumbnail border / outline treatment. */
  variant?: 'bare' | 'subtle-ring';
};

export function RingSizeChartExpandable({
  sizes,
  priority = false,
  objectPosition = 'center',
  showEnlargeHint = false,
  className = '',
  variant = 'bare',
}: RingSizeChartExpandableProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const objectClass =
    objectPosition === 'left' ? 'object-contain object-left' : 'object-contain';

  const ringClass =
    variant === 'subtle-ring'
      ? 'ring-1 ring-charcoal/10 hover:ring-charcoal/25'
      : 'ring-1 ring-transparent hover:ring-charcoal/20';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative aspect-[4/3] w-full overflow-hidden bg-charcoal/5 text-left transition-[box-shadow] focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${ringClass} ${className}`}
        aria-label="Open ring size chart full size"
      >
        <Image
          src={RING_SIZE_CHART_SRC}
          alt="Miozuki ring size chart"
          fill
          priority={priority}
          sizes={sizes}
          className={objectClass}
        />
        {showEnlargeHint ? (
          <span className="pointer-events-none absolute bottom-2 right-2 border border-charcoal/15 bg-cream/95 px-2.5 py-1 text-xs uppercase tracking-widest text-charcoal/70">
            Enlarge
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-charcoal/95 p-3 sm:p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Ring size chart enlarged"
        >
          <div className="mb-2 flex shrink-0 justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              aria-label="Close enlarged chart"
              className="rounded-sm p-1 text-cream/70 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto">
            <div
              className="relative min-h-[min(85vh,1200px)] w-full max-w-5xl shrink-0"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Image
                src={RING_SIZE_CHART_SRC}
                alt="Miozuki ring size chart (enlarged)"
                fill
                className="object-contain object-top"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
