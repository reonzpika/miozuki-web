import { FLAGSHIP_COLLECTION_HANDLE } from '@/lib/collection-page';

const PEARL_HERO_HANDLES = new Set<string>([
  'pearl-earrings',
  FLAGSHIP_COLLECTION_HANDLE,
]);

/** Lifestyle banner with baroque pearl; used for pearl collection and main catalogue. */
export function usesPearlHeroArt(handle: string): boolean {
  return PEARL_HERO_HANDLES.has(handle.trim().toLowerCase());
}
