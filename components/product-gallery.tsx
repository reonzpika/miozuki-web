'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ShopifyImage } from '@/lib/shopify';
import { MiozukiBrandLogo } from '@/components/miozuki-brand-logo';

export default function ProductGallery({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images[activeIdx];

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-cream/60 flex items-center justify-center">
        <MiozukiBrandLogo variant="dark" className="h-[4.5rem] w-auto opacity-25 md:h-[5rem] pointer-events-none select-none" />
      </div>
    );
  }

  return (
    <div id="product-gallery" className="flex scroll-mt-28 flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden bg-cream/60">
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          priority={activeIdx === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              type="button"
              key={img.url}
              onClick={() => setActiveIdx(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === activeIdx ? 'true' : undefined}
              className={`relative h-14 w-14 shrink-0 overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:h-16 md:w-16 ${
                i === activeIdx
                  ? 'ring-1 ring-burgundy ring-offset-1'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
