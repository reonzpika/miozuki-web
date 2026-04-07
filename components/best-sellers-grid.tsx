'use client';

import { motion } from 'framer-motion';
import ProductCard from '@/components/product-card';
import type { Product } from '@/lib/shopify';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function BestSellersGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <>
      {/* Mobile: horizontal scroll rail */}
      <motion.div
        className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-6 px-6 scrollbar-hide"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={item}
            className="min-w-[68vw] max-w-[68vw] snap-start flex-shrink-0"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      {/* Desktop: 4-column grid */}
      <motion.div
        className="hidden md:grid grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={item}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
