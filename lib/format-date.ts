/**
 * Format an ISO timestamp as a New Zealand date, pinned to Pacific/Auckland.
 *
 * Pinning the timeZone is essential. `toLocaleDateString` without it uses the
 * runtime's own zone, so the UTC server and an NZ browser format a near-midnight
 * date differently. In a client component that text mismatch is a React
 * hydration error (#418, the blog listing bug); in a server component it just
 * renders the wrong day. Render all store-facing dates through this helper.
 */
export function formatNzDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Pacific/Auckland',
  });
}
