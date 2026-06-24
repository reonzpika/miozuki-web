// Shared helpers for the admin Recharts components (brand colours, tooltip
// style, number + date formatting). Pure module, imported by the 'use client'
// chart components.
import type { CSSProperties } from 'react';

export const chartNum = new Intl.NumberFormat('en-NZ');

export const BRAND = {
  burgundy: '#7B1E22',
  gold: '#c8a46a',
  graphite: '#4b4b4b',
  champagne: '#f2e1c2',
  blush: '#fbeae7',
} as const;

// Slice colours, brand-led, for donuts.
export const DONUT_PALETTE = [BRAND.burgundy, BRAND.gold, BRAND.graphite, BRAND.champagne, BRAND.blush];

// Recharts <Tooltip> contentStyle, on-brand (soft white card, charcoal text).
export const TOOLTIP_STYLE: CSSProperties = {
  background: '#fffcf8',
  border: '1px solid rgba(31,31,31,0.12)',
  borderRadius: 8,
  fontSize: 13,
  color: '#1f1f1f',
};

export const AXIS_TICK = { fontSize: 12, fill: BRAND.graphite } as const;

// Accepts GA4 'YYYYMMDD' and ISO 'YYYY-MM-DD' dates; returns e.g. "24 Jun".
export function fmtChartDate(d: string): string {
  const iso = /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d;
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime())
    ? d
    : dt.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
}
