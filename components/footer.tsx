import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-charcoal/8 py-12 px-6 md:px-10 bg-cream">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-start">
        {/* Brand */}
        <div>
          <span className="font-serif text-lg tracking-[0.2em] uppercase text-charcoal block mb-2">
            Miozuki
          </span>
          <p className="text-xs text-charcoal/40 leading-relaxed">
            Fine jewellery, designed in New Zealand.
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-2 md:items-center">
          <Link href="/collections" className="text-xs tracking-widest uppercase text-charcoal/50 hover:text-charcoal transition-colors">
            Collections
          </Link>
          <Link href="/about" className="text-xs tracking-widest uppercase text-charcoal/50 hover:text-charcoal transition-colors">
            About
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-charcoal/30 md:text-right">
          © {new Date().getFullYear()} Miozuki. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
