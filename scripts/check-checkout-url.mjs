/**
 * Cutover gate test: which host does Shopify return for checkout?
 *
 * Creates a real cart via the Storefront API (one line item) and prints
 * cart.checkoutUrl. Used at the cutover window AFTER designating
 * checkout.miozuki.co.nz as an Alias domain, to confirm checkoutUrl returns
 * the checkout subdomain BEFORE flipping DNS. If it still returns the apex
 * (miozuki.co.nz), do NOT flip, checkout would break once the apex points at Vercel.
 *
 * Run: node --env-file=.env.local scripts/check-checkout-url.mjs
 */

const API_VERSION = '2026-04';
const domain =
  process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !token) {
  console.error('Missing SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN.');
  process.exit(1);
}

const url = `https://${domain}/api/${API_VERSION}/graphql.json`;

async function gql(query, variables) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(', '));
  return json.data;
}

const FIRST_VARIANT = `
  query {
    products(first: 5) {
      edges { node { title variants(first: 5) { edges { node { id availableForSale } } } } }
    }
  }`;

const CART_CREATE = `
  mutation CartCreate($id: ID!) {
    cartCreate(input: { lines: [{ quantity: 1, merchandiseId: $id }] }) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }`;

async function main() {
  const data = await gql(FIRST_VARIANT);
  let variantId = null;
  let productTitle = null;
  for (const p of data.products.edges) {
    const v = p.node.variants.edges.find((e) => e.node.availableForSale) ?? p.node.variants.edges[0];
    if (v) {
      variantId = v.node.id;
      productTitle = p.node.title;
      break;
    }
  }
  if (!variantId) throw new Error('No purchasable variant found to build a test cart.');

  const res = await gql(CART_CREATE, { id: variantId });
  const errs = res.cartCreate.userErrors;
  if (errs?.length) throw new Error(errs.map((e) => e.message).join(', '));

  const checkoutUrl = res.cartCreate.cart.checkoutUrl;
  const host = new URL(checkoutUrl).host;

  console.log(`Test product:  ${productTitle}`);
  console.log(`checkoutUrl:   ${checkoutUrl}`);
  console.log(`host:          ${host}`);
  console.log('');
  if (host === 'checkout.miozuki.co.nz') {
    console.log('PASS: checkoutUrl returns the checkout subdomain. Safe to flip DNS.');
  } else {
    console.log(`STOP: checkoutUrl host is "${host}", not checkout.miozuki.co.nz.`);
    console.log('Do NOT flip DNS yet, checkout would break once the apex points at Vercel.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
