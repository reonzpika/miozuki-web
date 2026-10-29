export type ProductRingSizeChart = {
  material: string | string[];
  sizes: Record<string, { diametreMm: number; approxNz: string; materials?: string[]; estimatedDiametre?: boolean }>;
};

/** Product facts stay in Shopify; malformed or missing charts use the normal picker. */
export function readProductRingSizeChart(raw?: string | null): ProductRingSizeChart | null {
  if (!raw) return null;
  try {
    const chart = JSON.parse(raw) as Partial<ProductRingSizeChart> | null;
    const materials = chart && (Array.isArray(chart.material) ? chart.material : [chart.material]);
    if (!chart || !materials?.length || !materials.every((material) => typeof material === 'string' && material.trim())
      || !chart.sizes || typeof chart.sizes !== 'object' || Array.isArray(chart.sizes)) return null;
    const entries = Object.entries(chart.sizes);
    if (!entries.length || !entries.every(([size, row]) => /^\d+(?:\.\d{1,2})?$/.test(size)
      && row && typeof row === 'object' && Number.isFinite(row.diametreMm) && row.diametreMm > 0
      && typeof row.approxNz === 'string' && row.approxNz.trim()
      && (row.materials === undefined || (Array.isArray(row.materials) && row.materials.length > 0
        && row.materials.every((material) => typeof material === 'string' && material.trim())))
      && (row.estimatedDiametre === undefined || typeof row.estimatedDiametre === 'boolean'))) return null;
    return chart as ProductRingSizeChart;
  } catch {
    return null;
  }
}

export function isProductRingSizeAllowed(chart: ProductRingSizeChart, size: string, material: string): boolean {
  const row = chart.sizes[size];
  return Boolean(row && (!row.materials || row.materials.includes(material)));
}
