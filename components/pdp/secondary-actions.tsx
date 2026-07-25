'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ShopifyVideoSource } from '@/lib/shopify';
import { selectVideoSources } from '@/lib/video-sources';

type FirstVideo = {
  sources: ShopifyVideoSource[];
  previewImage: { url: string } | null;
};

export function PdpSecondaryActions({ firstVideo }: { firstVideo: FirstVideo | null }) {
  const [open, setOpen] = useState(false);
  // Fall back to the poster image if the video source fails to load, rather than
  // showing an empty player. Guards against a future bad/redirected source.
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div className={`grid gap-2 ${firstVideo ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <Link
          href="#pdp-help-links"
          className="flex min-h-11 items-center justify-center gap-2 border border-charcoal/10 bg-cream px-3 py-3 text-center text-xs font-medium text-charcoal transition-colors hover:border-charcoal/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <span className="text-burgundy" aria-hidden>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          Questions before ordering
        </Link>

        {firstVideo && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-11 items-center justify-center gap-2 border border-charcoal/10 bg-cream px-3 py-3 text-center text-xs font-medium text-charcoal transition-colors hover:border-charcoal/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <span className="text-burgundy" aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
              </svg>
            </span>
            See it in motion
          </button>
        )}
      </div>

      {open && firstVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-cream p-4 shadow-xl"
            style={{ maxWidth: '90vw', maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center text-charcoal/65 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>

            {videoError && firstVideo.previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={firstVideo.previewImage.url}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '77vh', display: 'block' }}
              />
            ) : (
              <video
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="auto"
                poster={firstVideo.previewImage?.url}
                width={firstVideo.sources[0]?.width}
                height={firstVideo.sources[0]?.height}
                style={{ maxWidth: '100%', maxHeight: '77vh', display: 'block' }}
                onError={() => setVideoError(true)}
              >
                {selectVideoSources(firstVideo.sources).map((src) => (
                  <source key={src.url} src={src.url} type={src.mimeType} />
                ))}
              </video>
            )}
          </div>
        </div>
      )}
    </>
  );
}
