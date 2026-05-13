import fs from 'node:fs';
import path from 'node:path';

const PNG_SEGMENT = '/generated/collection-pearl-hero-photo.png';

/**
 * Prefer the original PNG portrait in public/generated when checked in;
 * otherwise the legacy generated web banner.
 */
export function resolvePearlBannerImageSrc(): string {
  const abs = path.join(process.cwd(), 'public', 'generated', 'collection-pearl-hero-photo.png');
  try {
    if (fs.existsSync(abs)) return PNG_SEGMENT;
  } catch {
    // Non-Node contexts: fall through
  }
  return '/generated/collection-pearl-hero-banner.webp';
}
