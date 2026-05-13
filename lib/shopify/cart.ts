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

export async function createCart(
  variantId: string,
  quantity = 1,
  attributes?: CartAttribute[]
): Promise<Cart> {
  const parsed = (await invokeCart({
    op: 'create',
    variantId,
    quantity,
    ...(attributes?.length ? { attributes } : {}),
  })) as { cart?: Cart };
  if (!parsed.cart) throw new Error('Unexpected cart response');
  return parsed.cart;
}

export async function addCartLines(
  cartId: string,
  variantId: string,
  quantity = 1,
  attributes?: CartAttribute[]
): Promise<Cart> {
  const parsed = (await invokeCart({
    op: 'addLines',
    cartId,
    variantId,
    quantity,
    ...(attributes?.length ? { attributes } : {}),
  })) as { cart?: Cart };
  if (!parsed.cart) throw new Error('Unexpected cart response');
  return parsed.cart;
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const parsed = (await invokeCart({
    op: 'removeLines',
    cartId,
    lineIds,
  })) as { cart?: Cart };
  if (!parsed.cart) throw new Error('Unexpected cart response');
  return parsed.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const parsed = (await invokeCart({ op: 'get', cartId })) as { cart?: Cart | null };
  return parsed.cart ?? null;
}
