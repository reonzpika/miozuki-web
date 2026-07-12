import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogArticles, getArticleByHandle, getStorefrontBlogHandle } from '@/lib/shopify';
import { cleanDescriptionHtml } from '@/lib/description-html';
import { formatNzDate } from '@/lib/format-date';

export const revalidate = 86400;

export async function generateStaticParams() {
  let articles;
  try {
    articles = await getBlogArticles(getStorefrontBlogHandle(), 50);
  } catch (err) {
    console.error('Blog generateStaticParams fetch failed', { error: err });
    return [];
  }
  return articles.map((a) => ({ handle: a.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  let article;
  try {
    article = await getArticleByHandle(getStorefrontBlogHandle(), handle);
  } catch (err) {
    console.error('Article metadata fetch failed', { handle, error: err });
    return {};
  }
  if (!article) return {};
  return {
    title: `${article.title} | Miozuki`,
    description: article.excerpt ?? undefined,
    alternates: { canonical: `/blogs/news/${handle}` },
    openGraph: article.image ? { images: [{ url: article.image.url }] } : undefined,
  };
}

const TAG_LABELS: Record<string, string> = {
  'affordable-engagement-ring': 'Affordable Engagement Ring',
  'bridal-jewellery-nz': 'Bridal Jewellery NZ',
  'halo-ring': 'Halo Ring',
  'moissanite': 'Moissanite',
  'moissanite-diamond': 'Moissanite Diamond',
  'moissanite-earrings': 'Moissanite Earrings',
  'moissanite-engagement-ring': 'Moissanite Engagement Ring',
  'moissanite-nz': 'Moissanite NZ',
  'moissanite-ring-engagement': 'Moissanite Ring Engagement',
  'moissanite-ring-nz': 'Moissanite Ring NZ',
  'moissanite-rings-nz': 'Moissanite Rings NZ',
  'moissanite-studs': 'Moissanite Studs',
  'moissanite-vs-diamond': 'Moissanite vs Diamond',
  'pearl-earrings-nz': 'Pearl Earrings NZ',
  'pearl-earrings-silver': 'Pearl Earrings Silver',
  'pearl-studs': 'Pearl Studs',
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let article;
  try {
    article = await getArticleByHandle(getStorefrontBlogHandle(), handle);
  } catch (err) {
    console.error('Article fetch failed', { handle, error: err });
    throw err;
  }
  if (!article) notFound();

  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/blogs/news" className="hover:text-charcoal transition-colors">
          Journal
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px]">{article.title}</span>
      </nav>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span key={tag} className="text-[10px] tracking-widest uppercase text-burgundy">
              {TAG_LABELS[tag] ?? tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        {article.title}
      </h1>

      {/* Meta */}
      <p className="text-[10px] tracking-widest uppercase text-charcoal/35 mb-10">
        {formatNzDate(article.publishedAt)}
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      {/* Featured image */}
      {article.image && (
        <div className="relative aspect-[16/9] overflow-hidden mb-10">
          <Image
            src={article.image.url}
            alt={article.image.altText ?? article.title}
            fill
            sizes="(min-width: 768px) 672px, 100vw"
            className="object-cover"
            priority
            fetchPriority="high"
          />
        </div>
      )}

      {/* Article body */}
      <div
        className="article-prose"
        dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(article.contentHtml) }}
      />

      {/* Back link */}
      <div className="mt-14 pt-8 border-t border-charcoal/8">
        <Link
          href="/blogs/news"
          className="text-xs tracking-widest uppercase text-charcoal/45 hover:text-charcoal transition-colors"
        >
          ← Back to Journal
        </Link>
      </div>
    </main>
  );
}
