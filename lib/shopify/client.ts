import type { Article, Collection, Product, ShopifyResponse } from './types';
import {
  GET_COLLECTIONS,
  GET_COLLECTION_BY_HANDLE,
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_BLOG_ARTICLES,
  GET_ARTICLE_BY_HANDLE,
} from './queries';
import { getStorefrontCredentials } from './credentials';

/** When unset (e.g. CI without secrets), returns null so callers can skip work; production should always set env. */
async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate = 60,
): Promise<T | null> {
  const cfg = getStorefrontCredentials();
  if (!cfg) {
    // #region agent log
    fetch('http://127.0.0.1:7400/ingest/cfd5bf20-a163-4b92-8de1-9c7863644574', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b033c9' },
      body: JSON.stringify({
        sessionId: 'b033c9',
        location: 'lib/shopify/client.ts:shopifyFetch',
        message: 'no storefront credentials',
        data: { revalidate },
        timestamp: Date.now(),
        runId: 'pre-fix',
        hypothesisId: 'H1',
      }),
    }).catch(() => {});
    // #endregion
    return null;
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
    // #region agent log
    fetch('http://127.0.0.1:7400/ingest/cfd5bf20-a163-4b92-8de1-9c7863644574', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b033c9' },
      body: JSON.stringify({
        sessionId: 'b033c9',
        location: 'lib/shopify/client.ts:shopifyFetch',
        message: 'Shopify HTTP error',
        data: { status: res.status, statusText: res.statusText },
        timestamp: Date.now(),
        runId: 'pre-fix',
        hypothesisId: 'H2',
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json: ShopifyResponse<T> = await res.json();

  if (json.errors?.length) {
    // #region agent log
    fetch('http://127.0.0.1:7400/ingest/cfd5bf20-a163-4b92-8de1-9c7863644574', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b033c9' },
      body: JSON.stringify({
        sessionId: 'b033c9',
        location: 'lib/shopify/client.ts:shopifyFetch',
        message: 'Shopify GraphQL errors',
        data: { errorMessages: json.errors.map((e) => e.message).slice(0, 3) },
        timestamp: Date.now(),
        runId: 'pre-fix',
        hypothesisId: 'H2',
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }

  return json.data;
}

// Products

export async function getProducts(first = 24): Promise<Product[]> {
  const data = await shopifyFetch<{ products: { edges: { node: Product }[] } }>(
    GET_PRODUCTS,
    { first },
  );
  if (!data) return [];
  return data.products.edges.map((e) => e.node);
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ productByHandle: Product | null }>(
    GET_PRODUCT_BY_HANDLE,
    { handle },
  );
  if (!data) return null;
  return data.productByHandle;
}

// Collections

export async function getCollections(first = 20): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { edges: { node: Collection }[] } }>(
    GET_COLLECTIONS,
    { first },
  );
  // #region agent log
  const edgesCount = data?.collections?.edges?.length ?? 0;
  fetch('http://127.0.0.1:7400/ingest/cfd5bf20-a163-4b92-8de1-9c7863644574', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b033c9' },
    body: JSON.stringify({
      sessionId: 'b033c9',
      location: 'lib/shopify/client.ts:getCollections',
      message: 'getCollections shopify response',
      data: { first, dataIsNull: data == null, edgesCount },
      timestamp: Date.now(),
      runId: 'pre-fix',
      hypothesisId: 'H1',
    }),
  }).catch(() => {});
  // #endregion
  if (!data) return [];
  return data.collections.edges.map((e) => e.node);
}

export async function getCollectionByHandle(
  handle: string,
  productsFirst = 24,
): Promise<Collection | null> {
  const data = await shopifyFetch<{ collectionByHandle: Collection | null }>(
    GET_COLLECTION_BY_HANDLE,
    { handle, productsFirst },
  );
  if (!data) return null;
  return data.collectionByHandle;
}

// Blog

export async function getBlogArticles(blogHandle = 'news', first = 50): Promise<Article[]> {
  const data = await shopifyFetch<{
    blog: { articles: { edges: { node: Article }[] } } | null;
  }>(GET_BLOG_ARTICLES, { blogHandle, first }, 3600);
  if (!data) return [];
  return data.blog?.articles.edges.map((e) => e.node) ?? [];
}

export async function getArticleByHandle(
  blogHandle: string,
  articleHandle: string,
): Promise<Article | null> {
  const data = await shopifyFetch<{
    blog: { articleByHandle: Article | null } | null;
  }>(GET_ARTICLE_BY_HANDLE, { blogHandle, articleHandle }, 86400);
  if (!data) return null;
  return data.blog?.articleByHandle ?? null;
}
