'use client';

import { useRef, useState } from 'react';

const BUDGET_OPTIONS = [
  '$1,000 – $2,000 NZD',
  '$2,000 – $4,000 NZD',
  '$4,000 – $6,000 NZD',
  'Above $6,000 NZD',
] as const;

const LEAD_TIME_OPTIONS = [
  'Less than 4 weeks',
  '1–3 months',
  '3–6 months',
  '6+ months',
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

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 1_500_000;

const fieldClass =
  'w-full border border-charcoal/15 bg-transparent px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-charcoal/40 transition-colors disabled:opacity-50';

const labelClass = 'block text-xs tracking-widest uppercase text-charcoal/65 mb-2';

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CustomMadeEnquiryForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [hearAbout, setHearAbout] = useState('');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addPhotos(incoming: FileList | File[]) {
    const next: File[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(incoming)) {
      if (!file.type.startsWith('image/')) {
        rejected.push(`${file.name} is not an image`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        rejected.push(`${file.name} is too large (max ${formatFileSize(MAX_PHOTO_BYTES)})`);
        continue;
      }
      if (photos.length + next.length >= MAX_PHOTOS) {
        rejected.push(`You can attach up to ${MAX_PHOTOS} photos`);
        break;
      }
      next.push(file);
    }

    if (rejected.length > 0) {
      setError(rejected[0]);
    } else {
      setError(null);
    }

    if (next.length > 0) {
      setPhotos((current) => [...current, ...next].slice(0, MAX_PHOTOS));
    }
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, i) => i !== index));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone.trim());
    formData.append('budget', budget);
    formData.append('leadTime', leadTime);
    if (hearAbout.trim()) formData.append('hearAbout', hearAbout.trim());
    formData.append('message', message.trim());
    formData.append('source', 'miozuki-custom-made-form');
    formData.append('mz_hp', honeypot);
    for (const photo of photos) {
      formData.append('photos', photo);
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
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
        <p className="text-sm text-charcoal/65 leading-relaxed">
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
        <p className="mt-1.5 text-xs text-charcoal/65">Only used to reply to your enquiry.</p>
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
        <p className="mt-1.5 text-xs text-charcoal/65">Helps us give you a realistic estimate.</p>
      </div>

      <div>
        <label htmlFor="custom-hear-about" className={labelClass}>
          How did you hear about Miozuki?{' '}
          <span className="normal-case tracking-normal text-charcoal/65">(optional)</span>
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
        <p className={labelClass}>
          Inspiration photos{' '}
          <span className="normal-case tracking-normal text-charcoal/65">(optional)</span>
        </p>
        <div className="border border-dashed border-charcoal/20 bg-surface/40 px-4 py-5">
          <input
            ref={fileInputRef}
            id="custom-photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            aria-label="Inspiration photos (optional)"
            disabled={loading || photos.length >= MAX_PHOTOS}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) addPhotos(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={loading || photos.length >= MAX_PHOTOS}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-charcoal/15 bg-cream px-4 py-3 text-xs tracking-[0.04em] uppercase text-charcoal transition-colors hover:border-charcoal/30 disabled:opacity-50"
          >
            {photos.length >= MAX_PHOTOS ? 'Photo limit reached' : 'Choose photos from your device'}
          </button>
          <p className="mt-2 text-xs text-charcoal/65">
            Up to {MAX_PHOTOS} images, {formatFileSize(MAX_PHOTO_BYTES)} each. JPG, PNG, or HEIC from your
            camera roll.
          </p>

          {photos.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {photos.map((photo, index) => (
                <li
                  key={`${photo.name}-${photo.size}-${index}`}
                  className="flex items-center justify-between gap-3 border border-charcoal/10 bg-cream px-3 py-2 text-xs text-charcoal/70"
                >
                  <span className="truncate">
                    {photo.name} ({formatFileSize(photo.size)})
                  </span>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => removePhoto(index)}
                    className="shrink-0 text-burgundy underline underline-offset-2 hover:text-burgundy/70"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
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
