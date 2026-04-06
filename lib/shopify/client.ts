import type { Article, Collection, Product, ShopifyResponse } from './types';
import {
  GET_COLLECTIONS,
  GET_COLLECTION_BY_HANDLE,
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_BLOG_ARTICLES,
  GET_ARTICLE_BY_HANDLE,
} from './queries';

const API_VERSION = '2026-04';

/** Server RSC reads prefer unprefixed vars; fall back to NEXT_PUBLIC_* so one Vercel env set works at build. */
function getServerShopifyConfig(): { graphqlUrl: string; token: string } | null {
  const domain =
    process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) return null;
  return {
    graphqlUrl: `https://${domain}/api/${API_VERSION}/graphql.json`,
    token,
  };
}

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate = 60,
): Promise<T> {
  const cfg = getServerShopifyConfig();
  if (!cfg) {
    throw new Error(
      'Missing Shopify Storefront env: set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN, or NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN.',
    );
  }
  const res = await fetch(cfg.graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': cfg.token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json: ShopifyResponse<T> = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }

  return json.data;
}

// Products

export async function getProducts(first = 24): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { edges: { node: Product }[] } }>(
    GET_PRODUCTS,
    { first }
  );
  return data.products.edges.map((e) => e.node);
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ productByHandle: Product | null }>(
    GET_PRODUCT_BY_HANDLE,
    { handle }
  );
  return data.productByHandle;
}

// Collections

export async function getCollections(first = 20): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { edges: { node: Collection }[] } }>(
    GET_COLLECTIONS,
    { first }
  );
  return data.collections.edges.map((e) => e.node);
}

export async function getCollectionByHandle(
  handle: string,
  productsFirst = 24
): Promise<Collection | null> {
  const data = await shopifyFetch<{ collectionByHandle: Collection | null }>(
    GET_COLLECTION_BY_HANDLE,
    { handle, productsFirst }
  );
  return data.collectionByHandle;
}

// Blog

export async function getBlogArticles(blogHandle = 'news', first = 50): Promise<Article[]> {
  const data = await shopifyFetch<{
    blog: { articles: { edges: { node: Article }[] } } | null;
  }>(GET_BLOG_ARTICLES, { blogHandle, first }, 3600);
  return data.blog?.articles.edges.map((e) => e.node) ?? [];
}

export async function getArticleByHandle(
  blogHandle: string,
  articleHandle: string
): Promise<Article | null> {
  const data = await shopifyFetch<{
    blog: { articleByHandle: Article | null } | null;
  }>(GET_ARTICLE_BY_HANDLE, { blogHandle, articleHandle }, 86400);
  return data.blog?.articleByHandle ?? null;
}
