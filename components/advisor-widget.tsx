'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * Floating jewellery-advisor chat. Sits above the Enquire button (same corner,
 * same visual language). The layout only renders this component when the
 * server has an ANTHROPIC_API_KEY, so it never appears half-configured.
 * Streams plain text from /api/advisor; product links arrive as markdown
 * links and are rendered as real links.
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Is moissanite a real gemstone?',
  'Help me choose a ring',
  'Do you ship to Australia?',
] as const;

/** Render assistant text, turning [label](/path) markdown links into real links. */
function AssistantText({ text }: { text: string }) {
  // Fresh regex per render: a shared global regex carries lastIndex state,
  // which React lint rightly rejects as an external mutation.
  const linkPattern = /\[([^\]]+)\]\((\/[^\s)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <Link
        key={`${match.index}-${match[2]}`}
        href={match[2]}
        className="text-burgundy underline underline-offset-2 hover:text-burgundy/70"
      >
        {match[1]}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
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
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Keep the last 12 turns; the API rejects longer conversations.
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
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
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-[4.65rem] right-5 z-30 inline-flex items-center gap-2 rounded-full border border-burgundy bg-cream px-5 py-3 text-xs uppercase tracking-[0.12em] text-burgundy shadow-[0_8px_24px_var(--miozuki-shadow)] transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream md:bottom-20 md:right-6"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
          <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
        </svg>
        Ask us
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
        <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
          <div>
            <h2 id="advisor-heading" className="font-serif text-xl text-charcoal">
              Jewellery advisor
            </h2>
            <p className="text-xs text-charcoal/55">
              Instant answers, powered by AI. For orders and bespoke work,{' '}
              <a
                href="mailto:info@miozuki.co.nz"
                className="text-burgundy underline underline-offset-2"
              >
                email us
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close advisor"
            className="rounded-full p-2 text-charcoal/60 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {messages.length === 0 ? (
            <div>
              <p className="text-sm leading-relaxed text-charcoal/75">
                Kia ora! Ask me anything about moissanite, freshwater pearls, sizing,
                shipping to NZ or Australia, or which piece might suit.
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
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user'
                    ? 'ml-8 rounded-2xl rounded-br-sm bg-burgundy px-4 py-3 text-sm leading-relaxed text-cream'
                    : 'mr-8 whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-charcoal/10 bg-surface px-4 py-3 text-sm leading-relaxed text-charcoal/85'
                }
              >
                {m.role === 'assistant' ? <AssistantText text={m.content} /> : m.content}
              </div>
            ))
          )}
          {busy && messages[messages.length - 1]?.role === 'user' ? (
            <p className="mr-8 px-4 text-sm text-charcoal/50">Thinking…</p>
          ) : null}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-charcoal/10 px-6 py-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1200}
              placeholder="Ask about a piece, sizing, shipping…"
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
            AI answers can make mistakes. Prices and policies are confirmed at checkout.
          </p>
        </form>
      </div>
    </>
  );
}
