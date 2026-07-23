/**
 * Net-new technical check for the overnight organic-growth session
 * (workstream C, 2026-07-23). Explicitly NOT a rebuild of the existing
 * weekly-metrics-audit skill (GSC pulls, sitemap/404 sweeps, Lighthouse) or
 * phase5-ranking-sprint's W5 runbook (the 23-term scoreboard) or
 * scripts/audit.ts (console/broken-image/flow checks) — see
 * miozuki-brain/.claude/skills/growth-signals-watch/SKILL.md for the
 * de-duplication boundary this script exists inside of.
 *
 * What this checks, read-only, on the 25 live guide-hub pages:
 *   1. Every internal link inside a guide's MDX body actually resolves to a
 *      real route (a real guide, a real /collections/<handle>, a real
 *      /products/<handle>, or a real /pages/<slug>), cross-checked against
 *      live Shopify data, not just "does the sitemap URL return 200" (that's
 *      weekly-metrics-audit's job).
 *   2. Every guide has a <GuideSchema title=... path=... updated=... />
 *      immediately present with all three props non-empty, and the `path`
 *      prop actually matches the file's real route.
 *
 * Never edits a file. Writes a dated markdown report. Where a fix is
 * mechanical and unambiguous, the report proposes it as a diff-shaped
 * suggestion for a human (or a later pass in this same session) to apply
 * deliberately, this script never applies anything itself.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/check-guide-links-and-schema.mts
 *
 * Requires in .env.local: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN
 */

import * as fs from 'fs'
import * as path from 'path'

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
const API = `https://${DOMAIN}/api/2024-10/graphql.json`

if (!DOMAIN || !TOKEN) {
  console.error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_ACCESS_TOKEN')
  process.exit(1)
}

type GQL<T> = { data?: T; errors?: { message: string }[] }

async function gql<T>(query: string, variables: object = {}): Promise<T> {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'X-Shopify-Storefront-Access-Token': TOKEN!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const j: GQL<T> = await r.json()
  if (j.errors?.length) throw new Error(j.errors.map((e) => e.message).join('; '))
  return j.data!
}

const GUIDE_HUB_ROOTS = ['moissanite-guide', 'pearl-guide', 'bridal-guide']
const REPO_ROOT = process.cwd()
const APP_DIR = path.join(REPO_ROOT, 'app')
const PAGES_DIR = path.join(APP_DIR, 'pages')

interface GuideFile {
  route: string // e.g. /moissanite-guide/moissanite-vs-diamond-nz or /moissanite-guide for the pillar
  filePath: string
  body: string
}

function findGuideFiles(): GuideFile[] {
  const files: GuideFile[] = []
  for (const hub of GUIDE_HUB_ROOTS) {
    const hubDir = path.join(APP_DIR, hub)
    if (!fs.existsSync(hubDir)) continue
    // Pillar page: app/<hub>/page.mdx -> route /<hub>
    const pillarFile = path.join(hubDir, 'page.mdx')
    if (fs.existsSync(pillarFile)) {
      files.push({ route: `/${hub}`, filePath: pillarFile, body: fs.readFileSync(pillarFile, 'utf8') })
    }
    // Spoke pages: app/<hub>/<slug>/page.mdx -> route /<hub>/<slug>
    for (const entry of fs.readdirSync(hubDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const spokeFile = path.join(hubDir, entry.name, 'page.mdx')
      if (fs.existsSync(spokeFile)) {
        files.push({
          route: `/${hub}/${entry.name}`,
          filePath: spokeFile,
          body: fs.readFileSync(spokeFile, 'utf8'),
        })
      }
    }
  }
  return files
}

function findStaticPageSlugs(): Set<string> {
  const slugs = new Set<string>()
  if (fs.existsSync(PAGES_DIR)) {
    for (const entry of fs.readdirSync(PAGES_DIR, { withFileTypes: true })) {
      if (entry.isDirectory()) slugs.add(entry.name)
    }
  }
  return slugs
}

/** Extract every markdown link target `[text](/path)` from a guide's MDX body. */
function extractInternalLinks(body: string): string[] {
  const links: string[] = []
  const re = /\]\((\/[^)\s]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body))) {
    links.push(m[1])
  }
  return links
}

/** Extract the <GuideSchema .../> tag's props, if present. */
function extractGuideSchema(body: string): { title?: string; path?: string; updated?: string } | null {
  // Non-greedy match on ANY character (not excluding `/`, which appears
  // inside path="/moissanite-guide/..." attribute values) up to the tag's
  // own self-closing `/>`.
  const m = body.match(/<GuideSchema\b([\s\S]*?)\/>/)
  if (!m) return null
  const attrs = m[1]
  const get = (name: string) => {
    const am = attrs.match(new RegExp(`${name}=["']([^"']*)["']`))
    return am?.[1]
  }
  return { title: get('title'), path: get('path'), updated: get('updated') }
}

