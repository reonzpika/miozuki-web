'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/shopify/types';

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BlogTagFilter({ articles }: { articles: Article[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags))).sort();
  const filtered = activeTag ? articles.filter((a) => a.tags.includes(activeTag)) : articles;

  return (
    <>
      {/* Tag filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveTag(null)}
          className={`text-xs tracking-wide px-3 py-1.5 border transition-colors ${
            !activeTag
              ? 'border-charcoal bg-charcoal text-cream'
              : 'border-charcoal/20 text-charcoal/55 hover:border-charcoal/40'
          }`}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`text-xs tracking-wide px-3 py-1.5 border transition-colors ${
              activeTag === tag
                ? 'border-burgundy bg-burgundy text-cream'
                : 'border-charcoal/20 text-charcoal/55 hover:border-charcoal/40'
            }`}
          >
            {TAG_LABELS[tag] ?? tag}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((article, i) => (
          <Link
            key={article.handle}
            href={`/blogs/news/${article.handle}`}
            className="group flex flex-col"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-charcoal/5 mb-4">
              {article.image ? (
                <Image
                  src={article.image.url}
                  alt={article.image.altText ?? article.title}
                  fill
                  priority={i < 3}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-charcoal/5" />
              )}
            </div>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {article.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] tracking-widest uppercase text-burgundy">
                    {TAG_LABELS[tag] ?? tag}
                  </span>
                ))}
              </div>
            )}
            <h2 className="font-serif text-lg text-charcoal leading-snug mb-2 group-hover:text-burgundy transition-colors">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-xs text-charcoal/55 leading-relaxed line-clamp-3 mb-3">
                {article.excerpt}
              </p>
            )}
            <p className="text-[10px] tracking-widest uppercase text-charcoal/35 mt-auto">
              {formatDate(article.publishedAt)}
            </p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-charcoal/45 py-12 text-center">No articles for this tag.</p>
      )}
    </>
  );
}
