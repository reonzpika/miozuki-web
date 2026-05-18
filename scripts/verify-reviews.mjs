import fs from 'node:fs'
import path from 'node:path'

// Load .env.local
const envPath = path.resolve('.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const token = process.env.JUDGE_ME_PRIVATE_TOKEN
const SHOP = 'nassuu-px.myshopify.com'
const BASE = 'https://judge.me/api/v1'

if (!token) { console.log('NO TOKEN'); process.exit(1) }

console.log('--- All reviews (first 250) ---')
const r = await fetch(`${BASE}/reviews?api_token=${token}&shop_domain=${SHOP}&per_page=250`)
console.log(`status=${r.status}`)
const j = await r.json()
const reviews = j.reviews || []
console.log(`total reviews returned: ${reviews.length}`)

// per-product breakdown
const perProduct = {}
for (const rev of reviews) {
  const k = rev.product_external_id
  perProduct[k] = perProduct[k] || { count: 0, sum: 0 }
  perProduct[k].count += 1
  perProduct[k].sum += rev.rating
}
const products = Object.entries(perProduct).map(([k, v]) => ({ id: k, count: v.count, avg: (v.sum/v.count).toFixed(2) }))
products.sort((a,b) => b.count - a.count)
console.log(`products with reviews: ${products.length}`)
products.slice(0, 15).forEach(p => console.log(`  product_external_id=${p.id} count=${p.count} avg=${p.avg}`))

// Sample one review to inspect shape
if (reviews.length > 0) {
  const r = reviews[0]
  console.log('\n--- Sample review (first one) ---')
  console.log(JSON.stringify({
    id: r.id, rating: r.rating, title: r.title?.slice(0, 80), body: r.body?.slice(0, 120),
    reviewer: r.reviewer?.name, product_external_id: r.product_external_id,
    created_at: r.created_at, verified: r.verified, hidden: r.hidden,
  }, null, 2))
}

// Now probe one PDP for the reviews section
const handle = 'classic-moissanite-solitaire-ring'
console.log(`\n--- PDP render check: /products/${handle} ---`)
const pdpRes = await fetch(`http://localhost:3000/products/${handle}`)
const html = await pdpRes.text()
const hasReviewsSection = /review/i.test(html)
const reviewMentions = (html.match(/(reviews?|rating|star)/gi) || []).length
console.log(`status=${pdpRes.status} reviewsSectionPresent=${hasReviewsSection} keywordCount=${reviewMentions}`)

// Look for ratings shown
const ratingNumMatches = html.match(/\b([0-5]\.\d)\b/g) || []
console.log(`numeric ratings rendered: ${ratingNumMatches.slice(0, 5).join(', ')}`)
