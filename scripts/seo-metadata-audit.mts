/**
 * Audit (and optionally fill) Shopify SEO metadata via the Admin API.
 *
 * What it does:
 *   - Pulls every product and collection with its SEO fields (the Shopify
 *     admin "Search engine listing" title/description) and image alt text.
 *   - Reports what is missing: SEO descriptions, SEO titles, image alt text.
 *   - With --apply, writes a crafted meta description ONLY where the SEO
 *     description is currently empty (never overwrites anything hand-written),
 *     built from verified store facts. Alt text is report-only: describing an
 *     image is a human call (Ting's lane).
 *
 * The storefront reads these fields since the same-day code change
 * (lib/meta-description.ts + generateMetadata in the product/collection pages),
 * preferring Shopify SEO fields over truncated body copy.
 *
 * Usage:
 *   npx tsx scripts/seo-metadata-audit.mts            # dry-run report
 *   npx tsx scripts/seo-metadata-audit.mts --apply    # fill EMPTY SEO descriptions
 *
 * Requires in .env.local: SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID,
 * SHOPIFY_ADMIN_CLIENT_SECRET (same OAuth client-credentials app as
 * clean-broken-imgs.mts; scopes read_products/write_products).
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET
const APPLY = process.argv.includes('--apply')
const API = `https://${DOMAIN}/admin/api/2024-10/graphql.json`

if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET')
  process.exit(1)
}

let ADMIN_TOKEN: string | null = null

async function fetchAdminToken(): Promise<string> {
  if (ADMIN_TOKEN) return ADMIN_TOKEN
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
  })
  const r = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!r.ok) throw new Error(`Token exchange failed: ${r.status} ${await r.text()}`)
  const j: { access_token: string; expires_in: number; scope: string } = await r.json()
  console.log(`Admin token acquired (expires in ${j.expires_in}s, scope: ${j.scope})`)
  ADMIN_TOKEN = j.access_token
  return ADMIN_TOKEN
}

type GQL<T> = { data?: T; errors?: { message: string }[] }

async function gql<T>(query: string, variables: object = {}): Promise<T> {
  const token = await fetchAdminToken()
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const j: GQL<T> = await r.json()
  if (j.errors?.length) throw new Error(j.errors.map(e => e.message).join('; '))
  return j.data!
}

interface ProductNode {
  id: string
  title: string
  handle: string
  status: string
  seo: { title: string | null; description: string | null }
  images: { edges: { node: { id: string; altText: string | null } }[] }
}

interface CollectionNode {
  id: string
  title: string
  handle: string
  seo: { title: string | null; description: string | null }
}

/** Meta description from verified facts only. Kept under 160 chars. */
function productMetaDescription(title: string, handle = ''): string {
  if (handle.includes('ring-sizer')) {
    return 'Order a Miozuki ring sizer before your made-to-order ring; the cost is credited toward your ring purchase. Get your size right the first time.'
  }
  const t = title.toLowerCase()
  const stone = t.includes('pearl') ? 'freshwater pearl' : 'moissanite'
  let kind = 'jewellery'
  if (t.includes('ring')) kind = t.includes('pearl') ? 'ring' : 'ring, made to order in 4-6 weeks'
  else if (t.includes('stud') || t.includes('earring') || t.includes('hoop') || t.includes('drop') || t.includes('huggie')) kind = 'earrings'
  else if (t.includes('necklace') || t.includes('pendant')) kind = 'necklace'
  else if (t.includes('bracelet')) kind = 'bracelet'
  const desc = `${title}: ${stone} ${kind} in S925 sterling silver, designed in Auckland. Free NZ shipping over $300; ships to NZ & Australia.`
  return desc.length <= 160 ? desc : `${title}: ${stone} ${kind} in S925 sterling silver, designed in Auckland.`
}

async function run() {
  const productsData = await gql<{ products: { edges: { node: ProductNode }[] } }>(/* GraphQL */ `
    query {
      products(first: 100) {
        edges {
          node {
            id
            title
            handle
            status
            seo { title description }
            images(first: 12) { edges { node { id altText } } }
          }
        }
      }
    }
  `)
  const collectionsData = await gql<{ collections: { edges: { node: CollectionNode }[] } }>(/* GraphQL */ `
    query {
      collections(first: 50) {
        edges { node { id title handle seo { title description } } }
      }
    }
  `)

  const products = productsData.products.edges.map(e => e.node).filter(p => p.status === 'ACTIVE')
  const collections = collectionsData.collections.edges.map(e => e.node)

  const missingSeoDesc = products.filter(p => !p.seo.description?.trim())
  const missingSeoTitle = products.filter(p => !p.seo.title?.trim())
  const missingAlt = products
    .map(p => ({
      handle: p.handle,
      title: p.title,
      missing: p.images.edges.filter(e => !e.node.altText?.trim()).length,
      total: p.images.edges.length,
    }))
    .filter(p => p.missing > 0)
  const collectionsMissingDesc = collections.filter(c => !c.seo.description?.trim())

  console.log(`\n=== SEO metadata audit (${products.length} active products, ${collections.length} collections) ===`)
  console.log(`Products missing SEO description: ${missingSeoDesc.length}`)
  console.log(`Products missing SEO title:       ${missingSeoTitle.length} (left alone; product titles serve as titles)`)
  console.log(`Products with missing image alt:  ${missingAlt.length}`)
  console.log(`Collections missing SEO desc:     ${collectionsMissingDesc.length} (left alone; Ting's descriptions email in flight)`)

  console.log('\n--- Products missing SEO description (planned fill) ---')
  for (const p of missingSeoDesc) {
    console.log(`\n${p.handle}`)
    console.log(`  -> ${productMetaDescription(p.title, p.handle)}`)
  }

  console.log('\n--- Image alt gaps (for Ting; not auto-filled) ---')
  for (const p of missingAlt) console.log(`  ${p.handle}: ${p.missing}/${p.total} images without alt text`)

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to fill the empty SEO descriptions above.')
    return
  }

  console.log('\nApplying SEO descriptions to products with empty fields...')
  let ok = 0
  for (const p of missingSeoDesc) {
    const result = await gql<{ productUpdate: { userErrors: { field: string[]; message: string }[] } }>(
      /* GraphQL */ `
        mutation FillSeo($input: ProductInput!) {
          productUpdate(input: $input) { userErrors { field message } }
        }
      `,
      { input: { id: p.id, seo: { description: productMetaDescription(p.title, p.handle) } } }
    )
    const errs = result.productUpdate.userErrors
    if (errs.length) console.error(`  FAILED ${p.handle}: ${errs.map(e => e.message).join('; ')}`)
    else { ok += 1; console.log(`  ok ${p.handle}`) }
  }
  console.log(`\nDone: ${ok}/${missingSeoDesc.length} products updated.`)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
