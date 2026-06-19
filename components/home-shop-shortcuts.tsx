import Link from 'next/link';

const SHORTCUTS = [
  { label: 'Moissanite rings', href: '/collections/moissanite-rings-nz' },
  { label: 'Moissanite earrings', href: '/collections/moissanite-ear-rings' },
  { label: 'Bridal', href: '/collections/bridal-jewellery' },
  { label: 'Best sellers', href: '/collections/best-sellers' },
] as const;

export default function HomeShopShortcuts() {
  return (
    <section className="border-b border-charcoal/8 bg-surface/50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-center text-xs tracking-[0.3em] uppercase text-burgundy">
          Shop by category
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SHORTCUTS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-12 items-center justify-center border border-charcoal/15 bg-cream px-4 text-center text-xs font-medium tracking-widest uppercase text-charcoal transition-colors hover:border-burgundy/40 hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
