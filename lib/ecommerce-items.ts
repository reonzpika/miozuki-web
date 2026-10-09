import type { Product, ProductVariant } from './shopify/types';
import type { Cart, CartLine } from './shopify/cart-backend';

function numericId(value: unknown) { return typeof value === 'string' ? value.split('/').at(-1) : undefined; }

/** GA native Shopify IDs, distinct from Merchant Center's market-specific feed IDs. */
export function analyticsItemId(productId: string, variantId: string): string {
  const product = numericId(productId);
  const variant = numericId(variantId);
  const prefix = process.env.NEXT_PUBLIC_GA4_SHOPIFY_ITEM_PREFIX || 'shopify_ZZ';
  return product && variant ? `${prefix}_${product}_${variant}` : typeof variantId === 'string' ? variantId : 'unknown';
}
export function variantItem(productId: string, title: string, variant: ProductVariant, quantity = 1) {
  return {
    item_id: analyticsItemId(productId, variant.id), item_name: title,
    item_variant: variant.title, price: Number(variant.price.amount), quantity,
  };
}
export function productItem(product: Product) {
  const variant = product.variants.edges[0]?.node;
  return variant ? variantItem(product.id, product.title, variant) : { item_id: product.id, item_name: product.title };
}
export function cartLineItem(line: CartLine) {
  return {
    item_id: analyticsItemId(line.merchandise.product.id, line.merchandise.id),
    item_name: line.merchandise.product.title, item_variant: line.merchandise.title,
    price: Number(line.merchandise.price.amount), quantity: line.quantity,
  };
}
export function cartEventData(cart: Cart) {
  return {
    currency: cart.cost.subtotalAmount.currencyCode,
    value: Number(cart.cost.subtotalAmount.amount),
    items: cart.lines.edges.map(({ node }) => cartLineItem(node)),
  };
}
