'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import { linkifyBareRefs, toInternalHref } from '@/lib/advisor/markdown-utils';

/**
 * "Chat with Mio": the Miozuki jewellery guide. Floating button above the
 * Enquire button, brand-styled slide-over chat. The layout only renders this
 * component when the server has an ANTHROPIC_API_KEY.
 *
 * Persona notes: Mio presents as a warm human guide (name, avatar, voice) but
 * the footer keeps the explicit AI disclosure, and the system prompt makes her
 * answer honestly when asked if she is a real person. The avatar is a brand
 * moon mark, deliberately not a photoreal human face.
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Sceptic-first set (Ryo's pick, 2026-07-11): two doubt-killers plus
// durability, then one guided-selling chip.
const STARTERS = [
  'Is moissanite a real gemstone?',
  'Moissanite vs diamond: honest take?',
  'Will it scratch or cloud?',
  'Help me choose a ring',
] as const;

/** GA4 event, no-op when GA is not loaded (dev, preview, admin). */
function track(event: string, params?: Record<string, string>) {
  const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') gtag('event', event, params);
}

/** Miozuki moon-mark avatar (brand motif: waterway to the moon). */
function MioAvatar({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-burgundy/25 bg-gradient-to-b from-[#fcf0ef] to-blush"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path
          d="M16.5 3.5a9.3 9.3 0 1 0 4 16.6A10.6 10.6 0 0 1 16.5 3.5Z"
          fill="#7B1E22"
          opacity="0.9"
        />
        <path d="M17.5 6.6l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" fill="#7B1E22" opacity="0.65" />
      </svg>
    </span>
  );
}

/**
 * Assistant replies render through react-markdown (CommonMark), not a
 * hand-rolled parser. History lesson: three separate rendering bugs (raw **,
 * run-on lists, unrendered absolute-URL links) came from hand-rolling; a
 * maintained parser removes the whole failure class. Streaming-safe: the
 * partial text is simply re-parsed on every chunk.
 *
 * Pre-processing (lib/advisor/markdown-utils) linkifies the shapes CommonMark
 * leaves as plain text but the model sometimes emits anyway: bare site paths
 * and bare email addresses.
 */

function SmartLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  const raw = href ?? '';
  if (raw.startsWith('mailto:')) {
    const email = raw.slice('mailto:'.length);
    return (
      <a
        href={raw}
        onClick={() => track('advisor_email_click')}
        className="mx-0.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-burgundy/40 bg-cream px-2.5 py-0.5 align-middle text-xs text-burgundy transition-colors hover:border-burgundy hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        {email}
      </a>
    );
  }
  const internal = toInternalHref(raw);
  if (internal.startsWith('/')) {
    return (
      <Link
        href={internal}
        onClick={() => track('advisor_link_click', { link_url: internal })}
        className="text-burgundy underline underline-offset-2 hover:text-burgundy/70"
      >
        {children}
      </Link>
    );
  }
  // External link (rare; the prompt discourages them): open safely in a new tab.
  return (
    <a
      href={raw}
      target="_blank"
      rel="noopener noreferrer"
      className="text-burgundy underline underline-offset-2 hover:text-burgundy/70"
    >
      {children}
    </a>
  );
}

const MARKDOWN_COMPONENTS: Components = {
  a: ({ href, children }) => <SmartLink href={href}>{children}</SmartLink>,
  p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-medium text-charcoal">{children}</strong>,
  ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-5">{children}</ol>,
  ul: ({ children }) => <ul className="my-1.5 list-disc space-y-1 pl-5">{children}</ul>,
  li: ({ children }) => <li>{children}</li>,
};

// Text-level elements only; anything exotic (images, html, headings) degrades
// to its text content rather than rendering.
const ALLOWED_ELEMENTS = ['p', 'strong', 'em', 'a', 'ol', 'ul', 'li', 'br'];

function AssistantText({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={MARKDOWN_COMPONENTS}
      allowedElements={ALLOWED_ELEMENTS}
      unwrapDisallowed
      skipHtml
    >
      {linkifyBareRefs(text)}
    </ReactMarkdown>
  );
}

