'use client';

import { useState } from 'react';
import type { ProductVariant } from '@/lib/shopify';
import { useCart } from './cart-provider';

interface Option {
  name: string;
  values: string[];
}

function buildOptions(variants: ProductVariant[]): Option[] {
  const map = new Map<string, Set<string>>();
  for (const v of variants) {
    for (const opt of v.selectedOptions) {
      if (!map.has(opt.name)) map.set(opt.name, new Set());
      map.get(opt.name)!.add(opt.value);
    }
  }
  return Array.from(map.entries()).map(([name, vals]) => ({
    name,
    values: Array.from(vals),
  }));
}

function findVariant(
  variants: ProductVariant[],
  selected: Record<string, string>
): ProductVariant | null {
  return (
    variants.find((v) =>
      v.selectedOptions.every((opt) => selected[opt.name] === opt.value)
    ) ?? null
  );
}

type ButtonState = 'idle' | 'loading' | 'added' | 'error';

export default function AddToCart({
  variants,
}: {
  variants: ProductVariant[];
}) {
  const { addToCart } = useCart();
  const options = buildOptions(variants);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const opt of options) defaults[opt.name] = opt.values[0];
    return defaults;
  });

  const [btnState, setBtnState] = useState<ButtonState>('idle');

  const variant = findVariant(variants, selected);
  const available = variant?.availableForSale ?? false;

  const handleAdd = async () => {
    if (!variant || !available) return;
    setBtnState('loading');
    try {
      await addToCart(variant.id, 1);
      setBtnState('added');
      setTimeout(() => setBtnState('idle'), 2000);
    } catch {
      setBtnState('error');
      setTimeout(() => setBtnState('idle'), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Variant options */}
      {options.map((opt) => (
        <div key={opt.name}>
          <p className="text-xs tracking-widest uppercase text-charcoal/50 mb-3">
            {opt.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((val) => {
              const isSelected = selected[opt.name] === val;
              const testVariant = findVariant(variants, { ...selected, [opt.name]: val });
              const isAvailable = testVariant?.availableForSale ?? false;
              return (
                <button
                  key={val}
                  onClick={() => setSelected((s) => ({ ...s, [opt.name]: val }))}
                  disabled={!isAvailable}
                  className={`px-4 py-2 text-xs tracking-wide border transition-colors ${
                    isSelected
                      ? 'bg-burgundy text-cream border-burgundy'
                      : isAvailable
                      ? 'border-charcoal/20 text-charcoal hover:border-charcoal/50'
                      : 'border-charcoal/10 text-charcoal/25 cursor-not-allowed line-through'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        disabled={!available || btnState === 'loading' || btnState === 'added'}
        className={`w-full py-4 text-xs tracking-[0.2em] uppercase transition-colors ${
          !available
            ? 'bg-charcoal/10 text-charcoal/30 cursor-not-allowed'
            : btnState === 'added'
            ? 'bg-charcoal text-cream'
            : btnState === 'error'
            ? 'bg-red-800 text-cream'
            : 'bg-burgundy text-cream hover:bg-burgundy/90'
        }`}
      >
        {!available
          ? 'Sold Out'
          : btnState === 'loading'
          ? 'Adding…'
          : btnState === 'added'
          ? 'Added to Cart'
          : btnState === 'error'
          ? 'Something went wrong'
          : 'Add to Cart'}
      </button>
    </div>
  );
}
