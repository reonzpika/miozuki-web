'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ringInnerDiameterMm, ringInnerDiametrePhrase } from '@/lib/ring-size-chart';

function sizingLabel(value: string, chartDiametre?: number, approxNz?: string) {
  const key = value.trim().replace(/^us\s*/i, '').replace(',', '.');
  if (chartDiametre !== undefined) {
    return {
      primary: key,
      detail: `inner diametre ${chartDiametre.toFixed(1)} mm${approxNz ? ` · approx. NZ ${approxNz}` : ''}`,
    };
  }
  let detail = ringInnerDiametrePhrase(value);
  // Quarter sizes sit halfway between the neighbouring entries in Miozuki's
  // existing chart. These are interpolated references, not measured dimensions.
  if (!detail && /^\d+\.(25|75)$/.test(key)) {
    const size = Number(key);
    const lower = ringInnerDiameterMm(String(size - 0.25));
    const upper = ringInnerDiameterMm(String(size + 0.25));
    if (lower !== undefined && upper !== undefined) {
      const mm = Number(((lower + upper) / 2).toFixed(2));
      detail = `inner diametre ${mm} mm`;
    }
  }
  return {
    primary: key,
    detail,
  };
}

type Props = {
  id: string;
  labelId: string;
  values: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  availabilityForValue: (value: string) => boolean;
  /** Design-specific diameter from an explicitly supplied sizing chart. */
  diametreForValue?: (value: string) => number | undefined;
  approxNzForValue?: (value: string) => string | undefined;
  estimatedDiametreForValue?: (value: string) => boolean;
  /** Highlights the field after add-to-cart without a selection. */
  showRequired?: boolean;
};

export default function ProductRingSizeSelect({
  id,
  labelId,
  values,
  selectedValue,
  onChange,
  availabilityForValue,
  diametreForValue,
  approxNzForValue,
  estimatedDiametreForValue,
  showRequired = false,
}: Props) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = containerRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectedLabel = sizingLabel(selectedValue, diametreForValue?.(selectedValue), approxNzForValue?.(selectedValue));
  const phrase = selectedValue ? selectedLabel.detail : null;
  const useColumns = Boolean(diametreForValue && approxNzForValue);
  const columnLayout = 'grid grid-cols-[3.25rem_minmax(0,1fr)_4.5rem] items-center gap-2';
  const diameterLabel = (value: string) => {
    const mm = diametreForValue?.(value);
    if (mm === undefined) return '';
    return estimatedDiametreForValue?.(value) ? `~${mm.toFixed(2).replace(/0$/, '')}` : mm.toFixed(1);
  };

  const triggerClasses =
    'flex w-full min-h-[3.125rem] cursor-pointer items-center border bg-cream px-3.5 py-2.5 pr-11 text-left text-xs leading-normal text-charcoal transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

  const borderClass = showRequired
    ? 'border-burgundy focus:border-burgundy'
    : open
      ? 'border-charcoal/50 focus:border-charcoal/50'
      : 'border-charcoal/20 focus:border-charcoal/50';

  return (
    <div ref={containerRef} className="relative max-w-md">
      <button
        type="button"
        id={id}
        className={`${triggerClasses} ${borderClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={useColumns && selectedValue ? `${columnLayout} min-w-0 flex-1` : 'flex min-w-0 flex-1 items-baseline justify-between gap-4'}>
          {selectedValue && useColumns ? (
            <>
              <span className="text-sm font-medium tabular-nums">{selectedLabel.primary}</span>
              <span className="text-center text-xs tabular-nums text-charcoal/65">{diameterLabel(selectedValue)} mm</span>
              <span className="text-right text-xs text-charcoal/65">NZ {approxNzForValue?.(selectedValue)}</span>
            </>
          ) : selectedValue ? (
            <>
              <span className="shrink-0 text-sm font-medium tabular-nums tracking-tight">
                {selectedLabel.primary}
              </span>
              {phrase ? (
                <span className="min-w-0 flex-1 text-right text-xs leading-snug text-charcoal/65">
                  {phrase}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-charcoal/65">Select size</span>
          )}
        </span>
      </button>
      <span
        className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-charcoal/50"
        aria-hidden
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={open ? 'rotate-180 transition-transform duration-200' : 'transition-transform duration-200'}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </span>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[min(22rem,calc(100vh-12rem))] overflow-y-auto border border-charcoal/20 bg-cream shadow-[0_12px_36px_var(--miozuki-shadow)]"
        >
          {useColumns && (
            <div role="presentation" className={`${columnLayout} sticky top-0 z-10 border-b border-charcoal/10 bg-cream px-3.5 py-3 text-[10px] font-medium tracking-wide text-charcoal/55`}>
              <span>Size</span>
              <span className="text-center">Inner diametre</span>
              <span className="text-right">Approx. NZ</span>
            </div>
          )}
          {values.map((val) => {
            const available = availabilityForValue(val);
            const rowSizing = sizingLabel(val, diametreForValue?.(val), approxNzForValue?.(val));
            const rowPhrase = rowSizing.detail;
            const isSelected = val === selectedValue;
            const detailLabel = !available
              ? `${rowPhrase ? `${rowPhrase} · ` : ''}Unavailable`
              : (rowPhrase ?? '');
            const rowLabel = `${rowSizing.primary}${detailLabel ? ` · ${detailLabel}` : ''}${estimatedDiametreForValue?.(val) ? ' · estimated diametre' : ''}`;

            return (
              <button
                key={val}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={!available}
                aria-label={rowLabel}
                onClick={() => {
                  if (!available) return;
                  onChange(val);
                  setOpen(false);
                }}
                className={`${useColumns ? columnLayout : 'flex items-baseline justify-between gap-4'} min-h-11 w-full px-3.5 py-3 text-left text-xs leading-normal transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected ? 'bg-burgundy/[0.06] font-medium text-charcoal' : 'text-charcoal hover:bg-surface'
                }`}
              >
                <span
                  className={`shrink-0 text-sm tabular-nums tracking-tight${!available ? ' line-through opacity-70' : ' font-medium'}`}
                >
                  {rowSizing.primary}
                </span>
                {useColumns ? (
                  <>
                    <span className="text-center text-xs tabular-nums text-charcoal/65">{diameterLabel(val)} mm</span>
                    <span className="text-right text-xs text-charcoal/65">{approxNzForValue?.(val)}</span>
                  </>
                ) : <span className="min-w-0 flex-1 text-right text-xs leading-snug text-charcoal/65">
                  {detailLabel ||
                    '\u00a0'}
                </span>}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
