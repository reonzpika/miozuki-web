import Link from 'next/link';

/**
 * Shared chrome for all three content hubs (/moissanite-guide, /pearl-guide,
 * /bridal-guide). Each hub's own layout.tsx renders this with its own label and
 * root path, so the breadcrumb and container styling stay identical everywhere.
 * Article metadata/canonical is exported by each page.mdx.
 */
export function GuideHubLayout({
  hubLabel,
  hubHref,
  children,
}: {
  hubLabel: string;
  hubHref: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs uppercase tracking-[0.2em] text-charcoal/65"
      >
        <Link href="/" className="transition-colors hover:text-charcoal">
          Home
        </Link>
        <span className="text-charcoal/30" aria-hidden>
          /
        </span>
        <Link href={hubHref} className="transition-colors hover:text-charcoal">
          {hubLabel}
        </Link>
      </nav>

      {children}
    </main>
  );
}
