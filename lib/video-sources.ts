import type { ShopifyVideoSource } from './shopify/types';

/** Pure, client-safe (no server deps): used by the PDP video components. */

function isMp4(s: ShopifyVideoSource): boolean {
  return /mp4/i.test(s.mimeType) || /\.mp4(\?|$)/i.test(s.url);
}

/**
 * Order video sources for fast, consistent-quality progressive playback.
 *
 * Shopify lists an HLS .m3u8 first. HLS makes the player fetch a manifest chain
 * before any frame (slow start) and start at the lowest rung before ramping up
 * (a blurry first 1-2s). For short product loops a single progressive MP4 is
 * better: one request, instant and consistent quality. We lead with the ~720p
 * MP4 (good quality, small file) and keep the other MP4s as fallbacks; the HLS
 * source is dropped because every target browser plays MP4. If no MP4 exists we
 * return the input unchanged so playback still works.
 */
export function selectVideoSources(
  sources: ShopifyVideoSource[],
): ShopifyVideoSource[] {
  const mp4s = sources.filter(isMp4);
  if (mp4s.length === 0) return sources;
  const byHeightAsc = [...mp4s].sort((a, b) => (a.height || 0) - (b.height || 0));
  // Smallest rendition that is at least 720p; if none reach 720p, the largest.
  const primary =
    byHeightAsc.find((s) => (s.height || 0) >= 720) ??
    byHeightAsc[byHeightAsc.length - 1];
  return [primary, ...mp4s.filter((s) => s !== primary)];
}
