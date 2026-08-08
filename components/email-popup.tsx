'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { MiozukiBrandLogo } from '@/components/miozuki-brand-logo';

const STORAGE_KEY = 'miozuki_popup_v1';
const SESSION_PV_KEY = 'miozuki_popup_pv';
const DISMISS_DAYS = 7;
const DELAY_SECOND_PAGE_MS = 14_000;
const DELAY_SINGLE_PAGE_MS = 38_000;

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return true;
  const { subscribedAt, dismissedAt } = JSON.parse(raw) as {
    subscribedAt?: number;
    dismissedAt?: number;
  };
  if (subscribedAt) return false;
  if (dismissedAt) {
    const days = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return days > DISMISS_DAYS;
  }
  return true;
}

function suppressDismiss() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
}

function suppressSubscribed() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ subscribedAt: Date.now() }));
}

/** True once someone has closed the popup without subscribing: the reopen badge should be there for them from then on. */
function hasDismissedBefore(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const { subscribedAt, dismissedAt } = JSON.parse(raw) as {
    subscribedAt?: number;
    dismissedAt?: number;
  };
  return Boolean(dismissedAt) && !subscribedAt;
}

export default function EmailPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReopenBadge, setShowReopenBadge] = useState(false);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setShowReopenBadge(hasDismissedBefore());
  }, []);

  useEffect(() => {
    const next =
      (parseInt(sessionStorage.getItem(SESSION_PV_KEY) ?? '0', 10) || 0) + 1;
    sessionStorage.setItem(SESSION_PV_KEY, String(next));
  }, [pathname]);

  useEffect(() => {
    const stored =
      parseInt(sessionStorage.getItem(SESSION_PV_KEY) ?? '0', 10) || 0;
    const delay =
      stored >= 2 ? DELAY_SECOND_PAGE_MS : DELAY_SINGLE_PAGE_MS;
    const timer = window.setTimeout(() => {
      if (shouldShow()) setOpen(true);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    lastFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocusRef.current?.focus?.();
    };
  }, [open]);

  function dismiss() {
    suppressDismiss();
    setOpen(false);
    setShowReopenBadge(true);
  }

  function reopen() {
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
      suppressSubscribed();
      setShowReopenBadge(false);
      setTimeout(() => setOpen(false), 2200);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
          />

          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-popup-title"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-sm bg-burgundy border border-charcoal/15">
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center text-cream/55 transition-colors hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/45 focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy"
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>

              <div className="px-8 py-10 text-center">
                <div className="mb-5 flex justify-center">
                  <MiozukiBrandLogo variant="light" className="h-12 w-auto opacity-95 pointer-events-none select-none md:h-14" />
                </div>

                <div className="mb-6 flex items-center justify-center gap-3">
                  <div className="h-px w-8 bg-gold/55" />
                  <div className="h-1.5 w-1.5 rotate-45 bg-gold" />
                  <div className="h-px w-8 bg-gold/55" />
                </div>

                <p className="mb-2 text-xs tracking-[0.3em] uppercase text-cream/75">
                  An invitation to join Miozuki
                </p>

                <h2 id="email-popup-title" className="mb-3 font-serif text-2xl leading-tight text-cream md:text-3xl">
                  Be first to discover what&apos;s next
                </h2>

                <p className="mx-auto mb-7 max-w-sm text-xs leading-relaxed text-cream/80">
                  Join the list for early access to new arrivals and receive{' '}
                  <span className="font-medium uppercase tracking-[0.08em] text-cream">$15 off your first order</span>{' '}
                  <span className="text-[10px] leading-snug text-cream/65">
                    (discount codes cannot be applied to sale items)
                  </span>
                </p>

                {submitted ? (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-4 text-sm tracking-wide text-cream/85"
                  >
                    Thank you{name ? `, ${name}` : ''}; you&apos;re on the list.
                  </motion.p>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      disabled={loading}
                      className="w-full border border-cream/35 bg-cream px-4 py-3 text-sm text-charcoal transition-colors placeholder:text-charcoal/40 focus:border-cream focus:outline-none disabled:opacity-50"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={loading}
                      className="w-full border border-cream/35 bg-cream px-4 py-3 text-sm text-charcoal transition-colors placeholder:text-charcoal/40 focus:border-cream focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 w-full rounded-full border border-cream/35 bg-cream px-8 py-3.5 text-xs uppercase tracking-[0.04em] text-burgundy transition-colors duration-200 hover:bg-white-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/45 focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy disabled:opacity-60"
                    >
                      {loading ? 'Joining...' : 'Join the List'}
                    </button>
                    {error && (
                      <p className="mt-1 text-xs text-cream/70">{error}</p>
                    )}
                  </form>
                )}

                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-5 min-h-11 px-4 text-xs tracking-wide text-cream/45 transition-colors hover:text-cream/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40 focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy"
                >
                  No thanks
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {!open && showReopenBadge && (
        <motion.button
          key="reopen-badge"
          type="button"
          onClick={reopen}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          aria-label="Reopen the $15 off sign-up offer"
          className="fixed bottom-5 left-5 z-30 inline-flex items-center gap-2 rounded-full border border-burgundy bg-burgundy px-5 py-3 text-xs uppercase tracking-[0.12em] text-cream shadow-[0_8px_24px_var(--miozuki-shadow)] transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:bottom-6 md:left-6"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          $15 off
        </motion.button>
      )}
    </AnimatePresence>
    </>
  );
}
