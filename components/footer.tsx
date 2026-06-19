import Link from 'next/link';
import { MiozukiBrandLogo } from '@/components/miozuki-brand-logo';

const HELP_LINKS = [
  { label: 'Contact Us', href: '/pages/contact' },
  { label: 'Shipping Policy', href: '/policies/shipping-policy' },
  { label: 'Returns & Refunds', href: '/pages/returns-refunds-policy' },
  { label: 'Warranty', href: '/pages/warranty-cover' },
  { label: 'Size Guide', href: '/pages/size-guide' },
  { label: 'Moissanite FAQ', href: '/pages/moissanite-faq' },
];

const RESOURCES_LINKS = [
  { label: 'Jewellery Care', href: '/pages/jewellery-care-guide' },
];

const ABOUT_LINKS = [
  { label: 'About Miozuki', href: '/pages/about-us' },
  { label: 'Our Founder', href: '/pages/our-founder' },
  { label: 'Journal', href: '/blogs/news' },
];

const SHOP_LINKS = [
  { label: 'Best Sellers', href: '/collections/best-sellers' },
  { label: 'Moissanite Rings', href: '/collections/moissanite-rings-nz' },
  { label: 'Moissanite Earrings', href: '/collections/moissanite-ear-rings' },
  { label: 'Moissanite Necklaces', href: '/collections/moissanite-necklace-nz' },
  { label: 'Pearl Earrings', href: '/collections/pearl-earrings' },
  { label: 'Bridal Jewellery', href: '/collections/bridal-jewellery' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/policies/privacy-policy' },
  { label: 'Terms of Service', href: '/policies/terms-of-service' },
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

const linkClassName =
  'block rounded-sm py-1.5 text-sm leading-snug text-charcoal/55 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream min-h-10 sm:min-h-0 md:py-2';

const sectionTitleClassName =
  'mb-4 font-sans text-sm font-medium text-charcoal';

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className={sectionTitleClassName}>{title}</p>
      <nav className="flex flex-col gap-0.5" aria-label={title}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={linkClassName}>
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-charcoal/8 bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:px-10 md:py-14 lg:py-16">
        {/* Brand strip (Mejuri-style band above link columns) */}
        <div className="border-b border-charcoal/8 pb-8 md:pb-10 lg:pb-12">
          <Link
            href="/"
            className="inline-block rounded-sm transition-opacity duration-normal [transition-timing-function:var(--ease-out)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            aria-label="Miozuki home"
          >
            <MiozukiBrandLogo
              variant="dark"
              className="h-[5rem] w-auto sm:h-[5.5rem] md:h-24 lg:h-28 pointer-events-none select-none"
            />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal/50 md:mt-5">
            NZ fine jewellery
          </p>
          <p className="mt-4 text-xs text-charcoal/40">
            Auckland, New Zealand · Proudly NZ-owned &amp; operated
          </p>
          <p className="mt-3">
            <a
              href="mailto:info@miozuki.co.nz"
              className="inline-flex min-h-10 items-center text-xs text-charcoal/50 underline underline-offset-4 transition-colors hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              info@miozuki.co.nz
            </a>
          </p>
        </div>

        {/* Four link columns */}
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-10 md:grid-cols-4 md:gap-x-8 lg:gap-x-12">
          <LinkColumn title="Help" links={HELP_LINKS} />
          <LinkColumn title="Resources" links={RESOURCES_LINKS} />
          <LinkColumn title="About" links={ABOUT_LINKS} />
          <LinkColumn title="Shop" links={SHOP_LINKS} />
        </div>
      </div>

      {/* Sub-footer: social + meta (pattern similar to Mejuri bottom strip) */}
      <div className="border-t border-charcoal/8 px-5 py-6 sm:px-6 md:px-10 md:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex flex-wrap items-center gap-1">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-charcoal/40 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                {s.svg}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3 md:items-end md:text-right">
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Legal">
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-xs text-charcoal/40 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="text-xs leading-snug text-charcoal/30">
              © {new Date().getFullYear()} Miozuki. All rights reserved.
            </p>
            <p className="max-w-md text-xs leading-snug text-charcoal/25 md:max-w-lg">
              Visa · Mastercard · Amex · Apple Pay · Google Pay · PayPal · Shop Pay
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
