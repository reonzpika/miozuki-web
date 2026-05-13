import { NextRequest, NextResponse } from 'next/server';
import { getStorefrontCredentials } from '@/lib/shopify/credentials';
import {
  storefrontCreateCart,
  storefrontAddCartLines,
  storefrontGetCart,
  storefrontRemoveCartLines,
  type CartAttribute,
} from '@/lib/shopify/cart-backend';

function isCartAttributeArray(v: unknown): v is CartAttribute[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      'key' in item &&
      'value' in item &&
      typeof (item as CartAttribute).key === 'string' &&
      typeof (item as CartAttribute).value === 'string'
  );
}

const MAX_QUANTITY = 100;
const MAX_LINE_IDS = 100;

function parseQuantity(v: unknown): { value: number } | { error: string } {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    return { error: 'Invalid quantity, must be a positive integer.' };
  }
  if (!Number.isInteger(v)) {
    return { error: 'Invalid quantity, must be a whole number.' };
  }
  if (v < 1) {
    return { error: 'Invalid quantity, must be 1 or more.' };
  }
  if (v > MAX_QUANTITY) {
    return { error: `Invalid quantity, must be ${MAX_QUANTITY} or fewer.` };
  }
  return { value: v };
}

export async function POST(req: NextRequest) {
  const credentials = getStorefrontCredentials();
  if (!credentials) {
    return NextResponse.json(
      { error: 'Shopify Storefront API is not configured on the server.' },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!payload || typeof payload !== 'object' || !('op' in payload)) {
    return NextResponse.json({ error: 'Missing operation.' }, { status: 400 });
  }

  const op = (payload as { op: unknown }).op;
  if (typeof op !== 'string') {
    return NextResponse.json({ error: 'Invalid operation.' }, { status: 400 });
  }

  try {
    switch (op) {
      case 'create': {
        const { variantId, quantity = 1, attributes } = payload as {
          variantId?: unknown;
          quantity?: unknown;
          attributes?: unknown;
        };
        if (typeof variantId !== 'string' || !variantId) {
          return NextResponse.json({ error: 'Missing variantId.' }, { status: 400 });
        }
        const parsedQty = parseQuantity(quantity);
        if ('error' in parsedQty) {
          return NextResponse.json({ error: parsedQty.error }, { status: 400 });
        }
        const attrs =
          attributes !== undefined && isCartAttributeArray(attributes) ? attributes : undefined;
        const cart = await storefrontCreateCart(credentials, variantId, parsedQty.value, attrs);
        return NextResponse.json({ cart });
      }
      case 'addLines': {
        const { cartId, variantId, quantity = 1, attributes } = payload as {
          cartId?: unknown;
          variantId?: unknown;
          quantity?: unknown;
          attributes?: unknown;
        };
        if (typeof cartId !== 'string' || !cartId) {
          return NextResponse.json({ error: 'Missing cartId.' }, { status: 400 });
        }
        if (typeof variantId !== 'string' || !variantId) {
          return NextResponse.json({ error: 'Missing variantId.' }, { status: 400 });
        }
        const parsedQty = parseQuantity(quantity);
        if ('error' in parsedQty) {
          return NextResponse.json({ error: parsedQty.error }, { status: 400 });
        }
        const attrs =
          attributes !== undefined && isCartAttributeArray(attributes) ? attributes : undefined;
        const cart = await storefrontAddCartLines(
          credentials,
          cartId,
          variantId,
          parsedQty.value,
          attrs,
        );
        return NextResponse.json({ cart });
      }
      case 'get': {
        const { cartId } = payload as { cartId?: unknown };
        if (typeof cartId !== 'string' || !cartId) {
          return NextResponse.json({ error: 'Missing cartId.' }, { status: 400 });
        }
        const cart = await storefrontGetCart(credentials, cartId);
        return NextResponse.json({ cart });
      }
      case 'removeLines': {
        const { cartId, lineIds } = payload as { cartId?: unknown; lineIds?: unknown };
        if (typeof cartId !== 'string' || !cartId) {
          return NextResponse.json({ error: 'Missing cartId.' }, { status: 400 });
        }
        if (
          !Array.isArray(lineIds) ||
          !lineIds.length ||
          !lineIds.every((id): id is string => typeof id === 'string')
        ) {
          return NextResponse.json({ error: 'Missing or invalid lineIds.' }, { status: 400 });
        }
        if (lineIds.length > MAX_LINE_IDS) {
          return NextResponse.json(
            { error: `Too many lineIds, max ${MAX_LINE_IDS} per request.` },
            { status: 400 },
          );
        }
        const cart = await storefrontRemoveCartLines(credentials, cartId, lineIds);
        return NextResponse.json({ cart });
      }
      default:
        return NextResponse.json({ error: 'Unknown operation.' }, { status: 400 });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Cart operation failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
