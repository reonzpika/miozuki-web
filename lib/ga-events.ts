'use client';

import { gaEvent } from '@/lib/gtag';
import { isProductionTrackingContext } from '@/lib/analytics-host';
import type { Money, ProductVariant } from '@/lib/shopify';
import type { Cart, CartLine } from './shopify/cart';
import { cartEventData, cartLineItem, variantItem } from './ecommerce-items';

type AddToCartEvent = {
  productId: string;
  productTitle: string;
  variant: ProductVariant;
  quantity: number;
};

function moneyValue(money: Money, quantity: number): number {
  const amount = Number.parseFloat(money.amount);
  return Number.isFinite(amount) ? amount * quantity : 0;
}

export function trackAddToCart({ productId, productTitle, variant, quantity }: AddToCartEvent) {
  try {

  if (!isProductionTrackingContext()) return;

  const price = Number.parseFloat(variant.price.amount);
  gaEvent('add_to_cart', {
    currency: variant.price.currencyCode,
    value: moneyValue(variant.price, quantity),
    items: [
      {
        ...variantItem(productId, productTitle, variant, quantity),
        item_name: productTitle,
        item_variant: variant.title,
        price: Number.isFinite(price) ? price : undefined,
        quantity,
      },
    ],
  });

  } catch { /* Telemetry must not interrupt shopping. */ }
}

export function trackViewItem(input: AddToCartEvent) {
  try {

  if (!isProductionTrackingContext()) return;
  gaEvent('view_item', { currency: input.variant.price.currencyCode,
    value: moneyValue(input.variant.price, input.quantity),
    items: [variantItem(input.productId, input.productTitle, input.variant, input.quantity)] });

  } catch { /* Telemetry must not interrupt shopping. */ }
}
export function trackViewCart(cart: Cart) {
  try {

  if (isProductionTrackingContext()) gaEvent('view_cart', cartEventData(cart));

  } catch { /* Telemetry must not interrupt shopping. */ }
}
export function trackBeginCheckout(cart: Cart) {
  try {

  if (isProductionTrackingContext()) gaEvent('begin_checkout', cartEventData(cart));

  } catch { /* Telemetry must not interrupt shopping. */ }
}
export function trackRemoveFromCart(line: CartLine) {
  try {

  if (!isProductionTrackingContext()) return;
  gaEvent('remove_from_cart', { currency: line.merchandise.price.currencyCode,
    value: Number(line.merchandise.price.amount) * line.quantity, items: [cartLineItem(line)] });

  } catch { /* Telemetry must not interrupt shopping. */ }
}
