/** PDP: treat as earrings when Shopify type/tags mention earring (covers pearl + moissanite ear lines). */
export function isEarringProduct(
  productType: string | null | undefined,
  tags: readonly string[],
): boolean {
  const type = (productType ?? '').toLowerCase();
  if (type.includes('earring')) return true;
  return tags.some((tag) => tag.toLowerCase().includes('earring'));
}
