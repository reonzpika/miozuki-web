import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogArticles } from '@/lib/shopify';
import BlogTagFilter from '@/components/blog-tag-filter';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Journal | Miozuki',
  description:
    'Moissanite and pearl jewellery guides, styling tips, and stories from Auckland, New Zealand.',
};

export default async function BlogListingPage() {
  const articles = await getBlogArticles('news', 50);

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
      <p className="text-sm text-charcoal/55 mb-10">
        Moissanite guides, styling tips, and jewellery stories from Auckland.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <BlogTagFilter articles={articles} />
    </main>
  );
}
