import type { Product } from '@/lib/shopify';

export type CatalogueQuickFilterId =
  | 'rings'
  | 'earrings'
  | 'necklace'
  | 'best-sellers'
  | 'under-300';

/** Row shown on the flagship catalogue; labels match storefront language. */
export const CATALOGUE_QUICK_FILTERS: { id: CatalogueQuickFilterId; label: string }[] = [
  { id: 'rings', label: 'Rings' },
  { id: 'earrings', label: 'Earrings' },
  { id: 'necklace', label: 'Necklaces' },
  { id: 'best-sellers', label: 'Best sellers' },
  { id: 'under-300', label: 'Under $300' },
];

function searchBlobLc(product: Product): string {
  return `${product.productType ?? ''}\n${product.title}\n${product.tags.join(' ')}`.toLowerCase();
}

/** Shopify tags that mark a product as a best seller (sort / catalogue chip). */
export function productHasBestSellerTag(product: Product): boolean {
  return product.tags.some((t) =>
    /^(best\s*sellers?|bestsellers?)$/i.test(t.trim()),
  );
}

export function productMatchesCatalogueQuickFilter(
  product: Product,
  id: CatalogueQuickFilterId,
): boolean {
  const blob = searchBlobLc(product);
  const minPrice = parseFloat(product.priceRange.minVariantPrice.amount);

  switch (id) {
    case 'rings': {
      if (blob.includes('earring')) return false;
      return /\bring(s)?\b/.test(blob);
    }

    case 'earrings':
      return blob.includes('earring');

    case 'necklace':
      return /\bnecklace(s)?\b/.test(blob) || /\bpendant(s)?\b/.test(blob);

    case 'best-sellers':
      return productHasBestSellerTag(product);

    case 'under-300':
      return minPrice > 0 && minPrice < 300;

    default: {
      const _x: never = id;
      return _x;
    }
  }
}

export function pickDefaultCatalogueQuickFilter(products: Product[]): CatalogueQuickFilterId {
  const prefers: CatalogueQuickFilterId[] = [
    'rings',
    'earrings',
    'necklace',
    'best-sellers',
    'under-300',
  ];
  for (const id of prefers) {
    if (products.some((p) => productMatchesCatalogueQuickFilter(p, id))) return id;
  }
  return 'rings';
}
