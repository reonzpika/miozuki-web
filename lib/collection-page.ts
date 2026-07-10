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

export type CollectionEducationTheme = 'moissanite' | 'pearl' | 'bridal';

export interface CollectionEducationPanel {
  theme: CollectionEducationTheme;
  /** The most specific relevant guide for this collection; falls back to the pillar. */
  guideHref: string;
  guideLabel: string;
}

const MOISSANITE_PILLAR: CollectionEducationPanel = {
  theme: 'moissanite',
  guideHref: '/moissanite-guide',
  guideLabel: 'Learn more about moissanite',
};

const PEARL_PILLAR: CollectionEducationPanel = {
  theme: 'pearl',
  guideHref: '/pearl-guide',
  guideLabel: 'Read the pearl guide',
};

/**
 * Which gemstone education panels to show above the founder strip on collection PLPs,
 * each deep-linked to the guide most relevant to that exact collection rather than
 * always the pillar.
 */
export function getCollectionEducationPanels(handle: string): CollectionEducationPanel[] {
  switch (handle) {
    case 'pearl-earrings':
      return [
        {
          theme: 'pearl',
          guideHref: '/pearl-guide/pearl-earrings-nz',
          guideLabel: 'Read the pearl earrings guide',
        },
      ];
    case 'bridal-jewellery':
      return [
        {
          theme: 'bridal',
          guideHref: '/bridal-guide',
          guideLabel: 'Read the bridal jewellery guide',
        },
      ];
    case 'moissanite-rings':
      return [
        {
          theme: 'moissanite',
          guideHref: '/moissanite-guide/how-to-choose-a-moissanite-ring',
          guideLabel: 'How to choose a moissanite ring',
        },
      ];
    case 'moissanite-earrings':
      return [
        {
          theme: 'moissanite',
          guideHref: '/moissanite-guide/moissanite-earrings-nz',
          guideLabel: 'Read the moissanite earrings guide',
        },
      ];
    case FLAGSHIP_COLLECTION_HANDLE:
      return [MOISSANITE_PILLAR, PEARL_PILLAR];
    default:
      return [MOISSANITE_PILLAR];
  }
}
