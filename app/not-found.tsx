import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page not found | Miozuki',
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center md:px-10">
      <p className="mb-4 font-serif text-5xl text-charcoal/25 md:text-6xl">404</p>
      <h1 className="mb-3 font-serif text-3xl text-charcoal leading-tight md:text-4xl">
        This page slipped away
      </h1>
      <p className="mb-10 max-w-md text-sm leading-relaxed text-charcoal/60">
        The page you are looking for has moved or no longer exists. Let&apos;s help you find
        something beautiful instead.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-burgundy px-6 text-xs font-medium uppercase tracking-widest text-cream transition-colors hover:bg-burgundy/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Back to home
        </Link>
        <Link
          href="/collections"
          className="inline-flex min-h-11 items-center justify-center px-4 text-xs font-medium uppercase tracking-widest text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Shop the collections
        </Link>
      </div>
    </main>
  );
}
