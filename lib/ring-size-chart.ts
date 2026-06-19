/**
 * US ring size → inner diameter (mm).
 * Values follow the conventional US circumference-based conversion used on Miozuki’s
 * ring size chart asset (Shopify: Ring_Sizer_Chart_-_Miozuki_Cropped.jpg).
 * Unknown Shopify labels fall back to the raw size string in the picker.
 */

const US_RING_INNER_DIAMETER_MM: Record<string, number> = {
  '5': 15.7,
  '5.5': 16.1,
  '6': 16.51,
  '6.5': 16.92,
  '7': 17.35,
  '7.5': 17.75,
  '8': 18.19,
  '8.5': 18.53,
  '9': 18.89,
  '9.5': 19.41,
  '10': 19.84,
  '10.5': 20.26,
};

function normalizeSizeKey(raw: string): string {
  return raw.trim().replace(',', '.').replace(/^us\s+/i, '');
}

/** Inner diameter in mm, or undefined if unknown (non-US label, etc.). */
export function ringInnerDiameterMm(sizeLabel: string): number | undefined {
  const key = normalizeSizeKey(sizeLabel);
  return US_RING_INNER_DIAMETER_MM[key];
}

function formatDiameterMm(mm: number): string {
  return Number(mm.toFixed(2)).toString();
}

/** Human phrase for picker detail column, or null when size is unknown in the chart. */
export function ringInnerDiametrePhrase(sizeLabel: string): string | null {
  const mm = ringInnerDiameterMm(sizeLabel);
  if (mm === undefined) return null;
  return `inner diameter ${formatDiameterMm(mm)} mm`;
}

/**
 * Single-line label (fallback for plain selects).
 */
export function formatRingSizeWithInnerDiameter(sizeLabel: string): string {
  const phrase = ringInnerDiametrePhrase(sizeLabel);
  if (!phrase) return sizeLabel;
  return `${sizeLabel} (${phrase})`;
}
