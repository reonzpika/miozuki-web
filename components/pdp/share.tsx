'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

type PdpShareProps = {
  shareUrl: string;
  productTitle: string;
};

type ShareHint = 'instagram' | 'messenger' | null;

function isMobileUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

async function writeShareBody(shareBody: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return false;
    }
    await navigator.clipboard.writeText(shareBody);
    return true;
  } catch {
    return false;
  }
}

function openDesktopTab(url: string): Window | null {
  const popup = window.open('about:blank', '_blank');
  if (popup && !popup.closed) {
    popup.location.replace(url);
    popup.focus();
    return popup;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return null;
}

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
  const [shareHint, setShareHint] = useState<ShareHint>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const hintResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareBody = `${productTitle}\n\n${shareUrl}`;
  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareBody)}`;
  const emailHref = `mailto:?subject=${encodeURIComponent(`${productTitle} · Miozuki`)}&body=${encodeURIComponent(shareBody)}`;

  const showShareHint = useCallback((hint: ShareHint) => {
    setShareHint(hint);
    if (hintResetRef.current) clearTimeout(hintResetRef.current);
    if (hint) {
      hintResetRef.current = setTimeout(() => {
        setShareHint(null);
      }, 5000);
    }
  }, []);

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

  const handleMessengerShare = useCallback(() => {
    setOpen(false);
    showShareHint('messenger');

    const encodedLink = encodeURIComponent(shareUrl);
    const isMobile = isMobileUserAgent();

    if (isMobile) {
      void writeShareBody(shareBody);
      window.location.href = `fb-messenger://share/?link=${encodedLink}`;
      return;
    }

    openDesktopTab('https://www.messenger.com/');
    void writeShareBody(shareBody);
  }, [shareBody, shareUrl, showShareHint]);

  const handleInstagramDm = useCallback(() => {
    setOpen(false);
    showShareHint('instagram');

    const isMobile = isMobileUserAgent();
    const encodedBody = encodeURIComponent(shareBody);

    if (isMobile) {
      void writeShareBody(shareBody);
      window.location.href = `instagram://sharesheet?text=${encodedBody}`;
      return;
    }

    openDesktopTab('https://www.instagram.com/direct/inbox/');
    void writeShareBody(shareBody);
  }, [shareBody, showShareHint]);

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
      if (hintResetRef.current) clearTimeout(hintResetRef.current);
    };
  }, []);

  const linkClass =
    'flex min-h-11 w-full items-center px-4 py-2.5 text-left text-xs tracking-wide text-charcoal transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-burgundy/35';

  return (
    <div ref={wrapRef} className="relative flex flex-col items-start">
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
        Share this piece
      </button>

      <span className="sr-only" aria-live="polite">
        {shareHint === 'instagram'
          ? 'Copied. Opening Instagram DMs. Paste to send if needed.'
          : shareHint === 'messenger'
            ? 'Copied. Opening Facebook chat. Pick a conversation to send this link.'
            : ''}
      </span>

      {shareHint === 'instagram' ? (
        <p
          className="mt-2 max-w-xs text-[10px] tracking-wide text-charcoal/50"
          role="status"
          aria-hidden
        >
          Link copied. Paste into your Instagram DM if it is not already there.
        </p>
      ) : shareHint === 'messenger' ? (
        <p
          className="mt-2 max-w-xs text-[10px] tracking-wide text-charcoal/50"
          role="status"
          aria-hidden
        >
          Link copied. Choose a chat in Facebook and paste to send this piece.
        </p>
      ) : null}

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Share this product"
          className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-3rem,20rem)] border border-charcoal/10 bg-cream py-2 rounded-sm"
        >
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
          <button
            type="button"
            role="menuitem"
            className={`${linkClass} ${shareHint === 'instagram' ? 'text-burgundy' : ''}`}
            onClick={handleInstagramDm}
          >
            Instagram DM
            <span className="sr-only">
              Copies the link and opens Instagram DMs so you can send it in a
              chat.
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${linkClass} ${shareHint === 'messenger' ? 'text-burgundy' : ''}`}
            onClick={handleMessengerShare}
          >
            Facebook chat
            <span className="sr-only">
              Copies the link and opens Facebook chat so you can send it in a
              conversation.
            </span>
          </button>
          <a href={emailHref} role="menuitem" className={linkClass} onClick={() => setOpen(false)}>
            Email
          </a>
        </div>
      )}
    </div>
  );
}
