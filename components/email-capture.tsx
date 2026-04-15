'use client';

import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function EmailCapture() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

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
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-24 px-6 bg-charcoal">
      <motion.div
        ref={ref}
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-8 bg-cream/15" />
          <div className="w-1.5 h-1.5 bg-cream/20 rotate-45" />
          <div className="h-px w-8 bg-cream/15" />
        </div>

        <p className="text-xs tracking-[0.3em] uppercase text-cream/40 mb-3">
          Early Access
        </p>

        <h2 className="font-serif text-3xl md:text-4xl text-cream leading-tight mb-4">
          New drops, first.
        </h2>

        <p className="text-sm text-cream/50 leading-relaxed mb-8 max-w-sm mx-auto">
          Join the list for early access to new collections and the occasional piece that doesn't make it to the main site.
        </p>

        {submitted ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-cream/70 tracking-wide"
          >
            Thank you — you&apos;re on the list.
          </motion.p>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 max-w-md mx-auto"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
                className="bg-transparent border border-cream/15 text-cream text-sm px-4 py-3 placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors duration-200 disabled:opacity-50"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="flex-1 bg-transparent border border-cream/15 text-cream text-sm px-4 py-3 placeholder-cream/25 focus:outline-none focus:border-cream/40 transition-colors duration-200 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="text-xs tracking-[0.2em] uppercase px-8 py-3 bg-cream text-charcoal hover:bg-cream/90 transition-colors duration-200 whitespace-nowrap disabled:opacity-60"
                >
                  {loading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
            {error && (
              <p className="mt-3 text-xs text-cream/50">{error}</p>
            )}
          </>
        )}
      </motion.div>
    </section>
  );
}
