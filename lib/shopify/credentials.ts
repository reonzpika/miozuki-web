/** Used by Server Components, Route Handlers, and shared cart backends. Prefer unprefixed env; NEXT_PUBLIC_* is the browser fallback bundle. */

export const STOREFRONT_API_VERSION = '2026-04';

export type StorefrontCredentials = {
  graphqlUrl: string;
  token: string;
};

export function getStorefrontCredentials(): StorefrontCredentials | null {
  const domain =
    process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain?.trim() || !token?.trim()) return null;
  return {
    graphqlUrl: `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    token,
  };
}
