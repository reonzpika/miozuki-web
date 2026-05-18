import fs from 'node:fs'
import path from 'node:path'

const envPath = path.resolve('.env.local')
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const STOREFRONT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

// Fetch all products to map external_id -> handle
const res = await fetch(`https://${STOREFRONT_DOMAIN}/api/2024-10/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
  },
  body: JSON.stringify({
    query: `{ products(first: 100) { edges { node { id handle title } } } }`,
  }),
})
const j = await res.json()
const products = j.data.products.edges.map(e => e.node)

const reviewed = ['9330276663551', '9339256733951']
console.log(`--- Mapping reviewed products to handles ---`)
for (const r of reviewed) {
  const p = products.find(p => p.id.endsWith(`/${r}`))
  console.log(`${r} -> handle=${p?.handle || 'NOT FOUND'} title=${p?.title || ''}`)
}

// Hit those PDPs and verify reviews block shows actual review text
for (const r of reviewed) {
  const p = products.find(p => p.id.endsWith(`/${r}`))
  if (!p) continue
  const html = await (await fetch(`http://localhost:3000/products/${p.handle}`)).text()
  const reviewerNameInHtml = /Mandy|Wendy|Ling|Sarah|Emma|Jacqueline|Aimee|Bethany|Maria|Jen|Sophie|Lisa|Anna/.test(html)
  const hasReviewSection = /reviews?-section|customer-reviews|class="[^"]*review/i.test(html)
  const ratingStars = (html.match(/aria-label="[^"]*[0-5]\s*star/gi) || []).length
  console.log(`\n=== /products/${p.handle} ===`)
  console.log(`  reviewer name in HTML: ${reviewerNameInHtml}`)
  console.log(`  review section markup: ${hasReviewSection}`)
  console.log(`  star aria labels: ${ratingStars}`)
  // search for actual review body fragments
  if (html.includes('moissanite earrings')) console.log('  -> review body fragment "moissanite earrings" found')
  if (html.includes('sparkle beautifully')) console.log('  -> review body fragment "sparkle beautifully" found')
  // rating summary
  const ratingSummary = html.match(/(\d\.\d)\s*(?:out of 5|\/\s*5|stars?)/i)
  if (ratingSummary) console.log(`  -> rating summary text: "${ratingSummary[0]}"`)
}
