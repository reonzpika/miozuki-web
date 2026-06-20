import type { Article, Collection, Product, ShopifyResponse } from './types';
import {
  GET_COLLECTIONS,
  GET_COLLECTION_BY_HANDLE,
  GET_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_BLOG_ARTICLES,
  GET_ARTICLE_BY_HANDLE,
} from './queries';
import { getStorefrontBlogHandle, getStorefrontCredentials } from './credentials';

/** When unset (e.g. CI without secrets), returns null so callers can skip work; production should always set env. */
async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate = 60,
): Promise<T | null> {
  const cfg = getStorefrontCredentials();
  if (!cfg) return null;
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
    const handle =
      typeof variables?.handle === 'string' ? variables.handle : undefined;
    console.error('Shopify HTTP error', {
      status: res.status,
      statusText: res.statusText,
      handle,
    });
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json: ShopifyResponse<T> = await res.json();

  if (json.errors?.length) {
    const handle =
      typeof variables?.handle === 'string' ? variables.handle : undefined;
    const messages = json.errors.map((e) => e.message);
    console.error('Shopify GraphQL errors', { messages, handle });
    throw new Error(messages.join(', '));
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

/**
 * Pin a Shopify hosted-video source URL to cdn.shopify.com.
 *
 * Shopify returns video `sources[].url` on the shop's PRIMARY domain
 * (e.g. https://miozuki.co.nz/cdn/shop/videos/...), not on cdn.shopify.com the
 * way images are. After the storefront cutover that domain serves Vercel, which
 * has no /cdn/shop route and returns a 404 HTML page, so the <video> receives
 * HTML instead of MP4 and never plays. cdn.shopify.com serves the identical
 * asset at /videos/... independent of the shop domain, so rewrite to it.
 * Image URLs (already on cdn.shopify.com) and any non /cdn/shop/ URL are untouched.
 */
export function normalizeShopifyVideoUrl(url: string): string {
  return url.replace(/^https?:\/\/[^/]+\/cdn\/shop\//i, 'https://cdn.shopify.com/');
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{ productByHandle: Product | null }>(
    GET_PRODUCT_BY_HANDLE,
    { handle },
  );
  if (!data) return null;
  const product = data.productByHandle;
  if (product) {
    for (const { node } of product.media.edges) {
      if (node.mediaContentType === 'VIDEO') {
        node.sources = node.sources.map((s) => ({
          ...s,
          url: normalizeShopifyVideoUrl(s.url),
        }));
      }
    }
  }
  return product;
}

// Collections

export async function getCollections(first = 20): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { edges: { node: Collection }[] } }>(
    GET_COLLECTIONS,
    { first },
  );
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

export async function getBlogArticles(
  blogHandle = getStorefrontBlogHandle(),
  first = 50,
): Promise<Article[]> {
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
