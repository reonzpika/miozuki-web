'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ShopifyImage } from '@/lib/shopify';

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
        <span className="font-serif text-2xl text-charcoal/20 italic">Miozuki</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden bg-cream/60">
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActiveIdx(i)}
              className={`relative flex-shrink-0 w-16 h-16 overflow-hidden transition-all ${
                i === activeIdx
                  ? 'ring-1 ring-burgundy ring-offset-1'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${title} ${i + 1}`}
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
