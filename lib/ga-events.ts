'use client';

import { gaEvent } from '@/lib/gtag';
import { isProductionTrackingContext } from '@/lib/analytics-host';
import type { Money, ProductVariant } from '@/lib/shopify';

type AddToCartEvent = {
  productTitle: string;
  variant: ProductVariant;
  quantity: number;
};

function moneyValue(money: Money, quantity: number): number {
  const amount = Number.parseFloat(money.amount);
  return Number.isFinite(amount) ? amount * quantity : 0;
}

export function trackAddToCart({ productTitle, variant, quantity }: AddToCartEvent) {
  if (!isProductionTrackingContext()) return;

  const price = Number.parseFloat(variant.price.amount);
  gaEvent('add_to_cart', {
    currency: variant.price.currencyCode,
    value: moneyValue(variant.price, quantity),
    items: [
      {
        item_id: variant.id,
        item_name: productTitle,
        item_variant: variant.title,
        price: Number.isFinite(price) ? price : undefined,
        quantity,
      },
    ],
  });
}
