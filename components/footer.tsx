import Link from 'next/link';

const HELP_LINKS = [
  { label: 'Moissanite FAQ', href: '/pages/moissanite-faq' },
  { label: 'Contact Us', href: '/pages/contact' },
  { label: 'Returns & Refunds', href: '/pages/returns-refunds-policy' },
  { label: 'Warranty', href: '/pages/warranty-cover' },
  { label: 'Size Guide', href: '/pages/size-guide' },
  { label: 'Jewellery Care', href: '/pages/jewellery-care-guide' },
];

const ABOUT_LINKS = [
  { label: 'About Miozuki', href: '/pages/about-us' },
  { label: 'Our Founder', href: '/pages/our-founder' },
  { label: 'Shipping Policy', href: '/policies/shipping-policy' },
];

const SOCIAL = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/miozukijewellery',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@miozuki.nz',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.02-.08Z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61578033779488',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-charcoal/8 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="sm:col-span-2 md:col-span-1">
          <span className="font-serif text-lg tracking-[0.2em] uppercase text-charcoal block mb-2">
            Miozuki
          </span>
          <p className="text-xs text-charcoal/45 leading-relaxed mb-5">
            Fine jewellery, designed in New Zealand.<br />
            Inspired by the moon.
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-charcoal/40 hover:text-charcoal transition-colors"
              >
                {s.svg}
              </a>
            ))}
          </div>
        </div>

        {/* Help */}
        <div>
          <p className="text-xs tracking-widest uppercase text-charcoal/40 mb-4">Help</p>
          <nav className="flex flex-col gap-2.5">
            {HELP_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-charcoal/55 hover:text-charcoal transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* About */}
        <div>
          <p className="text-xs tracking-widest uppercase text-charcoal/40 mb-4">About</p>
          <nav className="flex flex-col gap-2.5">
            {ABOUT_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-charcoal/55 hover:text-charcoal transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Shop */}
        <div>
          <p className="text-xs tracking-widest uppercase text-charcoal/40 mb-4">Shop</p>
          <nav className="flex flex-col gap-2.5">
            <Link href="/collections/best-sellers" className="text-xs text-charcoal/55 hover:text-charcoal transition-colors">Best Sellers</Link>
            <Link href="/collections/moissanite-rings" className="text-xs text-charcoal/55 hover:text-charcoal transition-colors">Moissanite Rings</Link>
            <Link href="/collections/moissanite-ear-rings" className="text-xs text-charcoal/55 hover:text-charcoal transition-colors">Moissanite Earrings</Link>
            <Link href="/collections/pearl-earrings" className="text-xs text-charcoal/55 hover:text-charcoal transition-colors">Pearl Earrings</Link>
            <Link href="/collections/bridal-jewellery" className="text-xs text-charcoal/55 hover:text-charcoal transition-colors">Bridal Jewellery</Link>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-charcoal/8 px-6 md:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-charcoal/30">
            © {new Date().getFullYear()} Miozuki. All rights reserved.
          </p>
          <p className="text-xs text-charcoal/25">
            Visa · Mastercard · Amex · Apple Pay · Google Pay · PayPal · Shop Pay
          </p>
        </div>
      </div>
    </footer>
  );
}
