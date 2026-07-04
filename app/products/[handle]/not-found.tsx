import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center md:px-10">
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-burgundy">
        Not found
      </p>
      <h1 className="mb-6 font-serif text-3xl text-charcoal md:text-4xl">
        We could not find this piece
      </h1>
      <p className="mb-10 max-w-lg text-sm leading-relaxed text-charcoal/70">
        The product may have moved, sold out, or been retired from the
        collection. Browse the catalogue to find something else.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/collections/moissanite-nz"
          className="inline-flex min-h-11 items-center justify-center border border-charcoal/40 px-8 py-3 text-xs uppercase tracking-[0.2em] text-charcoal transition-colors duration-300 hover:bg-charcoal hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Shop the Collection
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.2em] text-burgundy underline underline-offset-4 transition-colors hover:text-burgundy/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
