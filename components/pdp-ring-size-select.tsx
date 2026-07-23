'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ringInnerDiametrePhrase } from '@/lib/ring-size-chart';

type Props = {
  id: string;
  labelId: string;
  values: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  availabilityForValue: (value: string) => boolean;
  /** Highlights the field after add-to-cart without a selection. */
  showRequired?: boolean;
};

export default function PdpRingSizeSelect({
  id,
  labelId,
  values,
  selectedValue,
  onChange,
  availabilityForValue,
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

  const phrase = selectedValue ? ringInnerDiametrePhrase(selectedValue) : null;

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
        <span className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
          {selectedValue ? (
            <>
              <span className="shrink-0 text-sm font-medium tabular-nums tracking-tight">
                {selectedValue}
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
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[min(22rem,calc(100vh-12rem))] overflow-y-auto border border-charcoal/20 bg-cream py-1 shadow-[0_12px_36px_var(--miozuki-shadow)]"
        >
          {values.map((val) => {
            const available = availabilityForValue(val);
            const rowPhrase = ringInnerDiametrePhrase(val);
            const isSelected = val === selectedValue;
            const detailLabel = !available
              ? `${rowPhrase ? `${rowPhrase} · ` : ''}Unavailable`
              : (rowPhrase ?? '');
            const rowLabel = `${val}${detailLabel ? ` · ${detailLabel}` : ''}`;

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
                className={`flex w-full items-baseline justify-between gap-4 px-3.5 py-3 text-left text-xs leading-normal transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected ? 'bg-burgundy/[0.06] font-medium text-charcoal' : 'text-charcoal hover:bg-surface'
                }`}
              >
                <span
                  className={`shrink-0 text-sm tabular-nums tracking-tight${!available ? ' line-through opacity-70' : ' font-medium'}`}
                >
                  {val}
                </span>
                <span className="min-w-0 flex-1 text-right text-xs leading-snug text-charcoal/65">
                  {detailLabel ||
                    '\u00a0'}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
