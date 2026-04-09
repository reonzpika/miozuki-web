'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/product-card';
import type { Product } from '@/lib/shopify';
import type { RatingSummary } from '@/lib/judgeme/types';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function BestSellersGrid({
  products,
  ratings = {},
}: {
  products: Product[];
  ratings?: Record<string, RatingSummary>;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    railRef.current?.scrollBy({ left: dir === 'right' ? 380 : -380, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <motion.div
        ref={railRef}
        className="rail-bleed flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-3 scrollbar-hide"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={item}
            className="min-w-[68vw] sm:min-w-[42vw] md:min-w-[17rem] md:max-w-[17rem] snap-start flex-shrink-0"
          >
            <ProductCard
              product={product}
              rating={ratings[product.id.split('/').pop() ?? '']}
            />
          </motion.div>
        ))}
      </motion.div>

      <button
        type="button"
        aria-label="Scroll to previous best sellers"
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-4 top-[45%] -translate-y-1/2 h-10 w-10 rounded-full bg-burgundy text-cream items-center justify-center shadow-lg hover:bg-burgundy/85 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Scroll to more best sellers"
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-4 top-[45%] -translate-y-1/2 h-10 w-10 rounded-full bg-burgundy text-cream items-center justify-center shadow-lg hover:bg-burgundy/85 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
