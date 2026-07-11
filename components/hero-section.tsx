'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const LINES = [
  { text: 'Fine jewellery,', em: false },
  { text: 'reimagined', em: true },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const lineVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
});

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden text-center max-md:min-h-[calc(85svh-4rem)]">
      {/* Background */}
      <Image
        src="https://cdn.shopify.com/s/files/1/0797/0819/3023/files/hero-image.webp?v=1773198093"
        alt="Miozuki fine jewellery"
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        // Mobile crop is tall and narrow: object-center slices off the right edge
        // where the earring sits. Shift the focal point right on small screens so
        // the earring stays in frame; desktop is wide enough to keep centre.
        className="object-cover object-[72%_center] md:object-center"
      />

      {/* Vignette: edges to ~40% black for text legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_transparent_38%,rgb(31_31_31/0.4)_100%)]"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Decorative rule */}
        <motion.div
          className="mb-6 flex items-center gap-3 md:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="h-px w-10 bg-cream/35" />
          <div className="h-1.5 w-1.5 rotate-45 bg-cream/45" />
          <div className="h-px w-10 bg-cream/35" />
        </motion.div>

        {/* Headline, line-by-line reveal */}
        <motion.h1
          className="mb-4 max-w-3xl font-serif text-4xl leading-tight tracking-tight text-cream sm:text-5xl md:text-7xl lg:text-8xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {LINES.map(({ text, em }) => (
            <motion.span key={text} variants={lineVariant} className="block">
              {em ? <em>{text}</em> : text}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="mb-8 max-w-sm text-sm leading-relaxed tracking-wide text-cream/75 md:mb-10 md:text-base"
          variants={fadeUp(0.65)}
          initial="hidden"
          animate="show"
        >
          Moissanite and freshwater pearl jewellery in S925 sterling silver,
          designed in Auckland
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp(0.8)} initial="hidden" animate="show">
          <Link
            href="/collections/moissanite-nz"
            className="inline-block rounded-full border border-burgundy bg-burgundy px-10 py-4 text-xs uppercase tracking-[0.04em] text-cream transition-colors duration-300 hover:border-accent-hover hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/50 focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy/80"
          >
            Discover the Collection
          </Link>
        </motion.div>

        {/* Trust microline */}
        <motion.p
          className="mt-6 text-[11px] uppercase tracking-[0.18em] text-cream/65"
          variants={fadeUp(0.95)}
          initial="hidden"
          animate="show"
        >
          Free NZ shipping over $300 &middot; Tracked delivery to NZ &amp; Australia
        </motion.p>

        {/* Decorative rule */}
        <motion.div
          className="mt-8 flex items-center gap-3 md:mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="h-px w-10 bg-cream/35" />
          <div className="h-1.5 w-1.5 rotate-45 bg-cream/45" />
          <div className="h-px w-10 bg-cream/35" />
        </motion.div>
      </div>
    </section>
  );
}