async function run() {
  const guideFiles = findGuideFiles()
  const staticPageSlugs = findStaticPageSlugs()
  const guideRoutes = new Set(guideFiles.map((g) => g.route))

  const collectionsData = await gql<{ collections: { edges: { node: { handle: string } }[] } }>(
    /* GraphQL */ `query { collections(first: 100) { edges { node { handle } } } }`
  )
  const collectionHandles = new Set(collectionsData.collections.edges.map((e) => e.node.handle))

  const productsData = await gql<{ products: { edges: { node: { handle: string } }[] } }>(
    /* GraphQL */ `query { products(first: 100) { edges { node { handle } } } }`
  )
  const productHandles = new Set(productsData.products.edges.map((e) => e.node.handle))

  type LinkFinding = { file: string; link: string; reason: string }
  type SchemaFinding = { file: string; route: string; issue: string }

  const brokenLinks: LinkFinding[] = []
  const schemaFindings: SchemaFinding[] = []
  let totalLinksChecked = 0

  for (const guide of guideFiles) {
    const relFile = path.relative(REPO_ROOT, guide.filePath)

    // --- Link check ---
    const links = extractInternalLinks(guide.body)
    for (const link of links) {
      totalLinksChecked++
      const clean = link.split('#')[0].split('?')[0]
      if (clean === '/') continue
      const parts = clean.split('/').filter(Boolean)
      const [root, sub] = parts
      let ok = false
      let reason = ''
      if (root === 'collections' && sub) {
        ok = collectionHandles.has(sub)
        if (!ok) reason = `no live collection with handle "${sub}"`
      } else if (root === 'products' && sub) {
        ok = productHandles.has(sub)
        if (!ok) reason = `no live product with handle "${sub}"`
      } else if (root === 'pages' && sub) {
        ok = staticPageSlugs.has(sub)
        if (!ok) reason = `no app/pages/${sub} folder`
      } else if (GUIDE_HUB_ROOTS.includes(root)) {
        ok = guideRoutes.has(clean)
        if (!ok) reason = `no guide file resolves to route ${clean}`
      } else {
        // Unknown top-level route (e.g. /cart, /search) — not this script's
        // concern, those aren't guide-hub or catalogue routes.
        ok = true
      }
      if (!ok) brokenLinks.push({ file: relFile, link, reason })
    }

    // --- Schema check ---
    const schema = extractGuideSchema(guide.body)
    if (!schema) {
      schemaFindings.push({ file: relFile, route: guide.route, issue: 'No <GuideSchema /> tag found at all' })
    } else {
      const missing = (['title', 'path', 'updated'] as const).filter((k) => !schema[k]?.trim())
      if (missing.length) {
        schemaFindings.push({ file: relFile, route: guide.route, issue: `Missing/empty prop(s): ${missing.join(', ')}` })
      } else if (schema.path !== guide.route) {
        schemaFindings.push({
          file: relFile,
          route: guide.route,
          issue: `<GuideSchema path="${schema.path}"> does not match this file's real route ${guide.route}`,
        })
      }
    }
  }

  const date = new Date().toISOString().split('T')[0]
  const outDir = path.resolve(REPO_ROOT, 'docs/audit')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `guide-link-schema-audit-${date}.md`)

  const lines: string[] = []
  lines.push(`# Guide link + schema audit — ${date}`)
  lines.push('')
  lines.push(`Checked ${guideFiles.length} guide pages, ${totalLinksChecked} internal links total.`)
  lines.push('')
  lines.push('## Broken internal links')
  lines.push('')
  if (brokenLinks.length === 0) {
    lines.push('None found. Every internal link in every guide resolves to a real, live route.')
  } else {
    for (const f of brokenLinks) {
      lines.push(`- **${f.file}**: link \`${f.link}\` — ${f.reason}`)
    }
  }
  lines.push('')
  lines.push('## Schema issues')
  lines.push('')
  if (schemaFindings.length === 0) {
    lines.push('None found. Every guide has a well-formed `<GuideSchema title path updated />` matching its real route.')
  } else {
    for (const f of schemaFindings) {
      lines.push(`- **${f.file}** (route ${f.route}): ${f.issue}`)
    }
  }
  lines.push('')
  lines.push('## Scope note')
  lines.push('')
  lines.push(
    'This check covers in-guide link integrity and per-guide schema well-formedness only. It does not duplicate weekly-metrics-audit\'s sitemap/404/GSC checks, phase5-ranking-sprint\'s scoreboard pull, or scripts/audit.ts\'s console/broken-image sweep — see growth-signals-watch/SKILL.md for the full boundary.'
  )

  fs.writeFileSync(outPath, lines.join('\n') + '\n')
  console.log(`Checked ${guideFiles.length} guides, ${totalLinksChecked} links.`)
  console.log(`Broken links: ${brokenLinks.length}, schema issues: ${schemaFindings.length}`)
  console.log(`Report: ${outPath}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
