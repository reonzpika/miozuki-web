/** Collection handles that sell finger rings and should surface sizing help in the hero. */
export const RING_COLLECTION_HANDLES = new Set<string>([
  'moissanite-rings',
  'bridal-jewellery',
]);

/** Primary cold-traffic catalogue; full browse chips (Rings / Earrings / …) only on this PLP. */
export const FLAGSHIP_COLLECTION_HANDLE = 'all-moissanite-pearl-nz' as const;

export function isRingCollection(handle: string): boolean {
  return RING_COLLECTION_HANDLES.has(handle);
}

export function isFlagshipCollection(handle: string): boolean {
  return handle === FLAGSHIP_COLLECTION_HANDLE;
}

export type CollectionEducationTheme = 'moissanite' | 'pearl';

/** Which gemstone education panels to show above the founder strip on collection PLPs. */
export function getCollectionEducationThemes(handle: string): CollectionEducationTheme[] {
  if (handle === 'pearl-earrings') {
    return ['pearl'];
  }
  if (handle === FLAGSHIP_COLLECTION_HANDLE) {
    return ['moissanite', 'pearl'];
  }
  return ['moissanite'];
}
