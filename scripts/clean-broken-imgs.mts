/**
 * Clean broken <img> references out of Shopify collection descriptions and blog
 * article contents via the Admin API.
 *
 * Usage:
 *   npx tsx scripts/clean-broken-imgs.mts            # dry-run (default)
 *   npx tsx scripts/clean-broken-imgs.mts --apply    # actually write changes
 *
 * Requires in .env.local:
 *   SHOPIFY_STORE_DOMAIN
 *   SHOPIFY_ADMIN_CLIENT_ID
 *   SHOPIFY_ADMIN_CLIENT_SECRET
 *
 * Uses the OAuth client credentials grant (post-2026 Dev Dashboard apps)
 * to obtain a short-lived Admin API access token.
 * App must have scopes: read_products, write_products, read_content, write_content.
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
  if (!r.ok) {
    throw new Error(`Token exchange failed: ${r.status} ${await r.text()}`)
  }
  const j: { access_token: string; scope: string; expires_in: number } = await r.json()
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

// HEAD check with small concurrency cap
const checkCache = new Map<string, boolean>()
async function isAlive(url: string): Promise<boolean> {
  if (checkCache.has(url)) return checkCache.get(url)!
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    const alive = r.status >= 200 && r.status < 400
    checkCache.set(url, alive)
    return alive
  } catch {
    checkCache.set(url, false)
    return false
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let i = 0
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx])
    }
  })
  await Promise.all(workers)
  return out
}

// Extract <img ...> tags with their src attribute
function extractImgSrcs(html: string): string[] {
  const srcs: string[] = []
  const rx = /<img\b[^>]*?\bsrc="([^"]+)"[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = rx.exec(html)) !== null) srcs.push(decodeHtml(m[1]))
  return srcs
}

function decodeHtml(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

// Remove <img> tags whose src matches deadSet. Also collapse empty <figure> / <p>
// wrappers that end up containing only whitespace after removal.
function stripDeadImgs(html: string, deadSet: Set<string>): { cleaned: string; removed: number } {
  let removed = 0
  // 1. Strip the <img> tags themselves
  let cleaned = html.replace(/<img\b[^>]*?\bsrc="([^"]+)"[^>]*>/gi, (match, src) => {
    if (deadSet.has(decodeHtml(src))) {
      removed++
      return ''
    }
    return match
  })
  // 2. Collapse empty wrappers (figure, p, div) left behind
  for (const tag of ['figure', 'p', 'div']) {
    const rx = new RegExp(`<${tag}\\b[^>]*>\\s*</${tag}>`, 'gi')
    cleaned = cleaned.replace(rx, '')
  }
  return { cleaned, removed }
}

// ---- Shopify fetchers ----

type CollectionNode = { id: string; handle: string; title: string; descriptionHtml: string }
type ArticleNode = { id: string; handle: string; title: string; body: string; blog: { handle: string } }

async function fetchAllCollections(): Promise<CollectionNode[]> {
  const items: CollectionNode[] = []
  let cursor: string | null = null
  while (true) {
    const data = await gql<{ collections: { edges: { cursor: string; node: CollectionNode }[]; pageInfo: { hasNextPage: boolean } } }>(
      `query($cursor: String) {
        collections(first: 100, after: $cursor) {
          edges { cursor node { id handle title descriptionHtml } }
          pageInfo { hasNextPage }
        }
      }`,
      { cursor }
    )
    for (const e of data.collections.edges) items.push(e.node)
    if (!data.collections.pageInfo.hasNextPage) break
    cursor = data.collections.edges[data.collections.edges.length - 1].cursor
  }
  return items
}

async function fetchAllArticles(): Promise<ArticleNode[]> {
  const items: ArticleNode[] = []
  let cursor: string | null = null
  while (true) {
    const data = await gql<{ articles: { edges: { cursor: string; node: ArticleNode }[]; pageInfo: { hasNextPage: boolean } } }>(
      `query($cursor: String) {
        articles(first: 50, after: $cursor) {
          edges { cursor node { id handle title body blog { handle } } }
          pageInfo { hasNextPage }
        }
      }`,
      { cursor }
    )
    for (const e of data.articles.edges) items.push(e.node)
    if (!data.articles.pageInfo.hasNextPage) break
    cursor = data.articles.edges[data.articles.edges.length - 1].cursor
  }
  return items
}

// ---- Shopify mutations ----

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

// ---- Main ----

async function processItem(label: string, html: string): Promise<{ dead: string[]; cleaned: string; removed: number }> {
  const srcs = extractImgSrcs(html)
  if (srcs.length === 0) return { dead: [], cleaned: html, removed: 0 }
  const alive = await mapLimit(srcs, 8, async src => ({ src, alive: await isAlive(src) }))
  const dead = alive.filter(x => !x.alive).map(x => x.src)
  if (dead.length === 0) return { dead: [], cleaned: html, removed: 0 }
  const deadSet = new Set(dead)
  const { cleaned, removed } = stripDeadImgs(html, deadSet)
  console.log(`  ${label}: ${srcs.length} imgs, ${dead.length} dead, ${removed} removed`)
  for (const s of dead.slice(0, 3)) console.log(`    × ${s.slice(0, 140)}`)
  if (dead.length > 3) console.log(`    … and ${dead.length - 3} more`)
  return { dead, cleaned, removed }
}

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (will write changes)' : 'dry-run'}`)
  console.log('---')

  console.log('Fetching collections…')
  const collections = await fetchAllCollections()
  console.log(`Got ${collections.length} collections`)

  console.log('\nFetching articles…')
  const articles = await fetchAllArticles()
  console.log(`Got ${articles.length} articles`)

  const backup: {
    date: string
    collections: { id: string; handle: string; title: string; descriptionHtml: string }[]
    articles: { id: string; handle: string; blogHandle: string; title: string; body: string }[]
  } = { date: new Date().toISOString(), collections: [], articles: [] }

  let totalDead = 0
  let touched = 0

  console.log('\n=== COLLECTIONS ===')
  for (const c of collections) {
    const { dead, cleaned } = await processItem(`[collection] ${c.handle}`, c.descriptionHtml ?? '')
    if (dead.length > 0) {
      backup.collections.push({ id: c.id, handle: c.handle, title: c.title, descriptionHtml: c.descriptionHtml ?? '' })
      totalDead += dead.length
      touched++
      if (APPLY) {
        await updateCollection(c.id, cleaned)
        console.log(`    ✓ updated ${c.handle}`)
      }
    }
  }

  console.log('\n=== ARTICLES ===')
  for (const a of articles) {
    const { dead, cleaned } = await processItem(`[article] ${a.blog.handle}/${a.handle}`, a.body ?? '')
    if (dead.length > 0) {
      backup.articles.push({ id: a.id, handle: a.handle, blogHandle: a.blog.handle, title: a.title, body: a.body ?? '' })
      totalDead += dead.length
      touched++
      if (APPLY) {
        await updateArticle(a.id, cleaned)
        console.log(`    ✓ updated ${a.handle}`)
      }
    }
  }

  // Write backup snapshot (always, so dry-run also produces a restore file)
  if (touched > 0) {
    const { default: fs } = await import('fs')
    const { default: path } = await import('path')
    const dir = path.resolve(process.cwd(), 'docs/audit')
    fs.mkdirSync(dir, { recursive: true })
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const file = path.join(dir, `shopify-content-backup-${stamp}.json`)
    fs.writeFileSync(file, JSON.stringify(backup, null, 2))
    console.log(`\nBackup snapshot: ${file}`)
  }

  console.log('\n---')
  console.log(`Summary: ${totalDead} dead imgs across ${touched} item(s)`)
  if (!APPLY) console.log('Re-run with --apply to write changes.')
}

main().catch(e => {
  console.error('Failed:', e.message)
  process.exit(1)
})
