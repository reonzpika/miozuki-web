import Image from 'next/image';
import Link from 'next/link';
import { getCollections } from '@/lib/shopify';

export const revalidate = 60;

export const metadata = {
  title: 'Collections — Miozuki',
  description: 'Browse our collections of moissanite and pearl fine jewellery.',
};

export default async function CollectionsPage() {
  let collections = await getCollections(20).catch(() => []);

  return (
    <main className="max-w-7xl mx-auto w-full px-6 md:px-10 py-16">
      {/* Heading */}
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-3">
          Collections
        </h1>
        <p className="text-sm text-charcoal/50 tracking-wide">
          Fine jewellery, curated by design
        </p>
      </div>

      {collections.length === 0 ? (
        <p className="text-center text-charcoal/40 py-24">No collections found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-cream/60 mb-4">
                {collection.image ? (
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText ?? collection.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center border border-charcoal/8">
                    <span className="font-serif text-xl text-charcoal/25 italic">
                      {collection.title}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/15 transition-colors duration-500 flex items-end justify-center pb-8">
                  <span className="text-xs tracking-[0.2em] uppercase text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Collection
                  </span>
                </div>
              </div>
              <h2 className="font-serif text-xl text-charcoal mb-1">
                {collection.title}
              </h2>
              {collection.description && (
                <p className="text-xs text-charcoal/50 line-clamp-2 leading-relaxed">
                  {collection.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
