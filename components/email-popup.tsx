'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'miozuki_popup_v1';
const DISMISS_DAYS = 7;

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return true;
  const { subscribedAt, dismissedAt } = JSON.parse(raw);
  if (subscribedAt) return false; // subscribed — never show again
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

export default function EmailPopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShow()) setOpen(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    suppressDismiss();
    setOpen(false);
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
      setTimeout(() => setOpen(false), 2200);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative bg-cream w-full max-w-md pointer-events-auto shadow-2xl">
              {/* Close */}
              <button
                onClick={dismiss}
                aria-label="Close"
                className="absolute top-4 right-4 text-charcoal/35 hover:text-charcoal transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>

              <div className="px-8 py-10 text-center">
                {/* Decorative rule */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-px w-8 bg-charcoal/15" />
                  <div className="w-1.5 h-1.5 bg-charcoal/20 rotate-45" />
                  <div className="h-px w-8 bg-charcoal/15" />
                </div>

                <p className="text-xs tracking-[0.3em] uppercase text-burgundy mb-2">
                  Early Access
                </p>

                <h2 className="font-serif text-2xl md:text-3xl text-charcoal leading-tight mb-3">
                  New drops, first.
                </h2>

                <p className="text-xs text-charcoal/50 leading-relaxed mb-7 max-w-xs mx-auto">
                  Join the list for early access to new collections and the occasional piece that doesn't make it to the main site.
                </p>

                {submitted ? (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-charcoal/70 tracking-wide py-4"
                  >
                    Thank you{name ? `, ${name}` : ''} — you&apos;re on the list.
                  </motion.p>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      disabled={loading}
                      className="w-full border border-charcoal/15 bg-transparent text-charcoal text-sm px-4 py-3 placeholder-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors disabled:opacity-50"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={loading}
                      className="w-full border border-charcoal/15 bg-transparent text-charcoal text-sm px-4 py-3 placeholder-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full text-xs tracking-[0.2em] uppercase px-8 py-3.5 bg-charcoal text-cream hover:bg-charcoal/85 transition-colors duration-200 disabled:opacity-60 mt-1"
                    >
                      {loading ? 'Joining...' : 'Join the List'}
                    </button>
                    {error && (
                      <p className="text-xs text-charcoal/50 mt-1">{error}</p>
                    )}
                  </form>
                )}

                <button
                  onClick={dismiss}
                  className="mt-5 text-xs text-charcoal/30 hover:text-charcoal/60 transition-colors tracking-wide"
                >
                  No thanks
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
