import type { ShopifyVideoSource } from './shopify/types';

/** Pure, client-safe (no server deps): used by the PDP video components. */

function isMp4(s: ShopifyVideoSource): boolean {
  return /mp4/i.test(s.mimeType) || /\.mp4(\?|$)/i.test(s.url);
}

/**
 * Order video sources for high-quality, consistent progressive playback.
 *
 * Shopify lists an HLS .m3u8 first. HLS makes the player fetch a manifest chain
 * before any frame (slow start) and start at the lowest rung before ramping up
 * (a blurry first 1-2s). For short product loops a single progressive MP4 is
 * better: one request, instant and consistent quality. We lead with the highest
 * available MP4 (1080p when present) so the clip is sharp from the first frame,
 * with the lower MP4s as fallbacks; the HLS source is dropped because every
 * target browser plays MP4. If no MP4 exists we return the input unchanged so
 * playback still works.
 */
export function selectVideoSources(
  sources: ShopifyVideoSource[],
): ShopifyVideoSource[] {
  const mp4s = sources.filter(isMp4);
  if (mp4s.length === 0) return sources;
  // Highest resolution first (1080p when present), then the rest as fallbacks.
  return [...mp4s].sort((a, b) => (b.height || 0) - (a.height || 0));
}
