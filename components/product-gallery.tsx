'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import type { ShopifyMediaItem } from '@/lib/shopify';
import { selectVideoSources } from '@/lib/video-sources';
import { MiozukiBrandLogo } from '@/components/miozuki-brand-logo';

export default function ProductGallery({
  media,
  title,
  firstImage,
}: {
  media: ShopifyMediaItem[];
  title: string;
  /**
   * Server-rendered <Image priority> for media[0] when it is an image. Rendered at rest
   * (activeIdx 0) so its preload link ships in the initial HTML, this client component
   * cannot emit a priority preload on its own (it only lands after hydration). The client
   * <Image> below handles idx > 0 after the user interacts.
   */
  firstImage?: ReactNode;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  // Index whose video failed to load: fall back to its poster image instead of a
  // dead black box. Guards against a future bad/redirected video source.
  const [videoErrorIdx, setVideoErrorIdx] = useState<number | null>(null);
  const active = media[activeIdx];

  if (media.length === 0) {
    return (
      <div className="aspect-square bg-cream/60 flex items-center justify-center">
        <MiozukiBrandLogo variant="dark" className="h-[4.5rem] w-auto opacity-25 md:h-[5rem] pointer-events-none select-none" />
      </div>
    );
  }

  return (
    <div id="product-gallery" className="flex scroll-mt-28 flex-col gap-3">
      {/* Main viewer */}
      <div className="relative aspect-square overflow-hidden bg-cream/60">
        {active.mediaContentType === 'VIDEO' ? (
          videoErrorIdx === activeIdx && active.previewImage ? (
            <Image
              src={active.previewImage.url}
              alt={active.previewImage.altText ?? title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-contain"
              poster={active.previewImage?.url}
              onError={() => setVideoErrorIdx(activeIdx)}
            >
              {selectVideoSources(active.sources).map((src) => (
                <source key={src.url} src={src.url} type={src.mimeType} />
              ))}
            </video>
          )
        ) : activeIdx === 0 && firstImage ? (
          firstImage
        ) : (
          <Image
            src={active.image.url}
            alt={active.image.altText ?? title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, i) => {
            const key =
              item.mediaContentType === 'IMAGE'
                ? item.image.url
                : (item.sources[0]?.url ?? String(i));
            return (
              <button
                type="button"
                key={key}
                onClick={() => setActiveIdx(i)}
                aria-label={`Show ${item.mediaContentType === 'VIDEO' ? 'video' : 'image'} ${i + 1} of ${media.length}`}
                aria-current={i === activeIdx ? 'true' : undefined}
                style={
                  item.mediaContentType === 'VIDEO'
                    ? {
                        aspectRatio: item.previewImage
                          ? `${item.previewImage.width} / ${item.previewImage.height}`
                          : item.sources[0]
                          ? `${item.sources[0].width} / ${item.sources[0].height}`
                          : '1 / 1',
                      }
                    : undefined
                }
                className={`relative h-14 shrink-0 overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:h-16 ${
                  item.mediaContentType === 'IMAGE' ? 'w-14 md:w-16' : ''
                } ${
                  i === activeIdx
                    ? 'ring-1 ring-burgundy ring-offset-1'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {item.mediaContentType === 'VIDEO' ? (
                  <span className="relative flex h-full w-full items-center justify-center bg-charcoal/10">
                    {item.previewImage && (
                      <Image
                        src={item.previewImage.url}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                    <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/40">
                      <svg
                        viewBox="0 0 10 10"
                        className="h-2.5 w-2.5 translate-x-px fill-white drop-shadow"
                        aria-hidden
                      >
                        <polygon points="2,1 9,5 2,9" />
                      </svg>
                    </span>
                  </span>
                ) : (
                  <Image
                    src={item.image.url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
