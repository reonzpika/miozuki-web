import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCollections, getCollectionByHandle } from '@/lib/shopify';
import { richTextToPlain } from '@/components/rich-text';
import ProductsGrid from '@/components/products-grid';
import CollectionUspBar from '@/components/collection-usp-bar';
import InstagramFeed from '@/components/instagram-feed';

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
      {/* Collection hero — stacked on mobile, split panel on desktop */}
      <div className="border-b border-charcoal/8 md:grid md:grid-cols-2 md:min-h-[400px]">

        {/* Text — left on desktop, below image on mobile */}
        <div className="bg-cream flex flex-col justify-center px-6 md:px-14 py-10 md:py-16 order-2 md:order-1">
          <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-5">
            <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-charcoal transition-colors">Collections</Link>
            <span>/</span>
            <span>{collection.title}</span>
          </nav>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight mb-4">
            {collection.title}
          </h1>

          {(collection.metafield?.value || collection.description) && (
            <p className="text-sm text-charcoal/60 leading-relaxed max-w-sm">
              {collection.metafield?.value
                ? richTextToPlain(collection.metafield.value)
                : collection.description}
            </p>
          )}
        </div>

        {/* Image — full width on mobile, right half on desktop */}
        {collection.image ? (
          <div className="relative h-[220px] md:h-auto order-1 md:order-2 overflow-hidden">
            <Image
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        ) : (
          <div className="hidden md:block order-2 bg-charcoal/4" />
        )}

      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-16">
        <ProductsGrid products={products} />
      </div>

      {/* USP bar */}
      <CollectionUspBar />

      {/* Collection description (long SEO body) */}
      {collection.descriptionHtml && (
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-16">
          <div
            className="text-sm text-charcoal/70 leading-relaxed
              [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:text-charcoal [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:first:mt-0
              [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-charcoal [&_h2]:mb-4 [&_h2]:mt-8
              [&_h3]:font-medium [&_h3]:text-charcoal [&_h3]:mb-3 [&_h3]:mt-6
              [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1
              [&_strong]:font-medium [&_strong]:text-charcoal
              [&_a]:text-burgundy [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-burgundy/70
              [&_table]:w-full [&_table]:border-collapse [&_table]:mb-6
              [&_th]:text-left [&_th]:text-xs [&_th]:tracking-widest [&_th]:uppercase [&_th]:text-charcoal [&_th]:border-b [&_th]:border-charcoal/15 [&_th]:py-2 [&_th]:pr-4
              [&_td]:border-b [&_td]:border-charcoal/8 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top
              [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6"
            dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }}
          />
        </div>
      )}

      {/* Instagram feed */}
      <InstagramFeed />
    </main>
  );
}
