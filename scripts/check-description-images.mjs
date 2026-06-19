/**
 * Audit + generator for Shopify rich-text image health.
 *
 * Shopify hands us collection descriptions and blog articles as raw HTML with
 * embedded <img src="cdn.shopify.com/..."> tags. Those bypass next/image, so they
 * can be oversized (slow) or point at deleted files (404, broken-image icon).
 *
 * This script crawls every collection description and article body via the
 * Storefront API, HEAD-checks each Shopify CDN image, and writes the dead ones
 * (non-200) to lib/generated/dead-description-images.json. The render layer
 * (lib/description-html.ts) reads that list to strip dead <img> tags, and resizes
 * the survivors with a Shopify CDN width param.
 *
 * Run: node --env-file=.env.local scripts/check-description-images.mjs
 * Re-run before a deploy (or after Ting re-uploads images) to refresh the list.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const API_VERSION = '2026-04';
const OUT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'lib',
  'generated',
  'dead-description-images.json',
);

const domain =
  process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ??
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const blogHandle = process.env.SHOPIFY_BLOG_HANDLE?.trim() || 'news';

if (!domain || !token) {
  console.error('Missing SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN.');
  process.exit(1);
}

const graphqlUrl = `https://${domain}/api/${API_VERSION}/graphql.json`;

async function gql(query, variables) {
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify API ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(', '));
  return json.data;
}

const COLLECTIONS = `
  query Collections($first: Int!) {
    collections(first: $first) {
      edges { node { handle descriptionHtml } }
    }
  }`;

const ARTICLES = `
  query Articles($blogHandle: String!, $first: Int!) {
    blog(handle: $blogHandle) {
      articles(first: $first) {
        edges { node { handle contentHtml } }
      }
    }
  }`;

/** Pull every cdn.shopify.com image src out of an HTML blob. */
function extractCdnImages(html) {
  if (!html) return [];
  const out = [];
  const re = /<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const src = m[1];
    try {
      if (new URL(src).hostname === 'cdn.shopify.com') out.push(src);
    } catch {
      // ignore non-absolute/invalid srcs
    }
  }
  return out;
}

async function checkStatus(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status === 405) {
      // some origins reject HEAD; fall back to a ranged GET
      const g = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
      return g.status;
    }
    return res.status;
  } catch {
    return 0; // network failure
  }
}

async function main() {
  console.log('Fetching collections + articles via Storefront API...');
  const [colData, artData] = await Promise.all([
    gql(COLLECTIONS, { first: 100 }),
    gql(ARTICLES, { blogHandle, first: 100 }),
  ]);

  const sources = []; // { src, where }
  for (const e of colData.collections.edges) {
    for (const src of extractCdnImages(e.node.descriptionHtml)) {
      sources.push({ src, where: `collection:${e.node.handle}` });
    }
  }
  const articleEdges = artData.blog?.articles.edges ?? [];
  for (const e of articleEdges) {
    for (const src of extractCdnImages(e.node.contentHtml)) {
      sources.push({ src, where: `article:${e.node.handle}` });
    }
  }

  // De-duplicate by full URL for status checks.
  const uniqueUrls = [...new Set(sources.map((s) => s.src))];
  console.log(
    `Found ${sources.length} embedded Shopify images (${uniqueUrls.length} unique) across ${colData.collections.edges.length} collections + ${articleEdges.length} articles. Checking status...`,
  );

  const statusByUrl = new Map();
  // Limited concurrency to avoid hammering the CDN.
  const CONCURRENCY = 8;
  for (let i = 0; i < uniqueUrls.length; i += CONCURRENCY) {
    const batch = uniqueUrls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((u) => checkStatus(u)));
    batch.forEach((u, j) => statusByUrl.set(u, results[j]));
  }

  // Dead = anything not 200. Store the pathname (query-string-independent) so the
  // render-layer matcher ignores the ?v= version param.
  const deadPaths = new Set();
  const report = [];
  for (const { src, where } of sources) {
    const status = statusByUrl.get(src) ?? 0;
    if (status !== 200) {
      deadPaths.add(new URL(src).pathname);
      report.push({ where, status, src });
    }
  }

  const sorted = [...deadPaths].sort();
  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf8');

  console.log('');
  if (report.length === 0) {
    console.log('No dead images found. Wrote an empty denylist.');
  } else {
    console.log(`Dead / non-200 images (${report.length} occurrences, ${sorted.length} unique paths):`);
    for (const r of report) console.log(`  [${r.status}] ${r.where}  ${r.src}`);
  }
  console.log(`\nWrote ${sorted.length} dead path(s) to ${path.relative(process.cwd(), OUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
