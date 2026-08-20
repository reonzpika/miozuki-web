'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MiozukiBrandLogo } from './miozuki-brand-logo';
import { useCart } from './cart-provider';
import CartDrawer from './cart-drawer';

const NAV = [
  {
    label: 'Rings',
    href: '/collections/moissanite-rings',
    children: [
      { label: 'Moissanite Rings', href: '/collections/moissanite-rings' },
    ],
  },
  {
    label: 'Earrings',
    href: '/collections/moissanite-earrings',
    children: [
      { label: 'Moissanite Earrings', href: '/collections/moissanite-earrings' },
      { label: 'Pearl Earrings', href: '/collections/pearl-earrings' },
    ],
  },
  {
    label: 'Necklaces',
    href: '/collections/moissanite-necklace-nz',
    children: [
      { label: 'Moissanite Necklaces', href: '/collections/moissanite-necklace-nz' },
      { label: 'Pearl Necklaces', href: '/collections/pearl-necklace-nz' },
    ],
  },
  {
    label: 'Bridal',
    href: '/collections/bridal-jewellery',
    children: null,
  },
  {
    label: 'Best Sellers',
    href: '/collections/best-sellers',
    children: null,
  },
  {
    label: 'Appointment',
    href: '/pages/appointment-online',
    children: null,
  },
  {
    label: 'Custom Made',
    href: '/pages/bespoke-order',
    children: null,
  },
];

const MOBILE_NAV = [
  { label: 'Best Sellers', href: '/collections/best-sellers', indent: false },
  { label: 'Moissanite Rings', href: '/collections/moissanite-rings', indent: true },
  { label: 'Moissanite Earrings', href: '/collections/moissanite-earrings', indent: true },
  { label: 'Moissanite Necklaces', href: '/collections/moissanite-necklace-nz', indent: true },
  { label: 'Pearl Necklaces', href: '/collections/pearl-necklace-nz', indent: true },
  { label: 'Pearl Earrings', href: '/collections/pearl-earrings', indent: true },
  { label: 'Bridal', href: '/collections/bridal-jewellery', indent: true },
  { label: 'Appointment', href: '/pages/appointment-online', indent: false },
  { label: 'Custom Made', href: '/pages/bespoke-order', indent: false },
  { label: 'About Miozuki', href: '/pages/about-us', indent: false },
  { label: 'Our Founder', href: '/pages/our-founder', indent: true },
];

const ease1 = [0.22, 1, 0.36, 1] as [number, number, number, number];
const ease2 = [0.4, 0, 1, 1] as [number, number, number, number];

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scaleY: 0.96 },
  show: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.18, ease: ease1 } },
  exit: { opacity: 0, y: -4, scaleY: 0.97, transition: { duration: 0.13, ease: ease2 } },
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-header-bg border-b border-header-fg/20 transition-shadow duration-300 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="relative mx-auto flex h-20 w-full max-w-7xl items-center gap-3 px-6 md:gap-8 md:px-10">
          {/* Mobile: menu + wordmark on the left; desktop: wordmark participates in row via md:contents */}
          <div className="flex min-w-0 flex-1 items-center gap-3 md:contents">
            {/* Hamburger, mobile only (subdued so the wordmark reads as primary) */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="relative z-10 -ml-2 inline-flex h-11 min-h-[44px] min-w-[44px] shrink-0 flex-col items-center justify-center gap-[5px] text-header-fg/55 transition-colors hover:text-header-fg/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-header-fg/45 focus-visible:ring-offset-2 focus-visible:ring-offset-header-bg md:hidden"
            >
              <span className={`block h-px w-[18px] bg-current transition-all duration-300 origin-center ${menuOpen ? 'translate-y-[3px] rotate-45' : ''}`} />
              <span className={`block h-px w-[18px] bg-current transition-all duration-300 ${menuOpen ? 'w-0 opacity-0' : 'opacity-100'}`} />
              <span className={`block h-px w-[18px] bg-current transition-all duration-300 origin-center ${menuOpen ? '-translate-y-[3px] -rotate-45' : ''}`} />
            </button>

            {/* Full lockup from brand SVG (transparent; matches header ivory) */}
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              aria-label="Miozuki home"
              className="relative z-10 flex min-h-11 min-w-0 shrink items-center justify-start rounded-sm transition-opacity duration-normal [transition-timing-function:var(--ease-out)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-header-fg/45 focus-visible:ring-offset-2 focus-visible:ring-offset-header-bg md:max-w-[min(100%,14rem)] md:shrink-0"
            >
              <span className="relative flex min-w-0 justify-start">
                <MiozukiBrandLogo
                  variant="light"
                  priority
                  className="h-[4.35rem] w-auto max-w-full md:h-[4.85rem] pointer-events-none select-none"
                />
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-8 md:flex">
            {NAV.map((navItem) => (
              <div
                key={navItem.label}
                className="relative"
                onMouseEnter={() => navItem.children && setActiveDropdown(navItem.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={navItem.href}
                  className="flex items-center gap-1 text-xs tracking-widest uppercase text-header-fg/85 hover:text-header-fg transition-colors py-2 nav-underline-header focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-header-fg/45 focus-visible:ring-offset-2 focus-visible:ring-offset-header-bg rounded-sm"
                >
                  {navItem.label}
                  {navItem.children && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-35">
                      <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </Link>

                {/* Animated dropdown */}
                <AnimatePresence>
                  {navItem.children && activeDropdown === navItem.label && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="absolute top-full left-0 pt-1 min-w-[210px] z-50 origin-top"
                    >
                      <div className="bg-cream border border-charcoal/15 py-1.5">
                        {navItem.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2.5 text-xs tracking-widest uppercase text-charcoal/65 transition-colors hover:bg-charcoal/4 hover:text-charcoal focus-visible:bg-charcoal/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-burgundy/30"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Cart */}
          <button
            type="button"
            onClick={() => { setMenuOpen(false); setCartOpen(true); }}
            aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
            className="relative z-10 -mr-2 inline-flex h-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-header-fg/70 transition-colors hover:text-header-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-header-fg/45 focus-visible:ring-offset-2 focus-visible:ring-offset-header-bg md:mr-0 md:text-header-fg/85"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" x2="21" y1="6" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span
                suppressHydrationWarning
                className="absolute -top-1 -right-1.5 w-4 h-4 bg-header-fg text-header-bg text-[9px] flex items-center justify-center"
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-header-bg border-t border-header-fg/15 ${
            menuOpen ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="px-6 py-5 flex flex-col gap-1">
            {MOBILE_NAV.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block min-h-11 py-3 text-sm tracking-widest uppercase leading-snug hover:text-header-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-header-fg/45 focus-visible:ring-inset rounded-sm ${
                  link.indent ? 'pl-4 text-header-fg/60' : 'text-header-fg/85'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
