import type { Cart, CartAttribute, CartLine } from './cart-backend';

export type { Cart, CartAttribute, CartLine };

/** Browser cart calls go through a Route Handler so server env (SHOPIFY_*) works without NEXT_PUBLIC duplication. */

const CART_API = '/api/shopify/cart';

async function invokeCart<B extends Record<string, unknown>>(body: B): Promise<unknown> {
  const res = await fetch(CART_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  let parsed: unknown = {};
  try {
    parsed = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const err =
      parsed &&
      typeof parsed === 'object' &&
      'error' in parsed &&
      typeof (parsed as { error: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : 'Cart request failed';
    throw new Error(err);
  }

  return parsed;
}

function hasCartShape(payload: unknown): payload is { cart: Cart } {
  if (!payload || typeof payload !== 'object') return false;
  const cart = (payload as { cart?: unknown }).cart;
  if (!cart || typeof cart !== 'object') return false;
  const c = cart as { id?: unknown; checkoutUrl?: unknown; lines?: unknown };
  if (typeof c.id !== 'string' || typeof c.checkoutUrl !== 'string') return false;
  if (!c.lines || typeof c.lines !== 'object') return false;
  return Array.isArray((c.lines as { edges?: unknown }).edges);
}

function hasNullableCartShape(payload: unknown): payload is { cart: Cart | null } {
  if (!payload || typeof payload !== 'object') return false;
  const cart = (payload as { cart?: unknown }).cart;
  if (cart === null || cart === undefined) return true;
  return hasCartShape(payload);
}

function snippet(payload: unknown): string {
  try {
    return JSON.stringify(payload).slice(0, 200);
  } catch {
    return String(payload).slice(0, 200);
  }
}

export async function createCart(
  variantId: string,
  quantity = 1,
  attributes?: CartAttribute[]
): Promise<Cart> {
  const parsed = await invokeCart({
    op: 'create',
    variantId,
    quantity,
    ...(attributes?.length ? { attributes } : {}),
  });
  if (!hasCartShape(parsed)) {
    throw new Error(`Unexpected cart response from create: ${snippet(parsed)}`);
  }
  return parsed.cart;
}

export async function addCartLines(
  cartId: string,
  variantId: string,
  quantity = 1,
  attributes?: CartAttribute[]
): Promise<Cart> {
  const parsed = await invokeCart({
    op: 'addLines',
    cartId,
    variantId,
    quantity,
    ...(attributes?.length ? { attributes } : {}),
  });
  if (!hasCartShape(parsed)) {
    throw new Error(`Unexpected cart response from addLines: ${snippet(parsed)}`);
  }
  return parsed.cart;
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const parsed = await invokeCart({
    op: 'removeLines',
    cartId,
    lineIds,
  });
  if (!hasCartShape(parsed)) {
    throw new Error(`Unexpected cart response from removeLines: ${snippet(parsed)}`);
  }
  return parsed.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const parsed = await invokeCart({ op: 'get', cartId });
  if (!hasNullableCartShape(parsed)) {
    throw new Error(`Unexpected cart response from get: ${snippet(parsed)}`);
  }
  return parsed.cart;
}
