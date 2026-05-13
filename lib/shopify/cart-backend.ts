import type { ShopifyResponse } from './types';
import type { StorefrontCredentials } from './credentials';

// ── Types aligned with storefront cart payloads ────────────────────────

export type CartAttribute = { key: string; value: string };

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    product: {
      title: string;
      handle: string;
      featuredImage: {
        url: string;
        altText: string | null;
        width: number;
        height: number;
      } | null;
    };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { edges: { node: CartLine }[] };
  cost: {
    totalAmount: { amount: string; currencyCode: string };
    subtotalAmount: { amount: string; currencyCode: string };
  };
}

type ShopifyUserError = { field?: string[] | null; message: string };

// ── GraphQL ────────────────────────────────────────────────────────────

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

function throwOnUserErrors(userErrors: ShopifyUserError[] | undefined, fallback: string): never {
  if (userErrors?.length) {
    throw new Error(userErrors.map((e) => e.message).join(', '));
  }
  throw new Error(fallback);
}

async function storefrontRequest<T>(
  credentials: StorefrontCredentials,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(credentials.graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': credentials.token,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Cart API error: ${res.status}`);
  }

  const json: ShopifyResponse<T> = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }

  return json.data;
}

// ── Operations (server-only callers: Route Handler) ────────────────────

export async function storefrontCreateCart(
  credentials: StorefrontCredentials,
  variantId: string,
  quantity = 1,
  attributes?: CartAttribute[]
): Promise<Cart> {
  const line: Record<string, unknown> = { merchandiseId: variantId, quantity };
  if (attributes?.length) line.attributes = attributes;
  const data = await storefrontRequest<{
    cartCreate: { cart: Cart | null; userErrors: ShopifyUserError[] };
  }>(credentials, CREATE_CART, { lines: [line] });

  const { cart, userErrors } = data.cartCreate;
  if (cart) return cart;
  throwOnUserErrors(userErrors, 'Could not create cart');
}

export async function storefrontAddCartLines(
  credentials: StorefrontCredentials,
  cartId: string,
  variantId: string,
  quantity = 1,
  attributes?: CartAttribute[]
): Promise<Cart> {
  const line: Record<string, unknown> = { merchandiseId: variantId, quantity };
  if (attributes?.length) line.attributes = attributes;
  const data = await storefrontRequest<{
    cartLinesAdd: { cart: Cart | null; userErrors: ShopifyUserError[] };
  }>(credentials, ADD_CART_LINES, { cartId, lines: [line] });

  const { cart, userErrors } = data.cartLinesAdd;
  if (cart) return cart;
  throwOnUserErrors(userErrors, 'Could not update cart');
}

export async function storefrontRemoveCartLines(
  credentials: StorefrontCredentials,
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await storefrontRequest<{
    cartLinesRemove: { cart: Cart | null; userErrors: ShopifyUserError[] };
  }>(credentials, REMOVE_CART_LINES, { cartId, lineIds });

  const { cart, userErrors } = data.cartLinesRemove;
  if (cart) return cart;
  throwOnUserErrors(userErrors, 'Could not remove line');
}

export async function storefrontGetCart(
  credentials: StorefrontCredentials,
  cartId: string
): Promise<Cart | null> {
  const data = await storefrontRequest<{ cart: Cart | null }>(credentials, GET_CART, {
    cartId,
  });
  return data.cart;
}
