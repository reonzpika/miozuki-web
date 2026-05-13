function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normaliseWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Shopify descriptions sometimes include a promo blockquote; omit it here (details live under What's included, etc.). */
function stripBlockquotesFromHtml(html: string): string {
  let prev = '';
  let out = html;
  while (out !== prev) {
    prev = out;
    out = out.replace(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote>/gi, '');
  }
  return out;
}

export function ProductDescriptionDisclosure({
  descriptionHtml,
  plainDescription,
}: {
  descriptionHtml: string | null;
  plainDescription: string | null;
}) {
  const htmlRaw = descriptionHtml?.trim() || null;
  const withoutQuotes = htmlRaw ? stripBlockquotesFromHtml(htmlRaw).trim() : '';
  const html = withoutQuotes.length > 0 ? withoutQuotes : null;
  const fullPlain = htmlRaw
    ? normaliseWhitespace(stripHtml(withoutQuotes))
    : normaliseWhitespace(plainDescription ?? '');

  if (!html && !fullPlain) return null;

  const proseClass =
    'article-prose max-w-none text-sm leading-relaxed text-charcoal/70';

  return (
    <div className="mb-4 max-w-prose">
      <p className="mb-3 text-sm font-medium leading-relaxed text-charcoal">
        <span aria-hidden="true" className="text-burgundy">
          ◆{' '}
        </span>
        S925 sterling silver with white gold finish
      </p>
      {html ? (
        <div className={proseClass} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="text-sm leading-relaxed text-charcoal/70">{fullPlain}</p>
      )}
    </div>
  );
}
