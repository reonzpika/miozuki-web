import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogArticles } from '@/lib/shopify';
import BlogTagFilter from '@/components/blog-tag-filter';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Journal | Miozuki',
  description:
    'Moissanite and pearl jewellery guides, styling tips, and stories from Auckland, New Zealand.',
  alternates: { canonical: '/blogs/news' },
};

export default async function BlogListingPage() {
  const articles = await getBlogArticles();

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-10 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span>/</span>
        <span>Journal</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-3">
        Journal
      </h1>
      <p className="text-sm text-charcoal/55 mb-10 max-w-2xl">
        Moissanite guides, styling tips, and jewellery stories from Auckland. Posts appear here
        when they are published to the online store blog. Topic tags are optional; they only help
        visitors filter the list below.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      {articles.length > 0 ? (
        <BlogTagFilter articles={articles} />
      ) : (
        <p className="py-12 text-center text-sm leading-relaxed text-charcoal/45 max-w-lg mx-auto">
          There are no published stories to show at the moment. New journal posts will appear here
          once they go live on the store.
        </p>
      )}
    </main>
  );
}
