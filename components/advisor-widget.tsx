'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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

const STARTERS = [
  'Is moissanite a real gemstone?',
  'Help me choose a ring',
  'Do you ship to Australia?',
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

/** Inline links: [label](/path) markdown links plus bare site paths. */
function InlineLinks({ text }: { text: string }) {
  const linkPattern =
    /\[([^\]]+)\]\((\/[^\s)]+)\)|(^|[\s(])(\/(?:products|collections|pages|policies|moissanite-guide|pearl-guide|bridal-guide)(?:\/[\w-]+)*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(text)) !== null) {
    if (match[1] !== undefined && match[2] !== undefined) {
      const label = match[1];
      const href = match[2];
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      parts.push(
        <Link
          key={`${match.index}-${href}`}
          href={href}
          onClick={() => track('advisor_link_click', { link_url: href })}
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70"
        >
          {label}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    } else if (match[4] !== undefined) {
      const href = match[4];
      const start = match.index + (match[3]?.length ?? 0);
      if (start > lastIndex) parts.push(text.slice(lastIndex, start));
      parts.push(
        <Link
          key={`${start}-${href}`}
          href={href}
          onClick={() => track('advisor_link_click', { link_url: href })}
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70"
        >
          {href}
        </Link>
      );
      lastIndex = start + href.length;
    }
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

/** Inline markdown: **bold** segments, links inside and outside bold. */
function InlineMd({ text }: { text: string }) {
  const boldPattern = /\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<InlineLinks key={`t${lastIndex}`} text={text.slice(lastIndex, match.index)} />);
    }
    parts.push(
      <strong key={`b${match.index}`} className="font-medium text-charcoal">
        <InlineLinks text={match[1]} />
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<InlineLinks key={`t${lastIndex}`} text={text.slice(lastIndex)} />);
  }
  return <>{parts}</>;
}

/**
 * Block-level markdown-lite for assistant replies: paragraphs, ordered and
 * unordered lists, bold, links. Safe on streaming partials (re-parsed per
 * chunk). Ting's screenshot showed raw ** and run-on numbered lists; this
 * renders them properly.
 */
function AssistantText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: { ordered: boolean; content: string }[] = [];
  let paragraph: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={key++} className="my-1.5 first:mt-0 last:mb-0">
        <InlineMd text={paragraph.join(' ')} />
      </p>
    );
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length === 0) return;
    const ordered = listItems[0].ordered;
    const items = listItems.map((item, i) => (
      <li key={i}>
        <InlineMd text={item.content} />
      </li>
    ));
    blocks.push(
      ordered ? (
        <ol key={key++} className="my-1.5 list-decimal space-y-1 pl-5">
          {items}
        </ol>
      ) : (
        <ul key={key++} className="my-1.5 list-disc space-y-1 pl-5">
          {items}
        </ul>
      )
    );
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const orderedMatch = line.match(/^\s*\d{1,2}[.)]\s+(.*)$/);
    const bulletMatch = line.match(/^\s*[-•]\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listItems.length > 0 && !listItems[0].ordered) flushList();
      listItems.push({ ordered: true, content: orderedMatch[1] });
    } else if (bulletMatch) {
      flushParagraph();
      if (listItems.length > 0 && listItems[0].ordered) flushList();
      listItems.push({ ordered: false, content: bulletMatch[1] });
    } else if (line.trim() === '') {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return <>{blocks}</>;
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
