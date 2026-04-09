'use client';

import { useState } from 'react';
import type { Money, ProductVariant } from '@/lib/shopify';
import RingSizeGuide from '@/components/ring-size-guide';
import { useCart } from './cart-provider';

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

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
  priceRange,
}: {
  variants: ProductVariant[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
}) {
  const { addToCart } = useCart();
  const options = buildOptions(variants);
  /** Single-variant products still carry Shopify's Title/Default Title option; no picker needed. */
  const showVariantPicker = variants.length > 1;
  const hasRingSizes = options.some((o) => o.name === 'Ring size');

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const opt of options) defaults[opt.name] = opt.values[0];
    return defaults;
  });

  const [engraving, setEngraving] = useState('');
  const [btnState, setBtnState] = useState<ButtonState>('idle');

  const variant = findVariant(variants, selected);
  const available = variant?.availableForSale ?? false;

  const minP = priceRange.minVariantPrice;
  const maxP = priceRange.maxVariantPrice;
  const hasPriceRange =
    parseFloat(maxP.amount) > parseFloat(minP.amount);
  const priceLabel = variant
    ? formatPrice(variant.price.amount, variant.price.currencyCode)
    : hasPriceRange
      ? `From ${formatPrice(minP.amount, minP.currencyCode)}`
      : formatPrice(minP.amount, minP.currencyCode);

  const handleAdd = async () => {
    if (!variant || !available) return;
    setBtnState('loading');
    try {
      const attrs =
        hasRingSizes && engraving.trim()
          ? [{ key: 'Engraving', value: engraving.trim() }]
          : undefined;
      await addToCart(variant.id, 1, attrs);
      setBtnState('added');
      setTimeout(() => setBtnState('idle'), 2000);
    } catch {
      setBtnState('error');
      setTimeout(() => setBtnState('idle'), 2500);
    }
  };

  return (
    <>
      <p className="text-xl text-burgundy font-medium">{priceLabel}</p>
      <div className="h-px bg-charcoal/8" />
      <div className="space-y-6">
        {/* Variant options (hidden for single-variant products) */}
        {showVariantPicker &&
          options.map((opt) => (
            <div key={opt.name}>
              <p className="text-xs tracking-widest uppercase text-charcoal/50 mb-3">
                {opt.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((val) => {
                  const isSelected = selected[opt.name] === val;
                  const testVariant = findVariant(variants, {
                    ...selected,
                    [opt.name]: val,
                  });
                  const isAvailable = testVariant?.availableForSale ?? false;
                  return (
                    <button
                      key={val}
                      onClick={() =>
                        setSelected((s) => ({ ...s, [opt.name]: val }))
                      }
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
              {opt.name === 'Ring size' && (
                <div className="mt-3">
                  <RingSizeGuide />
                </div>
              )}
            </div>
          ))}

        {hasRingSizes && !showVariantPicker && (
          <div>
            <RingSizeGuide />
          </div>
        )}

        {/* Engraving field — rings only */}
        {hasRingSizes && (
          <div>
            <label className="text-xs tracking-widest uppercase text-charcoal/50 mb-2 block">
              Add Initials Engraving{' '}
              <span className="normal-case text-charcoal/35">(optional)</span>
            </label>
            <input
              type="text"
              value={engraving}
              onChange={(e) => setEngraving(e.target.value.slice(0, 12))}
              placeholder="e.g. JR ❤ EM"
              maxLength={12}
              className="w-52 border border-charcoal/20 bg-transparent px-3 py-2 text-xs text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-charcoal/50 transition-colors"
            />
            <p className="text-[10px] text-charcoal/35 mt-1">Max 12 characters</p>
          </div>
        )}

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
    </>
  );
}
