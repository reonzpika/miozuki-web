import Link from 'next/link';
import JsonLd from '@/components/json-ld';

const BASE = 'https://www.miozuki.co.nz';

const HUBS: Record<string, string> = {
  'moissanite-guide': 'Moissanite guide',
  'pearl-guide': 'Pearl guide',
  'bridal-guide': 'Bridal guide',
};

/**
 * Per-guide E-E-A-T furniture: a visible byline + updated date under the H1,
 * plus Article and BreadcrumbList JSON-LD. Each page.mdx renders this once,
 * directly after its H1, with its own title/path/updated. Keep `updated`
 * truthful: bump it whenever the article's content materially changes.
 */
export function GuideSchema({
  title,
  path,
  updated,
}: {
  title: string;
  path: string;
  updated: string;
}) {
  const hubSlug = path.split('/').filter(Boolean)[0];
  const hubLabel = HUBS[hubSlug] ?? 'Guide';
  const isPillar = path.split('/').filter(Boolean).length === 1;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    dateModified: updated,
    author: {
      '@type': 'Person',
      name: 'Ting Eguchi',
      url: `${BASE}/pages/our-founder`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Miozuki',
      url: BASE,
    },
    mainEntityOfPage: `${BASE}${path}`,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      {
        '@type': 'ListItem',
        position: 2,
        name: hubLabel,
        item: `${BASE}/${hubSlug}`,
      },
      ...(isPillar
        ? []
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: title,
              item: `${BASE}${path}`,
            },
          ]),
    ],
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-2 text-[13px] text-charcoal/65">
      <span>
        By{' '}
        <Link
          href="/pages/our-founder"
          className="text-charcoal/80 underline underline-offset-2 transition-colors hover:text-burgundy"
        >
          Ting Eguchi
        </Link>
        , founder of Miozuki
      </span>
      <span className="text-charcoal/30" aria-hidden>
        ·
      </span>
      <span>
        Updated{' '}
        {new Date(`${updated}T00:00:00`).toLocaleDateString('en-NZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </span>
      <JsonLd data={article} />
      <JsonLd data={breadcrumb} />
    </div>
  );
}
