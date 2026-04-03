import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCollections, getCollectionByHandle } from '@/lib/shopify';
import ProductsGrid from '@/components/products-grid';

export const revalidate = 60;

export async function generateStaticParams() {
  const collections = await getCollections(50).catch(() => []);
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle).catch(() => null);
  if (!collection) return { title: 'Collection — Miozuki' };
  return {
    title: `${collection.title} — Miozuki`,
    description: collection.description || undefined,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle, 48).catch(() => null);

  if (!collection) notFound();

  const products = collection.products.edges.map((e) => e.node);

  return (
    <main>
      {/* Collection hero */}
      <div className="relative w-full bg-cream overflow-hidden">
        {collection.image && (
          <div className="relative h-56 md:h-80 w-full">
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-charcoal/30" />
          </div>
        )}

        <div
          className={`${
            collection.image
              ? 'absolute inset-0 flex flex-col items-center justify-center text-cream'
              : 'py-16 flex flex-col items-center justify-center'
          }`}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs tracking-widest uppercase mb-4 opacity-70">
            <Link href="/" className="hover:opacity-100 transition-opacity">
              Home
            </Link>
            <span>/</span>
            <Link href="/collections" className="hover:opacity-100 transition-opacity">
              Collections
            </Link>
            <span>/</span>
            <span>{collection.title}</span>
          </nav>

          <h1
            className={`font-serif text-4xl md:text-5xl text-center mb-3 ${
              collection.image ? 'text-cream' : 'text-charcoal'
            }`}
          >
            {collection.title}
          </h1>

          {collection.description && (
            <p
              className={`text-sm max-w-md text-center leading-relaxed ${
                collection.image ? 'text-cream/80' : 'text-charcoal/55'
              }`}
            >
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-16">
        <ProductsGrid products={products} />
      </div>
    </main>
  );
}
