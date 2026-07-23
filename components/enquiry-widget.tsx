'use client';

import { useEffect, useState } from 'react';
import ContactForm from '@/components/contact-form';

/**
 * Site-wide enquiry entry point: a floating "Enquire" button that opens a
 * right-hand slide-over reusing the shared ContactForm. Mirrors the cart-drawer
 * pattern (backdrop + translate-x panel) for visual and a11y consistency.
 */
export default function EnquiryWidget() {
  const [open, setOpen] = useState(false);

  // Close on Escape, matching the cart drawer.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full border border-burgundy bg-burgundy px-5 py-3 text-xs uppercase tracking-[0.12em] text-cream shadow-[0_8px_24px_var(--miozuki-shadow)] transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:bottom-6 md:right-6"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        Enquire
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-charcoal/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Slide-over */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-heading"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-charcoal/8 px-6 py-5">
          <h2 id="enquiry-heading" className="font-serif text-lg text-charcoal">
            Send an enquiry
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close enquiry form"
            className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-charcoal/65 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="mb-5 text-sm leading-relaxed text-charcoal/65">
            Questions about a piece, sizing, or a custom order? Send us a message
            and we&apos;ll reply within 1&ndash;2 business days.
          </p>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
