import fs from 'node:fs'

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

const HANDLES = ['arc-moissanite-half-eternity-ring']

for (const h of HANDLES) {
  const res = await fetch(`https://${DOMAIN}/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({
      query: `query($handle: String!) { product(handle: $handle) { id handle title description } }`,
      variables: { handle: h },
    }),
  })
  const j = await res.json()
  const p = j.data?.product
  if (!p) { console.log(`${h}: NOT FOUND`); continue }
  console.log(`\n=== ${p.title} (${p.handle}) ===`)
  console.log(`description:\n${p.description}\n`)
  console.log(`has OLD: ${p.description?.includes('soft curve across sterling silver, reflecting a calm')}`)
  console.log(`has NEW: ${p.description?.includes('curve across sterling silver band, reflecting a classy')}`)
}
