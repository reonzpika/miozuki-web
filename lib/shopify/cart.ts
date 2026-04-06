import type { Money, ShopifyImage, ShopifyResponse } from './types';

// ── Types ──────────────────────────────────────────────────────────────

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: Money;
    product: {
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { edges: { node: CartLine }[] };
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
  };
}

// ── Fragments & queries ────────────────────────────────────────────────

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price { amount currencyCode }
              product {
                title
                handle
                featuredImage { url altText width height }
              }
            }
          }
        }
      }
    }
    cost {
      totalAmount { amount currencyCode }
      subtotalAmount { amount currencyCode }
    }
  }
`;

const CREATE_CART = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const ADD_CART_LINES = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const REMOVE_CART_LINES = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFragment }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const GET_CART = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) { ...CartFragment }
  }
  ${CART_FRAGMENT}
`;

// ── Fetch helper ───────────────────────────────────────────────────────

const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2026-04/graphql.json`;

async function cartFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token':
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Cart API error: ${res.status}`);

  const json: ShopifyResponse<T> = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(', '));
  return json.data;
}

// ── Exported functions ─────────────────────────────────────────────────

export type CartAttribute = { key: string; value: string };

export async function createCart(
  variantId: string,
  quantity = 1,
  attributes?: CartAttribute[]
): Promise<Cart> {
  const line: Record<string, unknown> = { merchandiseId: variantId, quantity };
  if (attributes?.length) line.attributes = attributes;
  const data = await cartFetch<{ cartCreate: { cart: Cart } }>(CREATE_CART, {
    lines: [line],
  });
  return data.cartCreate.cart;
}

export async function addCartLines(
  cartId: string,
  variantId: string,
  quantity = 1,
  attributes?: CartAttribute[]
): Promise<Cart> {
  const line: Record<string, unknown> = { merchandiseId: variantId, quantity };
  if (attributes?.length) line.attributes = attributes;
  const data = await cartFetch<{ cartLinesAdd: { cart: Cart } }>(ADD_CART_LINES, {
    cartId,
    lines: [line],
  });
  return data.cartLinesAdd.cart;
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await cartFetch<{ cartLinesRemove: { cart: Cart } }>(
    REMOVE_CART_LINES,
    { cartId, lineIds }
  );
  return data.cartLinesRemove.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await cartFetch<{ cart: Cart | null }>(GET_CART, { cartId });
  return data.cart;
}
