'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-cream border-b border-charcoal/10 transition-shadow duration-300 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-xl tracking-[0.2em] text-charcoal uppercase"
        >
          Miozuki
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/collections"
            className="text-xs tracking-widest uppercase text-charcoal/70 hover:text-charcoal transition-colors"
          >
            Collections
          </Link>
          <Link
            href="/about"
            className="text-xs tracking-widest uppercase text-charcoal/70 hover:text-charcoal transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Cart icon */}
        <button
          aria-label="Cart"
          className="text-charcoal/70 hover:text-charcoal transition-colors"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <line x1="3" x2="21" y1="6" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}
