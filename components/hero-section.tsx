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
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center overflow-hidden">
      {/* Background */}
      <Image
        src="https://miozuki.co.nz/cdn/shop/files/hero-image.webp?v=1773198093"
        alt="Miozuki fine jewellery"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-charcoal/42" />

      {/* Content */}
      <div className="relative z-10 px-6 flex flex-col items-center">
        {/* Decorative rule */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="h-px w-10 bg-cream/35" />
          <div className="w-1.5 h-1.5 bg-cream/45 rotate-45" />
          <div className="h-px w-10 bg-cream/35" />
        </motion.div>

        {/* Headline — line-by-line reveal */}
        <motion.h1
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream leading-tight tracking-tight mb-4 max-w-3xl"
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
          className="text-sm md:text-base text-cream/75 tracking-wide max-w-sm mb-10 leading-relaxed"
          variants={fadeUp(0.65)}
          initial="hidden"
          animate="show"
        >
          Moissanite &amp; Pearl Fine Jewellery, designed in New Zealand
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp(0.8)} initial="hidden" animate="show">
          <Link
            href="/collections/all-moissanite-pearl-nz"
            className="inline-block bg-cream text-charcoal text-xs tracking-[0.2em] uppercase px-10 py-4 hover:bg-cream/90 transition-colors duration-300"
          >
            Discover the Collection
          </Link>
        </motion.div>

        {/* Decorative rule */}
        <motion.div
          className="flex items-center gap-3 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="h-px w-10 bg-cream/35" />
          <div className="w-1.5 h-1.5 bg-cream/45 rotate-45" />
          <div className="h-px w-10 bg-cream/35" />
        </motion.div>
      </div>
    </section>
  );
}
