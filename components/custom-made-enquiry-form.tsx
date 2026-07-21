'use client';

import { useState } from 'react';

const BUDGET_OPTIONS = [
  '$500 – $1,000 NZD',
  '$1,000 – $2,000 NZD',
  '$2,000 – $4,000 NZD',
  '$4,000+ NZD',
  'Not sure yet',
] as const;

const LEAD_TIME_OPTIONS = [
  'Less than 4 weeks',
  '1–3 months',
  '3–6 months',
  '6+ months',
  'Flexible',
] as const;

const HEAR_ABOUT_OPTIONS = [
  'Instagram',
  'Facebook',
  'Google',
  'TikTok',
  'Pinterest',
  'Word of mouth',
  'Other',
] as const;

const fieldClass =
  'w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors disabled:opacity-50';

const labelClass = 'block text-xs tracking-widest uppercase text-charcoal/50 mb-2';

export default function CustomMadeEnquiryForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [hearAbout, setHearAbout] = useState('');
  const [message, setMessage] = useState('');
  const [photoLink, setPhotoLink] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const composedMessage = [
      'Custom made enquiry',
      '',
      `Phone: ${phone.trim()}`,
      `Budget: ${budget}`,
      `Lead time: ${leadTime}`,
      hearAbout.trim() ? `How they heard about Miozuki: ${hearAbout.trim()}` : null,
      `Inspiration photo: ${photoLink.trim()}`,
      '',
      'Message:',
      message.trim(),
    ]
      .filter((line) => line != null)
      .join('\n');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          order: '',
          message: composedMessage,
          mz_hp: honeypot,
        }),
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
        <p className="font-serif text-lg text-charcoal mb-2">Enquiry received.</p>
        <p className="text-sm text-charcoal/55 leading-relaxed">
          Thank you; we&apos;ll get back to you within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="custom_mz_hp">Leave this field blank</label>
        <input
          id="custom_mz_hp"
          name="mz_hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="custom-name" className={labelClass}>
          Full name <span className="text-burgundy">*</span>
        </label>
        <input
          id="custom-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className={fieldClass}
          placeholder="Full name"
        />
      </div>

      <div>
        <label htmlFor="custom-email" className={labelClass}>
          Email <span className="text-burgundy">*</span>
        </label>
        <input
          id="custom-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={fieldClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="custom-phone" className={labelClass}>
          Phone number <span className="text-burgundy">*</span>
        </label>
        <input
          id="custom-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          className={fieldClass}
          placeholder="02X XXX XXXX"
        />
        <p className="mt-1.5 text-xs text-charcoal/40">Only used to reply to your enquiry.</p>
      </div>

      <div>
        <label htmlFor="custom-budget" className={labelClass}>
          Budget <span className="text-burgundy">*</span>
        </label>
        <select
          id="custom-budget"
          name="budget"
          required
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          disabled={loading}
          className={fieldClass}
        >
          <option value="" disabled>
            Select a budget range
          </option>
          {BUDGET_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="custom-lead-time" className={labelClass}>
          Lead time <span className="text-burgundy">*</span>
        </label>
        <select
          id="custom-lead-time"
          name="leadTime"
          required
          value={leadTime}
          onChange={(e) => setLeadTime(e.target.value)}
          disabled={loading}
          className={fieldClass}
        >
          <option value="" disabled>
            Select a timeline
          </option>
          {LEAD_TIME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-charcoal/40">Helps us give you a realistic estimate.</p>
      </div>

      <div>
        <label htmlFor="custom-hear-about" className={labelClass}>
          How did you hear about Miozuki?{' '}
          <span className="normal-case tracking-normal text-charcoal/30">(optional)</span>
        </label>
        <select
          id="custom-hear-about"
          name="hearAbout"
          value={hearAbout}
          onChange={(e) => setHearAbout(e.target.value)}
          disabled={loading}
          className={fieldClass}
        >
          <option value="">Select an option</option>
          {HEAR_ABOUT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="custom-message" className={labelClass}>
          Message <span className="text-burgundy">*</span>
        </label>
        <textarea
          id="custom-message"
          name="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          className={`${fieldClass} resize-none`}
          placeholder="Tell us about the piece you have in mind: style, metal, stone, occasion, or any questions."
        />
      </div>

      <div>
        <label htmlFor="custom-photo-link" className={labelClass}>
          Inspiration photo <span className="text-burgundy">*</span>
        </label>
        <input
          id="custom-photo-link"
          name="photoLink"
          type="url"
          required
          value={photoLink}
          onChange={(e) => setPhotoLink(e.target.value)}
          disabled={loading}
          className={fieldClass}
          placeholder="https://"
        />
        <p className="mt-1.5 text-xs text-charcoal/40">
          Paste a Google Drive, Dropbox, Pinterest, or Instagram link to your inspiration photos.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full border border-burgundy bg-burgundy text-cream text-xs tracking-[0.04em] uppercase py-4 transition-colors hover:border-accent-hover hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send enquiry'}
      </button>

      {error ? <p className="text-xs text-burgundy">{error}</p> : null}
    </form>
  );
}
