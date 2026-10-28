export type ProductRingSizeChart = {
  material: string;
  sizes: Record<string, { diametreMm: number; approxNz: string }>;
};

/** Product facts stay in Shopify; malformed or missing charts use the normal picker. */
export function readProductRingSizeChart(raw?: string | null): ProductRingSizeChart | null {
  if (!raw) return null;
  try {
    const chart = JSON.parse(raw) as Partial<ProductRingSizeChart> | null;
    if (!chart || typeof chart.material !== 'string' || !chart.material.trim()
      || !chart.sizes || typeof chart.sizes !== 'object' || Array.isArray(chart.sizes)) return null;
    const entries = Object.entries(chart.sizes);
    if (!entries.length || !entries.every(([size, row]) => /^\d+(?:\.\d{1,2})?$/.test(size)
      && row && typeof row === 'object' && Number.isFinite(row.diametreMm) && row.diametreMm > 0
      && typeof row.approxNz === 'string' && row.approxNz.trim())) return null;
    return chart as ProductRingSizeChart;
  } catch {
    return null;
  }
}
