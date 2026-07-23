/**
 * Read-only snapshot of the live product catalogue for the overnight
 * Instagram/Pinterest content-distribution pipeline (workstream A of the
 * 2026-07-23 organic-growth plan). Pulls title, handle, from-price, primary
 * image, tags, product type, and the collections each product belongs to,
 * so the caption/pin-copy drafting step has real facts to work from instead
 * of guessing prices or availability.
 *
 * Storefront API only ever returns published products, so no separate
 * active/draft filter is needed here (unlike the Admin API scripts in this
 * folder).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/pull-product-catalogue.mts
 *
 * Requires in .env.local: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN
 * (same public Storefront token every storefront page already uses).
 */

import * as fs from 'fs'
import * as path from 'path'

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const API_VERSION = '2024-10'
const API = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`

if (!DOMAIN || !TOKEN) {
  console.error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN')
  process.exit(1)
}

type GQL<T> = { data?: T; errors?: { message: string }[] }

async function gql<T>(query: string, variables: object = {}): Promise<T> {
  const r = await fetch(API, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  const j: GQL<T> = await r.json()
  if (j.errors?.length) throw new Error(j.errors.map((e) => e.message).join('; '))
  return j.data!
}

interface ProductNode {
  id: string
  handle: string
  title: string
  tags: string[]
  productType: string
  featuredImage: { url: string; altText: string | null } | null
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  collections: { edges: { node: { handle: string; title: string } }[] }
}

const QUERY = /* GraphQL */ `
  query CatalogueSnapshot($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          tags
          productType
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
          collections(first: 5) { edges { node { handle title } } }
        }
      }
    }
  }
`

interface CatalogueItem {
  handle: string
  title: string
  fromPrice: number
  currency: string
  productType: string
  tags: string[]
  imageUrl: string | null
  imageAlt: string | null
  collections: { handle: string; title: string }[]
  productUrl: string
}

async function run() {
  const data = await gql<{ products: { edges: { node: ProductNode }[] } }>(QUERY, { first: 100 })
  const items: CatalogueItem[] = data.products.edges.map(({ node: p }) => ({
    handle: p.handle,
    title: p.title,
    fromPrice: Math.round(Number(p.priceRange.minVariantPrice.amount)),
    currency: p.priceRange.minVariantPrice.currencyCode,
    productType: p.productType,
    tags: p.tags,
    imageUrl: p.featuredImage?.url ?? null,
    imageAlt: p.featuredImage?.altText ?? null,
    collections: p.collections.edges.map((e) => e.node),
    productUrl: `/products/${p.handle}`,
  }))

  const date = new Date().toISOString().split('T')[0]
  const outDir = path.resolve(process.cwd(), 'docs/audit')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `product-catalogue-snapshot-${date}.json`)
  fs.writeFileSync(outPath, JSON.stringify({ fetchedAt: new Date().toISOString(), count: items.length, items }, null, 2))

  console.log(`Wrote ${items.length} products to ${outPath}`)
  const byType = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.productType || '(none)'] = (acc[i.productType || '(none)'] ?? 0) + 1
    return acc
  }, {})
  console.log('By product type:', byType)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
