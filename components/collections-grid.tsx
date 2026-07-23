'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useHoverCapable } from '@/hooks/use-hover-capable';

interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  image: { url: string; altText: string | null } | null;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function CollectionCard({
  collection,
  className = '',
  imageClassName = 'aspect-[4/5]',
}: {
  collection: Collection;
  className?: string;
  imageClassName?: string;
}) {
  const hoverCapable = useHoverCapable();
  return (
    <motion.div variants={item} className={className}>
      <Link href={`/collections/${collection.handle}`} className="group block">
        <div className={`relative overflow-hidden bg-cream/60 mb-4 ${imageClassName}`}>
          {collection.image ? (
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-transform duration-700 ease-out${hoverCapable ? ' group-hover:scale-105' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center border border-charcoal/8">
              <span className="font-serif text-lg text-charcoal/25 italic">{collection.title}</span>
            </div>
          )}
          {hoverCapable ? (
            <>
              <div className="pointer-events-none absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/18" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="bg-charcoal/50 px-4 py-2 text-xs tracking-[0.2em] uppercase text-cream backdrop-blur-sm">
                  View Collection
                </span>
              </div>
            </>
          ) : null}
        </div>
        <h3 className="font-serif text-lg text-charcoal mb-1">{collection.title}</h3>
        {collection.description && (
          <p className="text-xs text-charcoal/65 line-clamp-1 leading-relaxed">
            {collection.description}
          </p>
        )}
      </Link>
    </motion.div>
  );
}

export default function CollectionsGrid({ collections }: { collections: Collection[] }) {
  const reduceMotion = useReducedMotion();

  if (collections.length === 0) return null;

  if (reduceMotion) {
    return (
      <motion.div
        variants={container}
        initial="show"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-5"
      >
        {collections.map((c) => (
          <CollectionCard key={c.id} collection={c} />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-5"
    >
      {collections.map((c) => (
        <CollectionCard key={c.id} collection={c} />
      ))}
    </motion.div>
  );
}
