'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('Article error boundary caught', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center md:px-10">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-burgundy">
        Something went wrong
      </p>
      <h1 className="mb-6 font-serif text-3xl text-charcoal md:text-4xl">
        We could not load this article
      </h1>
      <p className="mb-10 max-w-lg text-sm leading-relaxed text-charcoal/70">
        The journal is briefly unreachable. Try again in a moment, or browse
        other articles while we sort it out.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center border border-charcoal/40 px-8 py-3 text-xs uppercase tracking-[0.2em] text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Try again
        </button>
        <Link
          href="/blogs/news"
          className="inline-flex min-h-11 items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.2em] text-burgundy underline underline-offset-4 transition-colors hover:text-burgundy/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Read the Journal
        </Link>
      </div>
    </main>
  );
}
