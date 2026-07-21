/**
 * Apply a new descriptionHtml to ONE Shopify collection, by handle.
 *
 * Built for the staged collection-description rollout (vault task
 * miozuki-20260710-002): one collection per 14-day canary gate, never a bulk
 * swap. The canonical HTML blocks live in the vault plan doc
 * (collection-description-rewrite-fable-plan-2026-07-11.md); pass one block
 * as a file. Rollback: scripts/restore-content.mts with the pre-write
 * snapshot in docs/audit/.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/apply-collection-description.mts <handle> <html-file>            # dry-run
 *   npx tsx --env-file=.env.local scripts/apply-collection-description.mts <handle> <html-file> --apply    # write
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
const [handle, htmlFile] = process.argv.slice(2).filter(a => !a.startsWith('--'))
const API = `https://${DOMAIN}/admin/api/2024-10/graphql.json`

if (!DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET')
  process.exit(1)
}
if (!handle || !htmlFile || !fs.existsSync(htmlFile)) {
  console.error('Usage: npx tsx --env-file=.env.local scripts/apply-collection-description.mts <handle> <html-file> [--apply]')
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
  const j: { access_token: string; expires_in: number } = await r.json()
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

async function main() {
  const html = fs.readFileSync(htmlFile!, 'utf8').trim()
  console.log(`Mode: ${APPLY ? 'APPLY (will write)' : 'dry-run'}`)
  console.log(`Collection handle: ${handle}`)
  console.log(`New description: ${html.length} chars from ${htmlFile}`)
  console.log('---')

  const found = await gql<{
    collectionByHandle: { id: string; title: string; descriptionHtml: string } | null
  }>(
    `query($handle: String!) {
      collectionByHandle(handle: $handle) { id title descriptionHtml }
    }`,
    { handle }
  )
  const col = found.collectionByHandle
  if (!col) throw new Error(`No collection found for handle "${handle}"`)
  console.log(`Found: ${col.title} (${col.id})`)
  console.log(`Current description: ${col.descriptionHtml.length} chars`)
  console.log(`New description preview:\n${html.slice(0, 300)}...`)

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to write.')
    return
  }

  const data = await gql<{ collectionUpdate: { userErrors: { field: string[]; message: string }[] } }>(
    `mutation($input: CollectionInput!) {
      collectionUpdate(input: $input) { userErrors { field message } }
    }`,
    { input: { id: col.id, descriptionHtml: html } }
  )
  const errs = data.collectionUpdate.userErrors
  if (errs.length) throw new Error(errs.map(e => `${e.field.join('.')}: ${e.message}`).join('; '))
  console.log('\n✓ Written. Verify the live page, then log the swap in phase5-scoreboard.')
}

main().catch(e => {
  console.error('Failed:', e.message)
  process.exit(1)
})
