/**
 * Build a meta description: prefer the hand-written Shopify SEO description
 * (Search engine listing in Shopify admin), else fall back to the body copy
 * truncated at a word boundary. Search engines cut snippets around 160
 * characters, so an untruncated multi-paragraph body wastes the snippet.
 */
const MAX_LENGTH = 160;

export function metaDescription(
  seoDescription: string | null | undefined,
  fallback: string | null | undefined
): string | undefined {
  const seo = seoDescription?.trim();
  if (seo) return seo;

  const body = fallback?.replace(/\s+/g, ' ').trim();
  if (!body) return undefined;
  if (body.length <= MAX_LENGTH) return body;

  const cut = body.slice(0, MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length)}…`;
}
