'use client';

import { useState } from 'react';

export default function ContactForm({
  initialMessage = '',
}: {
  initialMessage?: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [company, setCompany] = useState(''); // honeypot — stays empty for real users
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, order, message, company }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-charcoal/10 bg-charcoal/3 px-5 py-6 text-center">
        <p className="font-serif text-lg text-charcoal mb-2">Message received.</p>
        <p className="text-sm text-charcoal/55 leading-relaxed">
          Thank you; we&apos;ll get back to you within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot: hidden from people, bots fill it. Do not remove or expose. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
          Your Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors disabled:opacity-50"
          placeholder="Full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors disabled:opacity-50"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="order" className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
          Order Number <span className="normal-case text-charcoal/30">(if applicable)</span>
        </label>
        <input
          id="order"
          name="order"
          type="text"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          disabled={loading}
          className="w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors disabled:opacity-50"
          placeholder="#1234"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs tracking-widest uppercase text-charcoal/50 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          className="w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors resize-none disabled:opacity-50"
          placeholder="How can we help?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full border border-burgundy bg-burgundy text-cream text-xs tracking-[0.04em] uppercase py-4 transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send Message'}
      </button>

      {error && (
        <p className="text-xs text-burgundy">{error}</p>
      )}
    </form>
  );
}
