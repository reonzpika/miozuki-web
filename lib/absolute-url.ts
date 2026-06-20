import { headers } from 'next/headers';

/**
 * Absolute URL for the current request host (works on Vercel previews).
 * Falls back to production when host headers are missing.
 */
export async function getRequestAbsoluteUrl(
  pathWithLeadingSlash: string
): Promise<string> {
  const path = pathWithLeadingSlash.startsWith('/')
    ? pathWithLeadingSlash
    : `/${pathWithLeadingSlash}`;
  const h = await headers();
  const hostRaw = h.get('x-forwarded-host') ?? h.get('host');
  const host = hostRaw?.split(',')[0]?.trim();
  const protoRaw = h.get('x-forwarded-proto');
  const protoFirst = protoRaw?.split(',')[0]?.trim();
  let proto =
    protoFirst === 'http' || protoFirst === 'https' ? protoFirst : null;
  if (!proto && host) {
    proto =
      host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https';
  }
  if (host && proto) {
    return `${proto}://${host}${path}`;
  }
  return `https://www.miozuki.co.nz${path}`;
}
