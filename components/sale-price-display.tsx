import type { Money } from '@/lib/shopify';

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

/**
 * Sale price with optional crossed-out compare-at ("was") amount.
 * Only shows the crossed-out figure when compare-at is higher than the selling price.
 */
export default function SalePriceDisplay({
  priceLabel,
  compareAt,
  size = 'lg',
  tone = 'burgundy',
}: {
  priceLabel: string;
  compareAt: Money | null | undefined;
  size?: 'lg' | 'sm' | 'card';
  tone?: 'burgundy' | 'graphite';
}) {
  const sellingAmount = priceLabel.replace(/[^0-9.]/g, '');
  const selling = parseFloat(sellingAmount);
  const was = compareAt ? parseFloat(compareAt.amount) : NaN;
  const onSale =
    Boolean(compareAt) &&
    !priceLabel.startsWith('From ') &&
    Number.isFinite(was) &&
    Number.isFinite(selling) &&
    was > selling;

  const priceClass =
    size === 'lg'
      ? `text-xl font-medium ${tone === 'burgundy' ? 'text-burgundy' : 'text-graphite'}`
      : size === 'card'
        ? `text-[13px] font-medium tabular-nums ${tone === 'burgundy' ? 'text-burgundy' : 'text-graphite'}`
        : `font-medium ${tone === 'burgundy' ? 'text-burgundy' : 'text-graphite'}`;

  const compareClass =
    size === 'lg'
      ? 'text-base font-normal text-charcoal/65 line-through'
      : size === 'card'
        ? 'text-[12px] font-normal text-charcoal/65 line-through tabular-nums'
        : 'shrink-0 text-[12px] font-normal text-charcoal/65 line-through';

  if (!onSale || !compareAt) {
    return (
      <p className={size === 'sm' ? `truncate ${priceClass}` : priceClass}>{priceLabel}</p>
    );
  }

  return (
    <p
      className={
        size === 'lg'
          ? `flex flex-wrap items-baseline gap-x-2.5 gap-y-1 ${priceClass}`
          : size === 'card'
            ? `flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${priceClass}`
            : `flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${priceClass}`
      }
    >
      <span className={compareClass}>
        {formatPrice(compareAt.amount, compareAt.currencyCode)}
      </span>
      <span className={size === 'sm' ? 'truncate' : undefined}>{priceLabel}</span>
    </p>
  );
}
