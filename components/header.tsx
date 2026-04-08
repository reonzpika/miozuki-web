'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from './cart-provider';
import CartDrawer from './cart-drawer';

const NAV = [
  {
    label: 'Rings',
    href: '/collections/moissanite-rings',
    children: [
      { label: 'Moissanite Rings', href: '/collections/moissanite-rings' },
      { label: 'Bridal Rings', href: '/collections/bridal-jewellery' },
    ],
  },
  {
    label: 'Earrings',
    href: '/collections/moissanite-ear-rings',
    children: [
      { label: 'Moissanite Earrings', href: '/collections/moissanite-ear-rings' },
      { label: 'Pearl Earrings', href: '/collections/pearl-earrings' },
    ],
  },
  {
    label: 'Pearl Jewellery',
    href: '/collections/pearl-earrings',
    children: null,
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
];

const MOBILE_NAV = [
  { label: 'Best Sellers', href: '/collections/best-sellers', indent: false },
  { label: 'Moissanite Rings', href: '/collections/moissanite-rings', indent: true },
  { label: 'Bridal Rings', href: '/collections/bridal-jewellery', indent: true },
  { label: 'Moissanite Earrings', href: '/collections/moissanite-ear-rings', indent: true },
  { label: 'Pearl Jewellery', href: '/collections/pearl-earrings', indent: true },
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
        className={`sticky top-0 z-40 bg-cream border-b border-charcoal/10 transition-shadow duration-300 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden text-charcoal/70 hover:text-charcoal transition-colors w-6 flex flex-col gap-1.5 justify-center"
          >
            <span className={`block h-px w-full bg-current transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? 'w-0 opacity-0' : 'w-full opacity-100'}`} />
            <span className={`block h-px w-full bg-current transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>

          {/* Wordmark */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="font-serif text-xl tracking-[0.2em] text-charcoal uppercase absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
          >
            Miozuki
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((navItem) => (
              <div
                key={navItem.label}
                className="relative"
                onMouseEnter={() => navItem.children && setActiveDropdown(navItem.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={navItem.href}
                  className="flex items-center gap-1 text-xs tracking-widest uppercase text-charcoal/70 hover:text-charcoal transition-colors py-2 nav-underline"
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
                      <div className="bg-cream border border-charcoal/10 shadow-md py-1.5">
                        {navItem.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2.5 text-xs tracking-widest uppercase text-charcoal/60 hover:text-charcoal hover:bg-charcoal/4 transition-colors"
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
            onClick={() => { setMenuOpen(false); setCartOpen(true); }}
            aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
            className="relative text-charcoal/70 hover:text-charcoal transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" x2="21" y1="6" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {cartCount > 0 && (
              <span
                suppressHydrationWarning
                className="absolute -top-1 -right-1.5 w-4 h-4 bg-burgundy text-cream text-[9px] flex items-center justify-center"
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-cream border-t border-charcoal/8 ${
            menuOpen ? 'max-h-[460px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="px-6 py-5 flex flex-col gap-4">
            {MOBILE_NAV.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm tracking-widest uppercase hover:text-charcoal transition-colors ${
                  link.indent ? 'pl-4 text-charcoal/50' : 'text-charcoal/70'
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
