'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

type PdpShareProps = {
  shareUrl: string;
  productTitle: string;
};

function ShareGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function PdpShare({ shareUrl, productTitle }: PdpShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareBody = `${productTitle}\n\n${shareUrl}`;
  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareBody)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(`${productTitle} · Miozuki`)}&body=${encodeURIComponent(shareBody)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' ||
      navigator.canShare({ url: shareUrl, title: productTitle }));

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title: productTitle,
        text: productTitle,
        url: shareUrl,
      });
      setOpen(false);
    } catch {
      /* user cancelled or share failed */
    }
  }, [productTitle, shareUrl]);

  const copyForInstagram = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('clipboard unavailable');
      }
      await navigator.clipboard.writeText(shareBody);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      setCopied(true);
      copyResetRef.current = setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      setCopied(false);
    }
  }, [shareBody]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  const linkClass =
    'flex min-h-11 w-full items-center px-4 py-2.5 text-left text-xs tracking-wide text-charcoal transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-burgundy/35';

  return (
    <div ref={wrapRef} className="relative flex justify-start">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center gap-2 border border-charcoal/15 bg-cream px-3 py-2 text-xs font-medium tracking-wide text-charcoal transition-colors hover:border-charcoal/30 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <span className="text-burgundy" aria-hidden>
          <ShareGlyph />
        </span>
        Share product
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Share this product"
          className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-3rem,20rem)] border border-charcoal/10 bg-cream py-2 rounded-sm"
        >
          <span id={`${menuId}-status`} className="sr-only" aria-live="polite">
            {copied ? 'Copied. Ready to paste in Instagram.' : ''}
          </span>

          {canNativeShare && (
            <button
              type="button"
              role="menuitem"
              className={`${linkClass} border-b border-charcoal/8`}
              onClick={() => void handleNativeShare()}
            >
              More apps…
              <span className="sr-only">
                Opens your device share sheet where you may see Instagram or
                other apps.
              </span>
            </button>
          )}

          <a
            href={whatsappHref}
            role="menuitem"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            WhatsApp message
          </a>
          <a
            href={facebookHref}
            role="menuitem"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            Facebook
            <span className="sr-only">
              Opens Facebook in a new tab where you can post this link or open
              Messenger.
            </span>
          </a>
          <a href={emailHref} role="menuitem" className={linkClass} onClick={() => setOpen(false)}>
            Email
          </a>
          <button
            type="button"
            role="menuitem"
            className={`${linkClass} ${copied ? 'text-burgundy' : ''}`}
            onClick={() => void copyForInstagram()}
          >
            Instagram (copy link)
          </button>
          {copied ? (
            <p className="px-4 pb-2 text-[10px] tracking-wide text-charcoal/50" aria-hidden>
              Copied to clipboard. Paste it into Instagram messages.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
