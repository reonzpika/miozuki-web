'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
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
  return (
    <motion.div variants={item} className={className}>
      <Link href={`/collections/${collection.handle}`} className="group block">
        <div className={`relative overflow-hidden bg-cream/60 mb-4 ${imageClassName}`}>
          {collection.image ? (
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center border border-charcoal/8">
              <span className="font-serif text-lg text-charcoal/25 italic">{collection.title}</span>
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/18 transition-colors duration-500" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs tracking-[0.2em] uppercase text-cream bg-charcoal/50 px-4 py-2 backdrop-blur-sm">
              View Collection
            </span>
          </div>
        </div>
        <h3 className="font-serif text-lg text-charcoal mb-1">{collection.title}</h3>
        {collection.description && (
          <p className="text-xs text-charcoal/45 line-clamp-1 leading-relaxed">
            {collection.description}
          </p>
        )}
      </Link>
    </motion.div>
  );
}

export default function CollectionsGrid({ collections }: { collections: Collection[] }) {
  if (collections.length === 0) return null;

  const [featured, ...rest] = collections;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* Feature card — full width */}
      <CollectionCard
        collection={featured}
        imageClassName="aspect-[21/9] md:aspect-[21/8]"
      />

      {/* Remaining — 3-column grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-5">
          {rest.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
