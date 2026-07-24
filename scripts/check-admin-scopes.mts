/**
 * Read-only diagnostic: reports exactly which Shopify Admin API scopes the
 * existing OAuth client-credentials app has, and confirms live read access
 * to collections, products, blog articles, and Online Store pages.
 *
 * No mutation calls exist in this file. Safe to run any time.
 *
 * Usage:
 *   npx tsx scripts/check-admin-scopes.mts
 *
 * Requires in .env.local:
 *   SHOPIFY_STORE_DOMAIN
 *   SHOPIFY_ADMIN_CLIENT_ID
 *   SHOPIFY_ADMIN_CLIENT_SECRET
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET
const API = `https://${DOMAIN}/admin/api/2024-10/graphql.json`

if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET')
  process.exit(1)
}

let ADMIN_TOKEN: string | null = null
let GRANTED_SCOPE = ''

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
  if (!r.ok) {
    throw new Error(`Token exchange failed: ${r.status} ${await r.text()}`)
  }
  const j: { access_token: string; scope: string; expires_in: number } = await r.json()
  GRANTED_SCOPE = j.scope
  console.log(`Admin token acquired (expires in ${j.expires_in}s)`)
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

async function checkAccessScopes(): Promise<string[]> {
  const data = await gql<{ currentAppInstallation: { accessScopes: { handle: string }[] } }>(
    `query { currentAppInstallation { accessScopes { handle } } }`
  )
  return data.currentAppInstallation.accessScopes.map(s => s.handle)
}

async function readOne<T>(label: string, query: string): Promise<{ ok: boolean; detail: string }> {
  try {
    const data = await gql<T>(query)
    return { ok: true, detail: JSON.stringify(data) }
  } catch (e: any) {
    return { ok: false, detail: e.message }
  }
}

async function main() {
  await fetchAdminToken()
  const structuredScopes = await checkAccessScopes()

  console.log('\n=== Granted OAuth scopes ===')
  console.log('Raw token scope string:', GRANTED_SCOPE || '(empty)')
  console.log('Structured accessScopes:', structuredScopes.length ? structuredScopes.join(', ') : '(none)')

  const scopeSet = new Set(structuredScopes)
  const relevantScopes = {
    products_write: scopeSet.has('write_products'),
    products_read: scopeSet.has('read_products') || scopeSet.has('write_products'),
    content_write: scopeSet.has('write_content'),
    content_read: scopeSet.has('read_content') || scopeSet.has('write_content'),
  }

  console.log('\n=== Live read tests ===')
  const tests: { label: string; query: string }[] = [
    {
      label: 'collections',
      query: `query { collections(first: 1) { edges { node { id handle title } } } }`,
    },
    {
      label: 'products',
      query: `query { products(first: 1) { edges { node { id handle title } } } }`,
    },
    {
      label: 'blog articles',
      query: `query { blogs(first: 1) { edges { node { id handle articles(first: 1) { edges { node { id handle title } } } } } } }`,
    },
    {
      label: 'online store pages',
      query: `query { pages(first: 1) { edges { node { id handle title } } } }`,
    },
  ]

  const results: Record<string, { ok: boolean; detail: string }> = {}
  for (const t of tests) {
    results[t.label] = await readOne(t.label, t.query)
    console.log(`  [${results[t.label].ok ? 'OK' : 'FAIL'}] ${t.label}: ${results[t.label].detail}`)
  }

  console.log('\n=== Verdict: can we EDIT each resource? ===')
  console.log(
    `  collections:        write scope ${relevantScopes.products_write ? 'YES' : 'NO'} (write_products), read test ${results['collections'].ok ? 'passed' : 'FAILED'}`
  )
  console.log(
    `  products:            write scope ${relevantScopes.products_write ? 'YES' : 'NO'} (write_products), read test ${results['products'].ok ? 'passed' : 'FAILED'}`
  )
  console.log(
    `  blog articles:       write scope ${relevantScopes.content_write ? 'YES' : 'NO'} (write_content), read test ${results['blog articles'].ok ? 'passed' : 'FAILED'}`
  )
  console.log(
    `  online store pages:  write scope ${relevantScopes.content_write ? 'YES' : 'NO'} (write_content), read test ${results['online store pages'].ok ? 'passed' : 'FAILED'}`
  )
  console.log('\nNote: scope presence + a passing read test is strong evidence a write mutation will succeed,')
  console.log('but this script performs no writes. Collections and articles already have a proven write path')
  console.log('(scripts/restore-content.mts, scripts/clean-broken-imgs.mts).')
}

main().catch(e => {
  console.error('Failed:', e.message)
  process.exit(1)
})
