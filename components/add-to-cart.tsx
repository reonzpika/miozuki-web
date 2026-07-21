'use client';

import { useState } from 'react';
import type { Money, ProductVariant } from '@/lib/shopify';
import RingSizeGuide from '@/components/ring-size-guide';
import PdpTrustStrip from '@/components/pdp-trust-strip';
import PdpRingSizeSelect from '@/components/pdp-ring-size-select';
import { isRingSizeOption } from '@/lib/ring-size-chart';
import { trackAddToCart } from '@/lib/ga-events';
import { useCart } from './cart-provider';
import SalePriceDisplay from '@/components/sale-price-display';

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

function sortRingSizeValues(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    const aNum = Number.isFinite(na);
    const bNum = Number.isFinite(nb);
    if (aNum && bNum) return na - nb;
    return a.localeCompare(b, 'en-NZ');
  });
}

type ButtonState = 'idle' | 'loading' | 'added' | 'error' | 'select-size';

export default function AddToCart({
  variants,
  priceRange,
  productTitle,
}: {
  variants: ProductVariant[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  /** Shown on the mobile sticky bar (truncated in CSS). */
  productTitle: string;
}) {
  const { addToCart } = useCart();
  const options = buildOptions(variants);
  /** Single-variant products still carry Shopify's Title/Default Title option; no picker needed. */
  const showVariantPicker = variants.length > 1;
  const hasRingSizes = options.some((o) => isRingSizeOption(o.name, o.values));

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const opt of options) {
      defaults[opt.name] = isRingSizeOption(opt.name, opt.values)
        ? ''
        : opt.values[0];
    }
    return defaults;
  });

  const [btnState, setBtnState] = useState<ButtonState>('idle');

  const needsRingSize = options.some(
    (o) => isRingSizeOption(o.name, o.values) && !selected[o.name]
  );

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

  // Crossed-out "was" price only when Shopify compare-at is higher than the selling price.
  const compareAtForDisplay = (() => {
    if (variant?.compareAtPrice) {
      const selling = parseFloat(variant.price.amount);
      const was = parseFloat(variant.compareAtPrice.amount);
      return was > selling ? variant.compareAtPrice : null;
    }
    if (!hasPriceRange && variants[0]?.compareAtPrice) {
      const selling = parseFloat(minP.amount);
      const was = parseFloat(variants[0].compareAtPrice.amount);
      return was > selling ? variants[0].compareAtPrice : null;
    }
    return null;
  })();

  const handleAdd = async () => {
    if (needsRingSize) {
      setBtnState('select-size');
      setTimeout(() => setBtnState('idle'), 2500);
      return;
    }
    if (!variant || !available) return;
    setBtnState('loading');
    try {
      const quantity = 1;
      await addToCart(variant.id, quantity);
      trackAddToCart({ productTitle, variant, quantity });
      setBtnState('added');
      setTimeout(() => setBtnState('idle'), 2000);
    } catch {
      setBtnState('error');
      setTimeout(() => setBtnState('idle'), 2500);
    }
  };

  const soldOut = !needsRingSize && Boolean(variant) && !available;
  const addDisabled =
    soldOut || btnState === 'loading' || btnState === 'added';

  function addButtonLabel(short = false): string {
    if (needsRingSize && btnState === 'select-size') {
      return 'Please select size';
    }
    if (soldOut) return short ? 'Sold out' : 'Sold Out';
    if (btnState === 'loading') return 'Adding…';
    if (btnState === 'added') return short ? 'Added' : 'Added to Cart';
    if (btnState === 'error') return short ? 'Error' : 'Something went wrong';
    return short ? 'Add to cart' : 'Add to Cart';
  }

  function addButtonClassName(compact = false): string {
    const base = compact
      ? 'shrink-0 px-5 py-3 text-[11px] tracking-[0.18em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream'
      : 'w-full py-4 text-xs tracking-[0.2em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

    if (soldOut) {
      return `${base} bg-charcoal/10 text-charcoal/30 cursor-not-allowed`;
    }
    if (btnState === 'added') {
      return `${base} bg-charcoal text-cream`;
    }
    if (btnState === 'error') {
      return `${base} bg-red-800 text-cream`;
    }
    if (btnState === 'select-size') {
      return `${base} bg-burgundy text-cream`;
    }
    return `${base} bg-burgundy text-cream hover:bg-accent-hover`;
  }

  return (
    <>
      <SalePriceDisplay priceLabel={priceLabel} compareAt={compareAtForDisplay} size="lg" />
      <div className="mt-4">
        <PdpTrustStrip />
      </div>
      <div className="mt-6 h-px bg-charcoal/8" />
      <div className="space-y-6">
        {/* Variant options (hidden for single-variant products) */}
        {showVariantPicker &&
          options.map((opt) => {
            const ringSize = isRingSizeOption(opt.name, opt.values);
            const valuesForUi = ringSize
              ? sortRingSizeValues(opt.values)
              : opt.values;

            if (ringSize) {
              const fieldId = `pdp-ring-size-${opt.name.replace(/\s+/g, '-').toLowerCase()}`;
              const labelId = `${fieldId}-label`;
              return (
                <div key={opt.name}>
                  <label
                    id={labelId}
                    htmlFor={fieldId}
                    className="mb-3 block text-xs uppercase tracking-widest text-charcoal/50"
                  >
                    Ring size
                  </label>
                  <PdpRingSizeSelect
                    id={fieldId}
                    labelId={labelId}
                    values={valuesForUi}
                    selectedValue={selected[opt.name]}
                    showRequired={btnState === 'select-size'}
                    onChange={(val) => {
                      setSelected((s) => ({ ...s, [opt.name]: val }));
                      if (btnState === 'select-size') setBtnState('idle');
                    }}
                    availabilityForValue={(val) => {
                      const testVariant = findVariant(variants, {
                        ...selected,
                        [opt.name]: val,
                      });
                      return testVariant?.availableForSale ?? false;
                    }}
                  />
                  <div className="mt-3">
                    <RingSizeGuide />
                  </div>
                </div>
              );
            }

            return (
              <div key={opt.name}>
                <p className="mb-3 text-xs uppercase tracking-widest text-charcoal/50">
                  {opt.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {valuesForUi.map((val) => {
                    const isSelected = selected[opt.name] === val;
                    const testVariant = findVariant(variants, {
                      ...selected,
                      [opt.name]: val,
                    });
                    const isAvailable = testVariant?.availableForSale ?? false;
                    return (
                      <button
                        type="button"
                        key={val}
                        onClick={() =>
                          setSelected((s) => ({ ...s, [opt.name]: val }))
                        }
                        disabled={!isAvailable}
                        className={`min-h-11 border px-4 py-2 text-xs tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                          isSelected
                            ? 'border-burgundy bg-burgundy text-cream'
                            : isAvailable
                              ? 'border-charcoal/20 text-charcoal hover:border-charcoal/50'
                              : 'cursor-not-allowed border-charcoal/10 text-charcoal/25 line-through'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

        {hasRingSizes && !showVariantPicker && (
          <div>
            <RingSizeGuide />
          </div>
        )}

        {/* Add to cart button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={addDisabled}
          className={addButtonClassName()}
        >
          {addButtonLabel()}
        </button>
      </div>

      {/* Cold-traffic style sticky bar: mirrors main CTA on small viewports */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-cream/95 px-4 py-3 backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-charcoal/45 truncate">
              {productTitle}
            </p>
            <SalePriceDisplay
              priceLabel={priceLabel}
              compareAt={compareAtForDisplay}
              size="sm"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={addDisabled}
            className={addButtonClassName(true)}
          >
            {addButtonLabel(true)}
          </button>
        </div>
      </div>
    </>
  );
}
