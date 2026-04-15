/**
 * Restore Shopify collection descriptions and blog article bodies from a backup
 * snapshot produced by clean-broken-imgs.mts.
 *
 * Usage:
 *   npx tsx scripts/restore-content.mts <backup-file>            # dry-run
 *   npx tsx scripts/restore-content.mts <backup-file> --apply    # write
 *
 * Requires in .env.local:
 *   SHOPIFY_STORE_DOMAIN
 *   SHOPIFY_ADMIN_CLIENT_ID
 *   SHOPIFY_ADMIN_CLIENT_SECRET
 */

import * as fs from 'fs'

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET
const APPLY = process.argv.includes('--apply')
const fileArg = process.argv.find((a, i) => i >= 2 && !a.startsWith('--'))
const API = `https://${DOMAIN}/admin/api/2024-10/graphql.json`

if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET')
  process.exit(1)
}
if (!fileArg) {
  console.error('Usage: npx tsx scripts/restore-content.mts <backup-file> [--apply]')
  process.exit(1)
}
if (!fs.existsSync(fileArg)) {
  console.error(`Backup file not found: ${fileArg}`)
  process.exit(1)
}

type Backup = {
  date: string
  collections: { id: string; handle: string; title: string; descriptionHtml: string }[]
  articles: { id: string; handle: string; blogHandle: string; title: string; body: string }[]
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
  const j: { access_token: string; scope: string; expires_in: number } = await r.json()
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

async function updateCollection(id: string, descriptionHtml: string): Promise<void> {
  const data = await gql<{ collectionUpdate: { userErrors: { field: string[]; message: string }[] } }>(
    `mutation($input: CollectionInput!) {
      collectionUpdate(input: $input) { userErrors { field message } }
    }`,
    { input: { id, descriptionHtml } }
  )
  const errs = data.collectionUpdate.userErrors
  if (errs.length) throw new Error(errs.map(e => `${e.field.join('.')}: ${e.message}`).join('; '))
}

async function updateArticle(id: string, body: string): Promise<void> {
  const data = await gql<{ articleUpdate: { userErrors: { field: string[]; message: string }[] } }>(
    `mutation($id: ID!, $article: ArticleUpdateInput!) {
      articleUpdate(id: $id, article: $article) { userErrors { field message } }
    }`,
    { id, article: { body } }
  )
  const errs = data.articleUpdate.userErrors
  if (errs.length) throw new Error(errs.map(e => `${e.field.join('.')}: ${e.message}`).join('; '))
}

async function main() {
  const backup: Backup = JSON.parse(fs.readFileSync(fileArg!, 'utf8'))
  console.log(`Mode: ${APPLY ? 'APPLY (will write)' : 'dry-run'}`)
  console.log(`Backup: ${fileArg}`)
  console.log(`Snapshot date: ${backup.date}`)
  console.log(`Collections to restore: ${backup.collections.length}`)
  console.log(`Articles to restore:    ${backup.articles.length}`)
  console.log('---')

  for (const c of backup.collections) {
    console.log(`[collection] ${c.handle} (${c.descriptionHtml.length} chars)`)
    if (APPLY) {
      await updateCollection(c.id, c.descriptionHtml)
      console.log(`  ✓ restored`)
    }
  }
  for (const a of backup.articles) {
    console.log(`[article] ${a.blogHandle}/${a.handle} (${a.body.length} chars)`)
    if (APPLY) {
      await updateArticle(a.id, a.body)
      console.log(`  ✓ restored`)
    }
  }

  console.log('\n---')
  console.log(`Total items: ${backup.collections.length + backup.articles.length}`)
  if (!APPLY) console.log('Re-run with --apply to write changes.')
}

main().catch(e => {
  console.error('Failed:', e.message)
  process.exit(1)
})