export default function AdvisorWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const history: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(history);
    setInput('');
    setBusy(true);
    track('advisor_message_sent');
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Keep the last 12 turns; the API rejects longer conversations.
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
      if (res.status === 429) {
        setMessages([
          ...history,
          {
            role: 'assistant',
            content:
              'You are sending messages a little faster than I can keep up with. Give me a few seconds and try again.',
          },
        ]);
        return;
      }
      if (!res.ok || !res.body) {
        throw new Error(`advisor ${res.status}`);
      }
      setMessages([...history, { role: 'assistant', content: '' }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assembled = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assembled += decoder.decode(value, { stream: true });
        const snapshot = assembled;
        setMessages([...history, { role: 'assistant', content: snapshot }]);
      }
    } catch {
      setMessages([
        ...history,
        {
          role: 'assistant',
          content:
            'Sorry, I could not answer just now. Please try again, or email info@miozuki.co.nz and we will help directly.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating trigger, stacked above the Enquire button */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          track('advisor_open');
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-[4.65rem] right-5 z-30 inline-flex items-center gap-2 rounded-full border border-burgundy bg-cream py-2 pl-2 pr-5 text-xs uppercase tracking-[0.12em] text-burgundy shadow-[0_8px_24px_var(--miozuki-shadow)] transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:bottom-20 md:right-6"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <MioAvatar size={28} />
        Chat with Mio
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
        aria-labelledby="advisor-heading"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-charcoal/10 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <MioAvatar size={40} />
            <div className="min-w-0">
              <h2 id="advisor-heading" className="font-serif text-xl leading-tight text-charcoal">
                Mio
              </h2>
              <p className="truncate text-xs text-charcoal/55">Your Miozuki jewellery guide</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={() => setMessages([])}
                aria-label="Start a new chat"
                title="Start a new chat"
                className="rounded-full p-2 text-charcoal/50 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                </svg>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-2 text-charcoal/60 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="flex gap-2.5">
              <MioAvatar size={28} />
              <div>
                <p className="text-sm leading-relaxed text-charcoal/75">
                  Kia ora! I&apos;m Mio. Ask me anything about moissanite, freshwater
                  pearls, sizing, shipping to NZ or Australia, or which piece might
                  suit you.
                </p>
                <div className="mt-4 flex flex-col items-start gap-2">
                  {STARTERS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-full border border-charcoal/15 bg-surface px-4 py-2 text-left text-sm text-charcoal/80 transition-colors hover:border-burgundy/40 hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, i) =>
              m.role === 'user' ? (
                <div
                  key={i}
                  className="ml-10 rounded-2xl rounded-br-sm bg-burgundy px-4 py-3 text-sm leading-relaxed text-cream"
                >
                  {m.content}
                </div>
              ) : (
                <div key={i} className="flex gap-2.5">
                  <MioAvatar size={28} />
                  <div className="mr-6 min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-charcoal/10 bg-surface px-4 py-3 text-sm leading-relaxed text-charcoal/85">
                    <AssistantText text={m.content} />
                  </div>
                </div>
              )
            )
          )}
          {busy && messages[messages.length - 1]?.role === 'user' ? (
            <div className="flex items-center gap-2.5">
              <MioAvatar size={28} />
              <p className="text-sm text-charcoal/50">Mio is typing…</p>
            </div>
          ) : null}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-charcoal/10 px-5 py-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1200}
              placeholder="Ask Mio about a piece, sizing, shipping…"
              aria-label="Your question"
              className="min-w-0 flex-1 rounded-full border border-charcoal/20 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
            />
            <button
              type="submit"
              disabled={busy || input.trim().length === 0}
              className="rounded-full border border-burgundy bg-burgundy px-5 py-2.5 text-xs uppercase tracking-[0.08em] text-cream transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-[11px] text-charcoal/45">
            Mio is an AI assistant and can make mistakes. Prices and policies are
            confirmed at checkout. For orders and bespoke work,{' '}
            <a href="mailto:info@miozuki.co.nz" className="underline underline-offset-2">
              email us
            </a>
            .
          </p>
        </form>
      </div>
    </>
  );
}
