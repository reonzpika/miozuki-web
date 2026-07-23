import { createHash } from 'node:crypto';

// Normalization + hashing rules per Google's Data Manager API "Format user
// data" guide (developers.google.com/data-manager/api/devguides/concepts/formatting,
// confirmed 23 Jul 2026): lowercase, trim all whitespace, Gmail/Googlemail-only
// dot/plus stripping, then SHA-256. Output is hex to match the request's
// `encoding: "HEX"` field (lib/admin/google-ads-data-manager.ts) — if that ever
// changes to base64, this must change with it, they are not interchangeable.

const GMAIL_DOMAINS = ['gmail.com', 'googlemail.com'];

function normalizeEmail(email: string): string {
  const trimmedLower = email.toLowerCase().replace(/\s+/g, '');
  const atIndex = trimmedLower.lastIndexOf('@');
  if (atIndex === -1) return trimmedLower;

  const domain = trimmedLower.slice(atIndex + 1);
  if (!GMAIL_DOMAINS.includes(domain)) return trimmedLower;

  let local = trimmedLower.slice(0, atIndex);
  local = local.replace(/\./g, '');
  const plusIndex = local.indexOf('+');
  if (plusIndex !== -1) local = local.slice(0, plusIndex);

  return `${local}@${domain}`;
}

/** Google's Data Manager `userData.userIdentifiers[].emailAddress` value: normalized then SHA-256 hex digest. */
export function hashEmailForDataManager(email: string): string {
  return createHash('sha256').update(normalizeEmail(email), 'utf8').digest('hex');
}
